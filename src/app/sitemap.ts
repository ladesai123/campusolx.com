import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const BASE_URL = 'https://campusolx.com';

/**
 * Next.js App Router sitemap — auto-submitted to Google via robots.txt.
 * Static pages use monthly changefreq; dynamic product pages use daily.
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * NOTE: Uses a plain anon Supabase client (no cookies) because sitemap.ts
 * runs outside of a request context and cannot use the cookie-based server client.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static / marketing pages ───────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/why-campusolx`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ── Dynamic product listing pages ──────────────────────────────────────────
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    // Plain anon client — no cookie handling needed for read-only public data
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: products } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('status', 'available') // matches ProductStatus: 'available' | 'sold' | 'pending_reservation' | 'reserved'
      .order('created_at', { ascending: false })
      .limit(1000); // safety cap — expand if needed

    if (products) {
      productRoutes = products.map((product) => ({
        url: `${BASE_URL}/product/${product.id}`,
        lastModified: product.created_at ? new Date(product.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
    }
  } catch (error) {
    // Fail gracefully — sitemap still works for static pages
    console.error('[sitemap] Failed to fetch product routes:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
