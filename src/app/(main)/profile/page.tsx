import { redirect } from "next/navigation";
// --- We now import our new, modern, and correct server-side helper ---
import { createClient } from "@/lib/server";
import ProfileClient from "./ProfileClient";
import { Database } from "@/lib/database.types"; // Use your auto-generated DB types for safety

// ===================================================================
// Step 1: Define Clear, Reusable Types for This Page
// This makes our code much cleaner and easier to understand.
// ===================================================================

// This is a complete row from your 'profiles' table.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// This is a complete row from your 'products' table.
export type Product = Database["public"]["Tables"]["products"]["Row"];

// This type represents the latest message preview for a chat.
type MessagePreview = {
  content: string | null;
  created_at: string | null; // Allow null for created_at
};

// This is the final, combined data structure we will pass to the client component.
// It includes the connection, the related product, both users, and the latest message.
export type ConnectionWithPreview = {
  id: number;
  status: string | null;
  created_at: string; // Keep this as string, we will provide a fallback
  product: { id: number; title: string | null } | null;
  requester: Profile | null;
  seller: Profile | null;
  latestMessage: MessagePreview | null;
};

// ===================================================================
// Step 2: The Server Component for Fetching All Data
// ===================================================================
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --- Data Fetching ---
  // We will fetch the profile, user's products, and all connections in parallel for performance.

  // 1. Fetch the user's own profile
  const profilePromise = supabase.from("profiles").select("*").eq("id", user.id).single();

  // 2. Fetch products this user is selling
  const userProductsPromise = supabase
    .from("products")
    .select("*") // Fetches all columns for the Product type
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Fetch all connections the user is a part of (both as seller and requester)
  const connectionsPromise = supabase
    .from("connections")
    .select(
      `
      id,
      status,
      created_at,
      product:products!inner(id, title),
      requester:profiles!connections_requester_id_fkey(*),
      seller:profiles!connections_seller_id_fkey(*)
    `,
    )
    .or(`seller_id.eq.${user.id},requester_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Await all promises at the same time
  const [
    { data: profile },
    { data: userProducts },
    { data: connections, error: connError },
  ] = await Promise.all([profilePromise, userProductsPromise, connectionsPromise]);

  if (connError) {
    console.error("Error fetching connections:", connError);
  }

  // This will be our final, combined array that we pass to the client.
  let connectionsWithPreviews: ConnectionWithPreview[] = [];

  if (connections && connections.length > 0) {
    // Get the ID of every connection to fetch messages for.
    const connectionIds = connections.map((c) => c.id);

    // 4. Fetch the LATEST message for each of those connections in a single, efficient query.
    // We use a PostgREST RPC call for this, which is more advanced but highly performant.
    // If you don't have this function, the fallback logic will be used.
    // For now, we will use a slightly less performant but reliable method.
    const { data: messages } = await supabase
      .from("messages")
      .select("connection_id, content, created_at")
      .in("connection_id", connectionIds)
      .order("created_at", { ascending: false });

    // 5. Create a simple map of the latest message for each connection.
    const latestMessages = new Map<number, MessagePreview>();
    if (messages) {
      for (const message of messages) {
        if (!latestMessages.has(message.connection_id)) {
          latestMessages.set(message.connection_id, {
            content: message.content,
            created_at: message.created_at,
          });
        }
      }
    }

    // 6. Combine all the fetched data into our final, clean data structure.
    connectionsWithPreviews = connections.map((conn) => {
      // Supabase returns related data as an array, so we safely access the first item.
      const product = Array.isArray(conn.product) ? conn.product[0] : conn.product;
      const requester = Array.isArray(conn.requester) ? conn.requester[0] : conn.requester;
      const seller = Array.isArray(conn.seller) ? conn.seller[0] : conn.seller;

      return {
        id: conn.id,
        status: conn.status,
        created_at: conn.created_at || new Date().toISOString(), // Fallback for created_at
        product: product,
        requester: requester as Profile | null,
        seller: seller as Profile | null,
        latestMessage: latestMessages.get(conn.id) || null,
      };
    });
  }

  // 7. Pass the clean, combined data to the client component for rendering.
  return (
    <ProfileClient
      profile={profile as Profile | null}
      userProducts={userProducts || []}
    />
  );
}

