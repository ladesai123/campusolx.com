import { createClient } from '@/lib/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const university = searchParams.get('university') || '';
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category') || 'All';

    if (!university) {
      return NextResponse.json({ error: 'Missing university parameter' }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('id, title, price, mrp, category, image_urls, status, available_from, is_negotiable, bumped_at, created_at, view_count, seller_id, is_hidden, profiles!inner(id, name, university, profile_picture_url)')
      .eq('profiles.university', university)
      .eq('is_hidden', false)
      .order('status', { ascending: true })
      .order('bumped_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (category !== 'All') {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching paginated products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('Server error in paginated products API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
