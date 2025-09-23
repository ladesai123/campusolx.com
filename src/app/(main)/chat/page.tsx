import { createClient } from '@/lib/server';
import ChatClient from './ChatClient';
import type { ConnectionWithPreview } from '../profile/page';
import { getUnreadCountsByConnection } from './unreadCounts';
import OneSignalTagUser from '@/components/OneSignalTagUser';

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Fetch all connections for this user (as seller or requester)
  const { data: connections } = await supabase
    .from('connections')
    .select(`
      id,
      status,
      created_at,
      product:products!inner(id, title),
      requester:profiles!connections_requester_id_fkey(*),
      seller:profiles!connections_seller_id_fkey(*)
    `)
    .or(`seller_id.eq.${user.id},requester_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Fetch latest messages for each connection
  let connectionsWithPreviews: ConnectionWithPreview[] = [];
  if (connections && connections.length > 0) {
    const connectionIds = connections.map((c: any) => c.id);
    const { data: messages } = await supabase
      .from('messages')
      .select('connection_id, content, created_at')
      .in('connection_id', connectionIds)
      .order('created_at', { ascending: false });
    const latestMessages = new Map<number, { content: string | null; created_at: string | null }>();
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
    connectionsWithPreviews = connections.map((conn: any) => {
      const product = Array.isArray(conn.product) ? conn.product[0] : conn.product;
      // Fix: always use the first element if array, else the object
      const requester = Array.isArray(conn.requester) ? conn.requester[0] : conn.requester;
      const seller = Array.isArray(conn.seller) ? conn.seller[0] : conn.seller;
      return {
        id: conn.id,
        status: conn.status,
        created_at: conn.created_at || new Date().toISOString(),
        product: product,
        requester: requester,
        seller: seller,
        latestMessage: latestMessages.get(conn.id) || null,
      };
    });
  }

  // Fetch unread counts for each connection
  const unreadCountsArr = await getUnreadCountsByConnection(user.id);
  // Map: { [connection_id]: count }
  const unreadCounts: Record<number, number> = {};
  if (Array.isArray(unreadCountsArr)) {
    for (const row of unreadCountsArr) {
      if (row.connection_id) unreadCounts[row.connection_id] = row.count;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tag the user for push notifications */}
      <OneSignalTagUser userId={user.id} />
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Chats
      </h1>
      <ChatClient connections={connectionsWithPreviews} user={user} unreadCounts={unreadCounts} />
    </div>
  );
}
