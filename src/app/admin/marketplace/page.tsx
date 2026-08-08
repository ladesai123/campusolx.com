import { getAdminSupabase } from '@/lib/adminAuth';
import MarketplaceClient from './MarketplaceClient';
import { ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Marketplace Operations • CampusOLX Ops',
};

export default async function MarketplacePage() {
  const adminSupabase = getAdminSupabase();

  const { data: products } = await adminSupabase
    .from('products')
    .select('id, title, price, mrp, category, image_urls, status, is_hidden, show_on_landing, created_at, seller:profiles!products_seller_id_fkey(name, email, university)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-emerald-400" /> Marketplace Listings & Moderation Operations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search products, filter by category and status, toggle visibility, or delete listings with audit logging.
        </p>
      </div>

      <MarketplaceClient initialProducts={products || []} />
    </div>
  );
}
