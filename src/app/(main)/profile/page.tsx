import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import ProfileClient from "./ProfileClient";
import { Database } from "@/lib/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
import type { RequestWithProfile } from "@/lib/types";

export type ProductAnalytics = {
  product_id: number;
  connections_count: number;
  messages_count: number;
};

export type ConnectionWithPreview = {
  id: number;
  status: string | null;
  created_at: string;
  product: { id: number; title: string | null; image_urls: string[] | null } | null;
  requester: Profile | null;
  seller: Profile | null;
  latestMessage: { content: string | null; created_at: string | null } | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profilePromise = supabase.from("profiles").select("*").eq("id", user.id).single();

  const userProductsPromise = supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const connectionsPromise = supabase
    .from("connections")
    .select(`id, status, created_at, product:products!inner(id, title, image_urls), requester:profiles!connections_requester_id_fkey(*), seller:profiles!connections_seller_id_fkey(*)`)
    .or(`seller_id.eq.${user.id},requester_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const savedItemsPromise = supabase
    .from("saved_items")
    .select(`product:products (*, profiles!inner(*))`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const userRequestsPromise = supabase
    .from("requests")
    .select("*, profiles!inner(id, name, university, profile_picture_url)")
    .eq("user_id", user.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  // Fetch connections for this seller's products to compute analytics
  const productConnectionsPromise = supabase
    .from("connections")
    .select("id, product_id")
    .eq("seller_id", user.id);

  const [
    profileRes,
    { data: userProducts },
    { data: connections, error: connError },
    { data: savedItemsData },
    { data: userRequestsRaw },
    { data: productConnections },
  ] = await Promise.all([
    profilePromise,
    userProductsPromise,
    connectionsPromise,
    savedItemsPromise,
    userRequestsPromise,
    productConnectionsPromise,
  ]);

  let profile = profileRes.data as Profile | null;

  if (!profile) {
    const userEmail = user.email?.trim().toLowerCase() || "";
    const regNoMatch = userEmail.match(/^(\d+)/);
    const regNo = regNoMatch ? regNoMatch[1] : null;
    let university = "SASTRA University, Thanjavur";
    if (regNo) {
      const firstDigit = regNo.charAt(0);
      if (firstDigit === "1") university = "SASTRA University, Thanjavur";
      else if (firstDigit === "2") university = "SASTRA University, Kumbakonam";
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

  // Build analytics per product
  let productAnalytics: ProductAnalytics[] = [];
  if (productConnections && productConnections.length > 0) {
    const connectionIds = productConnections.map(c => c.id);
    const { data: messages } = await supabase
      .from("messages")
      .select("connection_id")
      .in("connection_id", connectionIds);

    const messageCountByConnection = new Map<number, number>();
    (messages || []).forEach(m => {
      messageCountByConnection.set(m.connection_id, (messageCountByConnection.get(m.connection_id) || 0) + 1);
    });

    const analyticsMap = new Map<number, ProductAnalytics>();
    productConnections.forEach(conn => {
      const pid = conn.product_id;
      const existing = analyticsMap.get(pid) || { product_id: pid, connections_count: 0, messages_count: 0 };
      existing.connections_count += 1;
      existing.messages_count += (messageCountByConnection.get(conn.id) || 0);
      analyticsMap.set(pid, existing);
    });
    productAnalytics = Array.from(analyticsMap.values());
  }

  let connectionsWithPreviews: ConnectionWithPreview[] = [];
  if (connections && connections.length > 0) {
    const connectionIds = connections.map(c => c.id);
    const { data: messages } = await supabase
      .from("messages")
      .select("connection_id, content, created_at")
      .in("connection_id", connectionIds)
      .order("created_at", { ascending: false });

    const latestMessages = new Map<number, { content: string | null; created_at: string | null }>();
    if (messages) {
      for (const message of messages) {
        if (!latestMessages.has(message.connection_id)) {
          latestMessages.set(message.connection_id, { content: message.content, created_at: message.created_at });
        }
      }
    }
    connectionsWithPreviews = connections.map(conn => {
      const product = Array.isArray(conn.product) ? conn.product[0] : conn.product;
      const requester = Array.isArray(conn.requester) ? conn.requester[0] : conn.requester;
      const seller = Array.isArray(conn.seller) ? conn.seller[0] : conn.seller;
      return {
        id: conn.id,
        status: conn.status,
        created_at: conn.created_at || new Date().toISOString(),
        product,
        requester: requester as Profile | null,
        seller: seller as Profile | null,
        latestMessage: latestMessages.get(conn.id) || null,
      };
    });
  }

  const savedProducts = (savedItemsData || [])
    .map(s => {
      const prod = Array.isArray(s.product) ? s.product[0] : s.product;
      if (!prod) return null;
      const prof = Array.isArray(prod.profiles) ? prod.profiles[0] : prod.profiles;
      return { ...prod, profiles: prof };
    })
    .filter(Boolean);

  const userRequests = (userRequestsRaw as unknown as RequestWithProfile[]) || [];

  return (
    <ProfileClient
      profile={profile}
      userProducts={userProducts || []}
      savedProducts={savedProducts as any[]}
      userRequests={userRequests}
      productAnalytics={productAnalytics}
    />
  );
}
