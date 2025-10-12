import { NextResponse } from 'next/server';
import { createClient } from '@/lib/client';

export async function GET() {
	const supabase = createClient();
	// Fetch products for landing page: show_on_landing = true (no status restriction)
	const { data, error } = await supabase
		.from('products')
		.select('id, title, price, mrp, category, image_urls, status, description, available_from, is_negotiable')
		.eq('show_on_landing', true)
		.order('created_at', { ascending: false })
		.limit(20);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
	return NextResponse.json({ products: data ?? [] });
}
