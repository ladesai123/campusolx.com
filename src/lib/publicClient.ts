import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Public Anonymous Supabase Client with PostgREST Edge Caching headers.
 * 
 * Used for read-only public marketplace queries (listings, public requests, stats, landing page).
 * Instructs Supabase's Cloudflare API Gateway to cache PostgREST responses at the edge,
 * turning uncached DB queries into free/cheap "Cached Egress" served directly from Edge RAM!
 */
export function getPublicCachedSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient<Database>(url, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    },
  });
}
