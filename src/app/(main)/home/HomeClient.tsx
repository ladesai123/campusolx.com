'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { RequestCard } from '@/components/RequestCard';
import Toast from '@/components/shared/Toast';
import type { ProductWithProfile, RequestWithProfile } from '@/lib/types';
import Link from 'next/link';
import {
  MapPin, LayoutGrid, Laptop, BookOpen, BedDouble,
  Bike, Shirt, FlaskConical, Trophy, Package, PlusCircle, ShoppingBag, ArrowRight, Loader2,
} from 'lucide-react';

// ─── Category config — B&W Lucide icons ──────────────────────────────────────
const CATEGORIES = [
  { label: 'All',                      short: 'All',      Icon: LayoutGrid },
  { label: 'Electronics',              short: 'Electronics', Icon: Laptop },
  { label: 'Books & Notes',            short: 'Books',    Icon: BookOpen },
  { label: 'Hostel & Room Essentials', short: 'Hostel',   Icon: BedDouble },
  { label: 'Mobility',                 short: 'Mobility', Icon: Bike },
  { label: 'Fashion & Accessories',    short: 'Fashion',  Icon: Shirt },
  { label: 'Lab & Academics',          short: 'Lab',      Icon: FlaskConical },
  { label: 'Hobbies & Sports',         short: 'Sports',   Icon: Trophy },
  { label: 'Other',                    short: 'Other',    Icon: Package },
];

const PAGE_SIZE = 20;

function sortWeight(product: ProductWithProfile): number {
  const now = new Date();
  const af = product.available_from ? new Date(product.available_from) : null;
  const effective = product.status === 'pending_reservation' && af && now >= af
    ? 'available' : product.status;
  if (effective === 'available' || effective === 'pending_reservation') return 0;
  if (effective === 'reserved') return 1;
  return 2;
}

interface HomeClientProps {
  products: ProductWithProfile[];
  university: string;
  studentCount: number;
  initialSavedIds: number[];
  activeRequests: RequestWithProfile[];
  currentUserId: string;
}

export default function HomeClient({ products, university, studentCount, initialSavedIds, activeRequests, currentUserId }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set(initialSavedIds));
  const [navigatingToRequests, setNavigatingToRequests] = useState(false);
  const [navigatingToSell, setNavigatingToSell] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // ── View count logic for products ──
  const viewedRef = useRef<Set<number>>(new Set());
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setCardRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  // ── View count logic for requests ──
  const requestViewedRef = useRef<Set<number>>(new Set());
  const requestTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const requestCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setRequestCardRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) requestCardRefs.current.set(id, el);
    else requestCardRefs.current.delete(id);
  }, []);

  // ── Sort: available first, sold last ──────────────────────────────────────
  const sorted = [...products].sort((a, b) => {
    const wa = sortWeight(a), wb = sortWeight(b);
    if (wa !== wb) return wa - wb;
    const aTime = new Date((a as any).bumped_at || a.created_at || 0).getTime();
    const bTime = new Date((b as any).bumped_at || b.created_at || 0).getTime();
    return bTime - aTime;
  });

  const filtered = activeCategory === 'All'
    ? sorted
    : sorted.filter(p => p.category === activeCategory);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMore) return;
    const obs = new IntersectionObserver(
      e => { if (e[0].isIntersecting) setVisibleCount(n => n + PAGE_SIZE); },
      { rootMargin: '300px' }
    );
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeCategory]);

  // ── Handle Save toggle ────────────────────────────────────────────────────
  const handleToggleSave = useCallback(async (productId: number) => {
    const isSaved = savedIds.has(productId);
    
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      // Dynamic import to avoid client-side error on server action import
      const { toggleSaveAction } = await import('./actions');
      await toggleSaveAction(productId, isSaved);
      setToastMessage(isSaved ? "Removed from watchlist" : "Added to watchlist! ❤️");
    } catch (e) {
      // Revert on failure
      setToastMessage("Failed to update watchlist");
      setSavedIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  }, [savedIds]);

  // ── View count via Intersection Observer ─────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = parseInt((entry.target as HTMLElement).dataset.productId || '0', 10);
        if (!id) return;
        if (entry.isIntersecting) {
          if (!timers.current.has(id)) {
            const t = setTimeout(async () => {
              if (!viewedRef.current.has(id)) {
                viewedRef.current.add(id);
                try {
                  await fetch('/api/view-count', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: id }),
                  });
                } catch { /* silent */ }
              }
              timers.current.delete(id);
            }, 1500);
            timers.current.set(id, t);
          }
        } else {
          const t = timers.current.get(id);
          if (t) { clearTimeout(t); timers.current.delete(id); }
        }
      });
    }, { threshold: 0.4 });

    cardRefs.current.forEach(el => obs.observe(el));
    return () => { obs.disconnect(); timers.current.forEach(t => clearTimeout(t)); };
  }, [visible]);

  // Set up intersection observer for requests
  useEffect(() => {
    if (!activeRequests || activeRequests.length === 0) return;
    
    const requestObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const idStr = (entry.target as HTMLElement).dataset.requestId;
          if (!idStr) return;
          const id = parseInt(idStr, 10);

          if (entry.isIntersecting) {
            if (!requestViewedRef.current.has(id) && !requestTimers.current.has(id)) {
              const timer = setTimeout(() => {
                requestViewedRef.current.add(id);
                fetch('/api/view-count-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ requestId: id })
                }).catch(console.error);
              }, 1500); // 1.5s view threshold
              requestTimers.current.set(id, timer);
            }
          } else {
            const timer = requestTimers.current.get(id);
            if (timer) {
              clearTimeout(timer);
              requestTimers.current.delete(id);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    const currentRefs = requestCardRefs.current;
    currentRefs.forEach(ref => requestObserver.observe(ref));
    return () => {
      currentRefs.forEach(ref => requestObserver.unobserve(ref));
      requestTimers.current.forEach(clearTimeout);
      requestTimers.current.clear();
    };
  }, [activeRequests]);

  return (
    <div className="min-h-screen bg-gray-50">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* ── Location bar ── */}
      <div className="bg-white px-4 py-2 flex items-center gap-1.5 border-b">
        <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
        <span className="text-xs font-medium text-gray-600 truncate">{university}</span>
      </div>

      {/* ── Motivational sell banner (above categories) ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-5 py-4 shadow-md">
          {/* Shopping bag icon — large, tilted, decorative */}
          <div className="pointer-events-none absolute -right-3 -bottom-3 rotate-12 opacity-[0.12]">
            <ShoppingBag className="h-28 w-28 text-white" strokeWidth={1} />
          </div>
          <p className="text-[11px] font-medium text-blue-200 mb-1 tracking-wide">
            Used by {studentCount.toLocaleString('en-IN')} SASTRA students
          </p>
          <p className="text-[17px] font-semibold text-white leading-snug mb-3">
            Got something to sell?<br />List it. Get paid.
          </p>
          <button
            onClick={(e) => { e.preventDefault(); setNavigatingToSell(true); router.push('/sell'); }}
            disabled={navigatingToSell}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {navigatingToSell ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {navigatingToSell ? 'Loading...' : 'Sell Item'}
          </button>
        </div>
      </div>

      {/* ── Looking For / Requests Strip ── */}
      <div className="px-4 pt-4">
        <div className="mb-2 bg-blue-50/50 -mx-4 px-4 py-4 border-y border-blue-100 sm:rounded-2xl sm:mx-0 sm:border-x">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                Wanted Items
              </h2>
              <p className="text-[11px] text-gray-500">Fellow students are looking for these</p>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); setNavigatingToRequests(true); router.push('/requests'); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              {navigatingToRequests ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Loading</>
              ) : (
                <>See all <ArrowRight className="h-3 w-3" /></>
              )}
            </button>
          </div>
          
          {activeRequests && activeRequests.length > 0 ? (
            <div className="flex overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 snap-x hide-scrollbar relative">
              {activeRequests.map(request => (
                <div 
                  key={request.id} 
                  className="w-[160px] snap-start flex-shrink-0"
                  data-request-id={request.id}
                  ref={el => setRequestCardRef(request.id, el)}
                >
                  <RequestCard request={request} currentUserId={currentUserId} compact />
                </div>
              ))}
              {/* Final "Post a Request" CTA Card */}
              <div 
                onClick={(e) => { e.preventDefault(); setNavigatingToRequests(true); router.push('/requests'); }}
                className="w-[160px] snap-start flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-dashed border-blue-200 hover:border-blue-300 hover:bg-blue-50/80 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {navigatingToRequests ? (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 mb-1">Looking for something?</span>
                  <span className="text-sm font-bold text-blue-700">
                    {navigatingToRequests ? 'Loading...' : 'Post a Request'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-blue-100 p-6 text-center">
              <p className="text-sm text-gray-600 mb-3">No one is looking for anything right now.</p>
              <button 
                onClick={(e) => { e.preventDefault(); setNavigatingToRequests(true); router.push('/requests'); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={navigatingToRequests}
              >
                {navigatingToRequests ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                {navigatingToRequests ? 'Loading...' : 'Post a Request'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Category pills (below banner and requests) ── */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="relative">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          <div
            className="flex gap-2 overflow-x-auto px-4 py-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map(({ label, short, Icon }) => {
              const isActive = activeCategory === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3.5 py-2.5 transition-all duration-150 select-none
                    ${isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} strokeWidth={1.8} />
                  <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
                    {short}
                  </span>
                </button>
              );
            })}
            <div className="shrink-0 w-8" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4 max-w-2xl mx-auto sm:max-w-none">
        {/* ── Listings header ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            {activeCategory === 'All' ? 'Recent Listings' : activeCategory}
          </h2>
          <span className="text-xs text-gray-400">{filtered.length} items</span>
        </div>

        {/* ── Product grid ── */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visible.map(product => (
                <div
                  key={product.id}
                  data-product-id={product.id}
                  ref={el => setCardRef(product.id, el)}
                >
                  <ProductCard 
                    product={product} 
                    isSaved={savedIds.has(product.id)}
                    onToggleSave={() => handleToggleSave(product.id)}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div ref={loaderRef} className="mt-4 flex justify-center gap-1.5 py-4">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <p className="py-6 text-center text-sm text-gray-400">
                You've seen all {filtered.length} listings ✓
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-5xl mb-3">🔍</p>
            <h3 className="text-lg font-semibold text-gray-700">Nothing here yet</h3>
            <p className="mt-1 text-sm text-gray-400">Be the first to list in this category!</p>
            <Link
              href="/sell"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
            >
              <PlusCircle className="h-4 w-4" /> Sell Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
