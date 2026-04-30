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

  // Fetch active requests for the university
  const { data: rawRequests } = await supabase
    .from("requests")
    .select("*, profiles!inner(id, name, university, profile_picture_url)")
    .eq("profiles.university", university)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const activeRequests = (rawRequests as unknown as RequestWithProfile[]) || [];

  return (
    <RequestsClient 
      requests={activeRequests} 
      currentUserId={user.id} 
      university={university}
    />
  );
}
