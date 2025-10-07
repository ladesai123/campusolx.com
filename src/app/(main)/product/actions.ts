"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
// We need the regular `createClient` to create our special admin client
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/server";
import { sendOneSignalNotification } from '@/lib/sendOneSignalNotification';

export async function connectWithSeller(formData: FormData) {
  const productId = parseInt(formData.get("productId") as string, 10);
  const sellerId = formData.get("sellerId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // First, check if a connection already exists to prevent duplicates.
  const { data: existingConnection } = await supabase
    .from("connections")
    .select("id")
    .eq("product_id", productId)
    .eq("requester_id", user.id)
    .single();

  if (existingConnection) {
    return redirect(`/product/${productId}?message=Connection request already sent.`);
  }

  // --- AUTOMATE FIRST MESSAGE LOGIC ---

  // 1. Get the product title to create the meaningful message.
  const { data: product } = await supabase.from("products").select("title").eq("id", productId).single();

  if (!product) {
    return redirect(`/product/${productId}?error=Product not found.`);
  }
  const defaultMessage = `Hi! I'm interested in buying your product: "${product.title}".`;

  // 2. Create the connection request and get its ID back.
  const { data: newConnection, error: connectionError } = await supabase
    .from("connections")
    .insert({
      product_id: productId,
      seller_id: sellerId,
      requester_id: user.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (connectionError || !newConnection) {
    console.error("Error creating connection:", connectionError);
    return redirect(`/product/${productId}?error=Could not send request.`);
  }

  // Send OneSignal notification to the seller with the real product name
  await sendOneSignalNotification({
    userId: sellerId,
    title: 'New Connection Request',
    message: `You have a new connection request for your product: "${product.title}"`,
  });

  // 3. Insert the default message using a secure admin client.
  // This allows us to bypass the 'accepted' status check for this one initial message.
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: messageData, error: messageError } = await supabaseAdmin.from("messages").insert({
    connection_id: newConnection.id,
    sender_id: user.id,
    content: defaultMessage,
  }).select().single();

  if (messageError) {
    console.error("Error creating default message:", messageError);
    // Even if the message fails, the connection request was successful, so we continue.
  } else if (messageData) {
    // Step 2: Send notification to seller about the new message
    await sendOneSignalNotification({
      userId: sellerId,
      title: 'New Message from Buyer',
      message: defaultMessage,
      connectionId: newConnection.id,
    });
  }

  revalidatePath(`/product/${productId}`);
  redirect(`/product/${productId}?message=Connection request sent successfully!`);
}


