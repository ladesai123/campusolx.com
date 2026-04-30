'use server';

import { createClient } from '@/lib/server';

export async function toggleSaveAction(productId: number, isCurrentlySaved: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  if (isCurrentlySaved) {
    await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
  } else {
    await supabase
      .from('saved_items')
      .insert({ user_id: user.id, product_id: productId });
  }
}
