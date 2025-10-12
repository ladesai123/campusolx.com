"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

// This is the Server Action that handles updating an existing product.
export async function updateProductAction(formData: FormData) {
  // 1. Extract all the updated data from the submitted form.
  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const mrp = formData.get("mrp") ? parseInt(formData.get("mrp") as string, 10) : null;
  const category = formData.get("category") as string;
  const availability = formData.get("availability") as string | null;
  let available_from: string | null = null;
  let status: string = "available";
  if (availability === "future") {
    available_from = formData.get("available_date") as string;
    // If the date is empty, treat as not set
    if (!available_from || available_from.trim() === "") {
      available_from = null;
    } else {
      status = "pending_reservation";
    }
  }

  const isNegotiable = formData.get("is_negotiable") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Security check: Ensure a user is logged in.
  if (!user) {
    throw new Error("You must be authenticated to edit a product.");
  }

  // 2. Perform the database update operation.
  const updateFields: Record<string, any> = {
    title,
    description,
    price: isNaN(price) ? 0 : price,
    mrp: mrp && !isNaN(mrp) ? mrp : null,
    category,
    status,
    available_from: availability === "future" ? available_from : null,
    is_negotiable: isNegotiable,
  };

  const { error } = await supabase
    .from("products")
    .update(updateFields)
    .eq("id", parseInt(productId, 10))
    .eq("seller_id", user.id); // Crucial security check: ensures only the owner can edit their item.

  if (error) {
    console.error("Error updating product:", error);
    // In a real app, you might redirect with an error message.
    return;
  }

  // 3. Invalidate caches and redirect.
  // This tells Next.js to re-fetch the data for these pages on the next visit,
  // ensuring the user sees the updated information.

  revalidatePath(`/product/${productId}`);
  revalidatePath("/profile");
  revalidatePath("/home");

  // No redirect here; let the client handle navigation after showing toast.
}

