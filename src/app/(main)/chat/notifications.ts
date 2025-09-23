"use server";
import { createClient } from '@/lib/server';

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  // Return updated unread count
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('is_read', false);

  return count ?? 0;
}

export async function markChatNotificationsRead(userId: string, connectionId: number) {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)
    .eq('connection_id', connectionId);

  // Return updated unread count for the connection
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('is_read', false)
    .eq('connection_id', connectionId);

  return count ?? 0;
}
