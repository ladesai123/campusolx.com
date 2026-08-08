import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { Profile, ProductWithProfile, RequestWithProfile } from "@/lib/types";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile (with self-healing)
  const profileRes = await supabase.from("profiles").select("id, name, university, profile_picture_url").eq("id", user.id).single();
  let profile = profileRes.data as Profile | null;

  if (!profile) {
    const userEmail = user.email?.trim().toLowerCase() || "";
    const regNoMatch = userEmail.match(/^(\d+)/);
    const regNo = regNoMatch ? regNoMatch[1] : null;
    let university = "SASTRA University, Thanjavur";
    if (regNo) {
      const firstDigit = regNo.charAt(0);
      if (firstDigit === "2") university = "SASTRA University, Kumbakonam";
      else if (firstDigit === "3") university = "SASTRA University, Chennai";
    }
    const { data: newProfile } = await supabase.from("profiles").upsert({
      id: user.id,
      name: user.user_metadata?.full_name || userEmail.split("@")[0],
      university,
      profile_picture_url: user.user_metadata?.avatar_url || "",
      email: userEmail,
      acquisition_source: "google_resilient",
    }).select().single();
    profile = newProfile as Profile | null;
  }

  // Fetch initial batch of products + profile count + saved items + active requests in parallel
  const [
    { data: rawProducts }, 
    { count: studentCount }, 
    { data: savedItemsData }, 
    { data: rawRequests, error: reqError }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, title, price, mrp, category, image_urls, status, available_from, is_negotiable, bumped_at, created_at, view_count, seller_id, is_hidden, profiles!inner(id, name, university, profile_picture_url)')
      .eq('profiles.university', profile?.university || '')
      .eq('is_hidden', false)
      .order('status', { ascending: true })
      .order('bumped_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, 23),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('saved_items').select('product_id').eq('user_id', user.id),
    supabase
      .from('requests')
      .select('id, title, max_budget, view_count, whatsapp_number, user_id, status, is_hidden, profiles!inner(id, name, university, profile_picture_url)')
      .eq('profiles.university', profile?.university || '')
      .eq('status', 'active')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  let products = (rawProducts as unknown as ProductWithProfile[]) || [];

  const savedProductIds = new Set((savedItemsData || []).map(s => s.product_id));
  
  if (reqError) {
    console.error("Error fetching requests:", reqError);
  }
  
  const activeRequests = (rawRequests as unknown as RequestWithProfile[]) || [];

  return (
    <main>
      <HomeClient
        products={products}
        university={profile?.university || 'SASTRA University'}
        studentCount={studentCount ?? 0}
        initialSavedIds={Array.from(savedProductIds)}
        activeRequests={activeRequests}
        currentUserId={user.id}
      />
    </main>
  );
}
