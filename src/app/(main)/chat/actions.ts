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

  try {
    const { error } = await supabase.from("connections").insert({
      product_id: productId,
      requester_id: user.id,
      seller_id: sellerId,
      status: "pending",
    });

    if (error) {
      // Handles cases where a request already exists
      if (error.code === "23505") {
        console.warn("Connection request already exists.");
        return { success: true, message: "Request already sent." };
      }
      throw error;
    }

    revalidatePath(`/product/${productId}`);
    return { success: true, message: "Request sent successfully!" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown database error occurred.";
    console.error("Error creating connection:", errorMessage);
    return { success: false, message: "Failed to send request." };
  }
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

  // 3. Send the automatic first message from the BUYER.
  const productTitle = connection.products?.title || "this item";
  const defaultMessage = `Hi! I'm interested in buying your product: "${productTitle}"`;

  const { error: messageError } = await supabase.from("messages").insert({
    content: defaultMessage,
    connection_id: connectionId,
    sender_id: connection.requester_id, // The message is FROM the buyer.
  });

  if (messageError) throw messageError;

  // 4. Create a notification for the buyer that their request was accepted.
  const messageRecord = await supabase.from("messages").select("id").eq("connection_id", connectionId).single();
  await supabase.from("notifications").insert({
    message_id: messageRecord.data!.id,
    receiver_id: connection.requester_id,
    connection_id: connectionId,
  });
  // Send OneSignal notification to the buyer
  await sendOneSignalNotification({
    userId: connection.requester_id,
    title: "Request Accepted!",
    message: `Your request for '${productTitle}' was accepted. You can now chat with the seller!`,
    connectionId: connectionId,
  });

  // Revalidate paths to update UI for both users
  revalidatePath(`/profile`);
  revalidatePath(`/chat/${connectionId}`);
  // Also revalidate the product page so approval is shown
  if (connection?.product_id) {
    revalidatePath(`/product/${connection.product_id}`);
  }

  return { success: true, connectionId: connection.id };
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

  // (Optional but recommended: Add a check here to only allow messages if connection status is 'accepted')

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

