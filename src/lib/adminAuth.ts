import { createClient as createServerClient } from '@/lib/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Authorized admin emails configuration
const ADMIN_EMAILS = [
  '126156075@sastra.ac.in',
  'campusolx.connect@gmail.com',
  'ladesaiteja@gmail.com',
];

/**
 * Server-side authorization check for admin access.
 * Must be called in all admin pages, server actions, and admin API routes.
 */
export async function verifyAdminSession() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return { isAdmin: false, user: null, reason: 'Unauthenticated' };
    }

    const email = user.email.trim().toLowerCase();
    const configuredEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
      : [];
    
    const allowedEmails = [...new Set([...ADMIN_EMAILS, ...configuredEmails])];

    const isAuthorized = allowedEmails.includes(email);

    if (!isAuthorized) {
      return { isAdmin: false, user, reason: 'Forbidden: Email not in admin whitelist' };
    }

    return { isAdmin: true, user, reason: null };
  } catch (err: any) {
    console.error('[AdminAuth] Exception verifying admin session:', err);
    return { isAdmin: false, user: null, reason: 'Server Auth Error' };
  }
}

/**
 * Privileged Admin Supabase Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY on the server ONLY.
 * NEVER expose this to client components.
 */
export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server environment');
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
