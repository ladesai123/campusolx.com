import { createClient } from '@/lib/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId || typeof productId !== 'number') {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user — don't count seller's own views
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    // Fetch seller_id — skip if viewer is the seller
    const { data: product } = await supabase
      .from('products')
      .select('seller_id, view_count')
      .eq('id', productId)
      .single();

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const p = product as any;
    if (p.seller_id === user.id) return NextResponse.json({ skipped: true });

    // Use admin client to bypass RLS for updating the view_count
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Increment
    const { error } = await adminSupabase
      .from('products')
      .update({ view_count: (p.view_count ?? 0) + 1 } as any)
      .eq('id', productId);
      
    if (error) {
      console.error("Failed to update product view count:", error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
