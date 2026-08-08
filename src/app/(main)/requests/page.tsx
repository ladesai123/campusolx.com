import { createClient } from "@/lib/server";
import RequestsClient from "./RequestsClient";
import { redirect } from "next/navigation";
import type { RequestWithProfile } from "@/lib/types";

export const metadata = {
  title: "Wanted Items • CampusOlx",
  description: "See what other students are looking for, or post your own request.",
};

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile for university
  const { data: profile } = await supabase
    .from("profiles")
    .select("university")
    .eq("id", user.id)
    .single();

  const university = profile?.university || "";

  // Fetch active requests for the university (limit 30)
  const { data: rawRequests } = await supabase
    .from("requests")
    .select("id, title, max_budget, view_count, whatsapp_number, user_id, status, is_hidden, created_at, profiles!inner(id, name, university, profile_picture_url)")
    .eq("profiles.university", university)
    .eq("status", "active")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(30);

  const activeRequests = (rawRequests as unknown as RequestWithProfile[]) || [];

  return (
    <RequestsClient 
      requests={activeRequests} 
      currentUserId={user.id} 
      university={university}
    />
  );
}
