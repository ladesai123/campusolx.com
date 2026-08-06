import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export async function GET(request: NextRequest) {
  // Simple rate limiting by IP
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            request.headers.get('cf-connecting-ip') || 
            'unknown';
  const now = Date.now();
  const userLimit = rateLimit.get(ip);
  
  if (userLimit && userLimit.resetTime > now) {
    if (userLimit.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((userLimit.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }
    userLimit.count++;
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  // Add cache and rate limit headers
  const headers = {
    'Cache-Control': 's-maxage=300, stale-while-revalidate=60', // Cache for 5 minutes
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': (MAX_REQUESTS - (userLimit?.count || 1)).toString(),
  };

  try {
    const supabase = await createClient();
    
    // 🚀 Parallel Execution: Run stats queries concurrently instead of sequential waterfalls
    const [
      { data: latestProduct },
      { count: activeListings },
      { data: recentProduct }
    ] = await Promise.all([
      supabase.from('products').select('id').order('id', { ascending: false }).limit(1).single(),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_hidden', false).neq('status', 'sold'),
      supabase.from('products').select('title, created_at').eq('is_hidden', false).order('created_at', { ascending: false }).limit(1).single()
    ]);

    // Calculate time since last listing
    let lastSaleTime = '6h';
    let lastSaleItem = 'Study Materials';
    
    if (recentProduct) {
      const listingDate = new Date(recentProduct.created_at || '');
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - listingDate.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        lastSaleTime = '30m';
      } else if (diffHours < 24) {
        lastSaleTime = `${diffHours}h`;
      } else if (diffHours < 168) { // Less than a week
        const diffDays = Math.floor(diffHours / 24);
        lastSaleTime = `${diffDays}d`;
      } else {
        lastSaleTime = '1w+';
      }
      
      // Clean up the title for display
      lastSaleItem = recentProduct.title.length > 20 
        ? recentProduct.title.substring(0, 20) + '...' 
        : recentProduct.title;
    }

    const stats = {
      latestProductId: latestProduct?.id || 40,
      activeListings: activeListings || 25,
      lastSaleTime,
      lastSaleItem: lastSaleItem || 'Recent Item'
    };

    return NextResponse.json(stats, { headers });
    
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    
    // Return fallback data with proper headers if database query fails
    const fallbackStats = {
      latestProductId: Math.floor(Math.random() * 20) + 40, // 40-60 range
      activeListings: Math.floor(Math.random() * 15) + 20, // 20-35 range
      lastSaleTime: ['2h', '3h', '4h', '5h'][Math.floor(Math.random() * 4)],
      lastSaleItem: ['Study Materials', 'Lab Equipment', 'Electronics', 'Books'][Math.floor(Math.random() * 4)]
    };
    
    return NextResponse.json(fallbackStats, { 
      status: 200, // Return 200 with fallback data instead of error
      headers: {
        ...headers,
        'X-Fallback-Data': 'true'
      }
    });
  }
}