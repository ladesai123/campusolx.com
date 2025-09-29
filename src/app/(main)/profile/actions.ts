"use server";

import { revalidatePath } from "next/cache";

// (Removed updateDisplayName and all display_name logic)
// --- THIS IS THE FIX (Part 1) ---
// We now import our new, modern, and correct server-side helper.
import { createClient } from "@/lib/server";
import { deleteCloudinaryImage } from '@/lib/cloudinary';

// This action updates a connection's status AND sends the automatic first message.
export async function acceptConnection(connectionId: number) {
  // --- THIS IS THE FIX (Part 2) ---
  // We call our new helper to create a Supabase client.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  // 1. Fetch the connection to verify the current user is the seller.
  const { data: connection, error: connError } = await supabase
    .from("connections")
    .select("*, products(title)")
    .eq("id", connectionId)
    .eq("seller_id", user.id)
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

  // 3. Send the automatic first message FROM THE BUYER, as you designed.
  const productTitle = connection.products?.title || "this item";
  const defaultMessage = `Hi! I'm interested in buying your product "${productTitle}"`;

  const { data: messageData, error: messageError } = await supabase
    .from("messages")
    .insert({
      content: defaultMessage,
      connection_id: connectionId,
      sender_id: connection.requester_id, // The message is FROM the buyer (requester).
    })
    .select("id")
    .single();

  if (messageError) throw messageError;

  // 4. Create a notification for the buyer that their request was accepted.
  await supabase.from("notifications").insert({
    message_id: messageData.id,
    receiver_id: connection.requester_id,
  });

  revalidatePath("/profile");
  revalidatePath(`/chat/${connectionId}`);
  
  return { success: true, connectionId: connection.id };
}

// This action deletes a connection request.
export async function declineConnection(connectionId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .eq("seller_id", user.id);

  if (error) console.error("Error declining connection:", error);
  revalidatePath("/profile");
}

// This action toggles a product's status.
export async function toggleProductStatus(productId: number, currentStatus: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Instead of toggling, set the status to the value passed in (currentStatus argument)
  const { error } = await supabase
    .from("products")
    .update({ status: currentStatus })
    .eq("id", productId)
    .eq("seller_id", user.id);

  if (error) console.error("Error updating product status:", error);
  revalidatePath("/profile");
}

// This action permanently deletes a product.
export async function deleteProduct(productId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get product to fetch image URLs
  const { data: product } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", productId)
    .eq("seller_id", user.id)
    .single();

  // Delete images from Cloudinary
  if (product?.image_urls && Array.isArray(product.image_urls)) {
    for (const url of product.image_urls) {
      // Extract publicId from URL (Cloudinary format: .../v1234/<publicId>.<ext>)
      const match = url.match(/\/([^\/]+)\.[a-zA-Z0-9]+$/);
      if (match && match[1]) {
        await deleteCloudinaryImage(match[1]);
      }
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("seller_id", user.id);

  if (error) console.error("Error deleting product:", error);
  revalidatePath("/profile");
}
