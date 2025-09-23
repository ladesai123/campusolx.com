'use server';

import { createClient } from '@/lib/server';

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  
  const content = formData.get('content')?.toString();
  const connectionId = formData.get('connectionId')?.toString();

  if (!content || !connectionId) throw new Error('Missing data');

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert the message
  const { error } = await supabase
    .from('messages')
    .insert({
      content,
      connection_id: parseInt(connectionId),
      sender_id: user.id,
    });

  if (error) console.error('Error sending message:', error);
}
