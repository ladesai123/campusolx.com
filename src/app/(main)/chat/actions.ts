"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { sendOneSignalNotification } from "@/lib/sendOneSignalNotification";

export async function createConnectionAction(
  productId: number,
  sellerId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "User is not authenticated." };
  if (user.id === sellerId)
    return { success: false, message: "You cannot start a chat about your own item." };

  let connectionInsert = null;
  let connectionError = null;
  try {
    const { data, error } = await supabase.from("connections").insert({
      product_id: productId,
      requester_id: user.id,
      seller_id: sellerId,
      status: "pending",
    }).select().single();
    connectionInsert = data;
    if (error) {
      if (error.code === "23505") {
        console.warn("Connection request already exists.");
        return { success: true, message: "Request already sent." };
      }
      connectionError = error;
    }
  } catch (error) {
    connectionError = error;
  }

  if (connectionError || !connectionInsert) {
    let errorMessage = "Could not create connection. Please try again later.";
    if (connectionError && typeof connectionError === "object" && "message" in connectionError) {
      errorMessage = (connectionError as Error).message || errorMessage;
    }
    console.error("Error creating connection:", errorMessage);
    return { success: false, message: "Failed to send request. Please try again later." };
  }

  // If connection was created, proceed with message/notification, but don't fail the whole request if these fail
  let productTitle = "your product";
  if (connectionInsert?.product_id) {
    productTitle = "your product";
  }
  const defaultMessage = `Hi! I'm interested in buying your product: \"${productTitle}\"`;
  let messageError = null;
  let notificationError = null;
  try {
    const { error } = await supabase.from("messages").insert({
      content: defaultMessage,
      connection_id: connectionInsert.id,
      sender_id: user.id,
    });
    if (error) messageError = error;
  } catch (err) {
    messageError = err;
  }
  try {
    await sendOneSignalNotification({
      userId: sellerId,
      title: "New Message",
      message: defaultMessage,
      connectionId: connectionInsert?.id ?? productId,
    });
  } catch (err) {
    notificationError = err;
  }
  revalidatePath(`/product/${productId}`);
  if (messageError && notificationError) {
    console.warn("Connection created, but both message and notification failed:", messageError, notificationError);
    return { success: true, message: "Connection sent, but there was a problem delivering your message and notification. Please check your chat or try again." };
  } else if (messageError) {
    console.warn("Connection created, but message failed:", messageError);
    return { success: true, message: "Connection sent, but your initial message could not be delivered. Please try sending a message again." };
  } else if (notificationError) {
    console.warn("Connection created, but notification failed:", notificationError);
    return { success: true, message: "Connection sent successfully. Once the seller accepts, you will be notified. (Notification delivery issue.)" };
  }
  return { success: true, message: "Connection sent successfully. Once the seller accepts, you will be notified." };
}

export async function acceptConnectionAction(connectionId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // 1. Fetch the connection to get details and verify the current user is the seller.
  const { data: connection, error: connError } = await supabase
    .from("connections")
    .select("*, products(title)")
    .eq("id", connectionId)
    .eq("seller_id", user.id) // Security check!
    .single();

  if (connError || !connection) {
    throw new Error("Connection not found or you are not authorized to accept it.");
  }

  // 2. Update the connection status to 'accepted'.
  const { error: updateError } = await supabase
    .from("connections")
    .update({ status: "accepted" })
    .eq("id", connectionId);

  if (updateError) throw updateError;

  // 3. Only insert the initial message if it does not already exist for this connection
  const productTitle = connection.products?.title || "this item";
  const defaultMessage = `Hi! I'm interested in buying your product: "${productTitle}".`;
  const { data: existingMessage } = await supabase
    .from("messages")
    .select("id")
    .eq("connection_id", connectionId)
    .eq("sender_id", connection.requester_id)
    .eq("content", defaultMessage)
    .single();

  if (!existingMessage) {
    const { error: messageError } = await supabase.from("messages").insert({
      content: defaultMessage,
      connection_id: connectionId,
      sender_id: connection.requester_id,
    });
    if (messageError) throw messageError;
  }

  // 4. Send notification to buyer that seller accepted (do NOT insert into chat)
  console.log('🚀 CHAT ACTIONS: Sending accept notification to buyer:', connection.requester_id);
  await sendOneSignalNotification({
    userId: connection.requester_id,
    title: "Seller Accepted Your Request!",
    message: `Seller accepted your request for '${productTitle}'. You can now chat and fix a deal!`,
    connectionId: connectionId,
  });
  console.log('🚀 CHAT ACTIONS: Accept notification sent successfully');

  // Revalidate paths to update UI for both users
  revalidatePath(`/profile`);
  revalidatePath(`/chat/${connectionId}`);
  if (connection?.product_id) {
    revalidatePath(`/product/${connection.product_id}`);
  }

  return { success: true, message: "Connection accepted." };
}

export async function sendMessage(receiverId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const content = formData.get("content") as string;
  const connectionId = formData.get("connectionId") as string;

  if (!content || !connectionId || !receiverId) {
    throw new Error("Missing required form data to send message and notify.");
  }


  // Fetch connection status
  const { data: connection, error: connError } = await supabase
    .from("connections")
    .select("status, requester_id")
    .eq("id", parseInt(connectionId))
    .single();

  if (connError || !connection) {
    throw new Error("Connection not found.");
  }

  // If requester is sending and status is not 'accepted', only allow the initial message
  if (user.id === connection.requester_id && connection.status !== "accepted") {
    // Only allow the default initial message
    const defaultMessage = `Hi! I'm interested in buying your product:`;
    if (!content.startsWith(defaultMessage)) {
      throw new Error("You cannot send more messages until the seller accepts your request.");
    }
  }

  // If not accepted and not requester, block
  if (user.id !== connection.requester_id && connection.status !== "accepted") {
    throw new Error("Chat is not available until the seller accepts the request.");
  }

  const { data: messageData, error: messageError } = await supabase
    .from("messages")
    .insert({
      content,
      connection_id: parseInt(connectionId),
      sender_id: user.id,
    })
    .select()
    .single();

  if (messageError) {
    console.error("Error sending message:", messageError);
    return;
  }

  // Send OneSignal notification to the receiver
  await sendOneSignalNotification({
    userId: receiverId,
    title: "New Message",
    message: `You have a new message: "${content}"`,
    connectionId: parseInt(connectionId),
  });

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({ message_id: messageData.id, receiver_id: receiverId, connection_id: parseInt(connectionId) });

  if (notificationError) {
    console.error("Error creating notification:", notificationError);
  }

  revalidatePath(`/chat/${connectionId}`);
}

export async function updateUserActivity() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", user.id);
  }
}

