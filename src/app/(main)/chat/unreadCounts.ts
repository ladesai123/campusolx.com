"use server";
import { createClient } from '@/lib/server';

export async function getUnreadCountsByConnection(userId: string) {
  const supabase = await createClient();
  // Fetch all unread notifications for this user
  const { data, error } = await supabase
    .from('notifications')
    .select('connection_id')
    .eq('receiver_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  // Aggregate counts by connection_id in JS
  const counts: Record<number, number> = {};
  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.connection_id) {
        counts[row.connection_id] = (counts[row.connection_id] || 0) + 1;
      }
    }
  }
  // Convert to array of { connection_id, count }
  return Object.entries(counts).map(([connection_id, count]) => ({ connection_id: Number(connection_id), count }));
}
