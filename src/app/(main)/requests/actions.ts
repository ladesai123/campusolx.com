"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function postRequestAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const budgetStr = formData.get("max_budget") as string;
  const max_budget = budgetStr ? parseInt(budgetStr, 10) : null;
  const whatsapp_number = formData.get("whatsapp_number") as string;

  if (!title || title.trim().length < 3) {
    throw new Error("Title must be at least 3 characters");
  }

  if (!whatsapp_number || whatsapp_number.trim().length !== 10) {
    throw new Error("A valid 10-digit WhatsApp number is required");
  }

  // 60 day expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60);

  const { error } = await supabase.from("requests").insert({
    user_id: user.id,
    title,
    max_budget,
    whatsapp_number,
    status: 'active',
    expires_at: expiresAt.toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/requests");
  revalidatePath("/home");
  return { success: true };
}

export async function deleteRequestAction(requestId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("requests")
    .delete()
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/requests");
  revalidatePath("/profile");
  revalidatePath("/home");
  return { success: true };
}

export async function fulfillRequestAction(requestId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("requests")
    .update({ status: 'fulfilled' })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/requests");
  revalidatePath("/profile");
  revalidatePath("/home");
  return { success: true };
}

export async function editRequestAction(requestId: number, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const budgetStr = formData.get("max_budget") as string;
  const max_budget = budgetStr ? parseInt(budgetStr, 10) : null;
  const whatsapp_number = formData.get("whatsapp_number") as string;

  if (!title || title.trim().length < 3) {
    throw new Error("Title must be at least 3 characters");
  }

  if (!whatsapp_number || whatsapp_number.trim().length !== 10) {
    throw new Error("A valid 10-digit WhatsApp number is required");
  }

  const { error } = await supabase
    .from("requests")
    .update({ title, max_budget, whatsapp_number } as any)
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/requests");
  revalidatePath("/profile");
  revalidatePath("/home");
  return { success: true };
}
