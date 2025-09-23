"use server";

import { createClient } from '@/lib/client';
import { cookies } from 'next/headers';

export async function logout() {
  // Create a Supabase client with the user's cookies
  const supabase = createClient();
  await supabase.auth.signOut();
  // Optionally clear cookies if needed (handled by Supabase)
  return { success: true };
}
