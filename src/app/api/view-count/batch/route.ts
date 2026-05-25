import { createClient } from '@/lib/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { productIds, requestIds } = await req.json();

    const hasProducts = Array.isArray(productIds) && productIds.length > 0;
    const hasRequests = Array.isArray(requestIds) && requestIds.length > 0;

    if (!hasProducts && !hasRequests) {
      return NextResponse.json({ ok: true, message: 'No items to update' });
    }

    const supabase = await createClient();

    // Get current user — verify session once for the entire batch
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Initialize admin client to bypass RLS for updating the view_counts
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updatePromises: Promise<any>[] = [];

    // 1. Process Product Views (skip seller's own products)
    if (hasProducts) {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, seller_id, view_count')
        .in('id', productIds);

      if (prodError) {
        console.error('Error fetching products for batch view count:', prodError);
      } else if (products) {
        products.forEach((product) => {
          // Only increment if the viewer is not the seller
          if (product.seller_id !== user.id) {
            const currentViews = product.view_count ?? 0;
            const multiplier = productIds.filter(id => id === product.id).length || 1;
            updatePromises.push(
              Promise.resolve(
                adminSupabase
                  .from('products')
                  .update({ view_count: currentViews + multiplier })
                  .eq('id', product.id)
              )
            );
          }
        });
      }
    }

    // 2. Process Request Views (skip owner's own requests)
    if (hasRequests) {
      const { data: requests, error: reqError } = await supabase
        .from('requests')
        .select('id, user_id, view_count')
        .in('id', requestIds);

      if (reqError) {
        console.error('Error fetching requests for batch view count:', reqError);
      } else if (requests) {
        requests.forEach((request) => {
          // Only increment if the viewer is not the creator
          if (request.user_id !== user.id) {
            const currentViews = request.view_count ?? 0;
            const multiplier = requestIds.filter(id => id === request.id).length || 1;
            updatePromises.push(
              Promise.resolve(
                adminSupabase
                  .from('requests')
                  .update({ view_count: currentViews + multiplier })
                  .eq('id', request.id)
              )
            );
          }
        });
      }
    }

    if (updatePromises.length > 0) {
      const results = await Promise.all(updatePromises);
      const errors = results.filter(res => res.error);
      if (errors.length > 0) {
        console.error('Some view counts failed to update in batch:', errors);
      }
    }

    return NextResponse.json({ ok: true, updatedCount: updatePromises.length });
  } catch (error: any) {
    console.error('Server error in batch view count API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
