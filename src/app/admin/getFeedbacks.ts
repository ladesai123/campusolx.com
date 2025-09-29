"use server";
import { createClient } from "@/lib/server";

export async function getFeedbacks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, name, year, experience, consent, status")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
