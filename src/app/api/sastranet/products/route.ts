import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/sastranet/products
 * 
 * Secure endpoint for the Sastranet team to access the products table.
 * Requires an API key passed in the headers.
 */
export async function GET(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  const configuredKey = process.env.SASTRANET_API_KEY;

  if (!configuredKey || apiKey !== configuredKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create a server client with the service role key to access all products
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: rawProducts, error } = await supabase
    .from('products')
    .select('*, profiles(university)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Sastranet API] Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  // Cleanly flatten the university field into each product object for easier use
  const now = new Date();
  
  const products = rawProducts.map((p: any) => {
    const { profiles, ...productData } = p;
    
    // Virtualization: Instantly treat expired reservations as 'available'
    const availableFromDate = productData.available_from ? new Date(productData.available_from) : null;
    const hasReservationPassed = availableFromDate ? now >= availableFromDate : false;
    const effectiveStatus = (productData.status === 'pending_reservation' && hasReservationPassed) 
      ? 'available' 
      : productData.status;

    return {
      ...productData,
      status: effectiveStatus,
      university: profiles?.university || null,
    };
  });

  return NextResponse.json({ products });
}
