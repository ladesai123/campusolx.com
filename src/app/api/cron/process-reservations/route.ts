import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Verify the Cron Secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Initialize Supabase Admin Client
  // We use the Service Role key so we can bypass RLS and update any product.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const today = new Date().toISOString();

    // 3. Find and update all products where available_from date has passed
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ 
        status: 'available', 
        available_from: null 
      })
      .eq('status', 'pending_reservation')
      .lte('available_from', today)
      .select('id, title'); // Select id and title just for logging purposes

    if (error) {
      console.error('[CRON] Failed to update reservations:', error);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    console.log(`[CRON] Successfully released ${data?.length || 0} reservations.`);

    return NextResponse.json({ 
      success: true, 
      message: `Released ${data?.length || 0} reservations.`,
      releasedProducts: data
    });

  } catch (error) {
    console.error('[CRON] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
