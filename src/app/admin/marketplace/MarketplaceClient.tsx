'use client';

import { useState, useTransition } from 'react';
import { Search, Eye, EyeOff, Trash2, Tag, ShoppingBag, ExternalLink, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toggleProductVisibilityAction, toggleShowOnLandingAction, adminDeleteProductAction } from './actions';
import Toast from '@/components/shared/Toast';

export default function MarketplaceClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categories = ['All', ...new Set(initialProducts.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.seller?.name && p.seller.name.toLowerCase().includes(query)) ||
      String(p.id).includes(query);

    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'featured' && p.show_on_landing) ||
      (statusFilter === 'hidden' && p.is_hidden) ||
      (statusFilter === 'available' && p.status === 'available' && !p.is_hidden) ||
      (statusFilter === 'sold' && p.status === 'sold');

    return matchSearch && matchCategory && matchStatus;
  });

  const handleToggleHide = (productId: number, currentHidden: boolean) => {
    startTransition(async () => {
      try {
        await toggleProductVisibilityAction(productId, !currentHidden);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_hidden: !currentHidden } : p))
        );
        setToastMessage(currentHidden ? 'Listing restored to marketplace' : 'Listing hidden from marketplace');
      } catch (err: any) {
        setToastMessage(`Action failed: ${err.message}`);
      }
    });
  };

  const handleToggleLanding = (productId: number, currentShow: boolean) => {
    startTransition(async () => {
      try {
        await toggleShowOnLandingAction(productId, !currentShow);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, show_on_landing: !currentShow } : p))
        );
        setToastMessage(!currentShow ? 'Item featured on landing page carousel!' : 'Item removed from landing page carousel.');
      } catch (err: any) {
        setToastMessage(`Action failed: ${err.message}`);
      }
    });
  };

  const handleDelete = (productId: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete listing #${productId} "${title}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await adminDeleteProductAction(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setToastMessage(`Permanently deleted listing #${productId}`);
      } catch (err: any) {
        setToastMessage(`Delete failed: ${err.message}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, seller name, or ID..."
            className="bg-slate-950 border-slate-800 text-slate-200 text-xs pl-9 focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto font-mono text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="featured">Featured on Landing</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Products Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Item Title</th>
                <th className="py-2.5 px-3">Seller</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Landing Carousel</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400">#{product.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200 truncate max-w-[200px]">
                      {product.title}
                    </td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[150px]">
                      {product.seller?.name || 'Seller'}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : 'Free'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{product.category || 'General'}</td>
                    <td className="py-3 px-3">
                      {product.show_on_landing ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 w-fit">
                          <Star className="h-3 w-3 fill-purple-400" /> FEATURED
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {product.is_hidden ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          HIDDEN
                        </span>
                      ) : product.status === 'sold' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          SOLD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleLanding(product.id, !!product.show_on_landing)}
                        className={`h-7 text-xs ${product.show_on_landing ? 'text-purple-400 hover:text-purple-300' : 'text-slate-400 hover:text-white'}`}
                        title={product.show_on_landing ? 'Remove from Landing Carousel' : 'Feature on Landing Carousel'}
                      >
                        <Star className={`h-3.5 w-3.5 ${product.show_on_landing ? 'fill-purple-400' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleHide(product.id, product.is_hidden)}
                        className="h-7 text-xs text-slate-300 hover:text-white"
                        title={product.is_hidden ? 'Restore Listing' : 'Hide Listing'}
                      >
                        {product.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-amber-400" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product.id, product.title)}
                        className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Delete Listing Permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No marketplace listings matched your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
