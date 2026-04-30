import { createClient } from '@/lib/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json();
    if (!requestId || typeof requestId !== 'number') {
      return NextResponse.json({ error: 'Invalid requestId' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user — don't count seller's own views
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { data: request } = await supabase
      .from('requests')
      .select('user_id, view_count')
      .eq('id', requestId)
      .single();

    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const r = request as any;
    if (r.user_id === user.id) return NextResponse.json({ skipped: true });

    // Use admin client to bypass RLS for updating the view_count
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Increment
    const { error } = await adminSupabase
      .from('requests')
      .update({ view_count: (r.view_count ?? 0) + 1 } as any)
      .eq('id', requestId);
      
    if (error) {
      console.error("Failed to update view count:", error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
