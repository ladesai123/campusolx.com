import type { ProductWithProfile, RequestWithProfile } from '@/lib/types';

export interface FeedCacheEntry {
  products: ProductWithProfile[];
  offset: number;
  hasMore: boolean;
  activeCategory: string;
  savedIds: number[];
  activeRequests: RequestWithProfile[];
  scrollPosition: number;
  timestamp: number;
}

class FeedStore {
  private cache = new Map<string, FeedCacheEntry>();
  private STALE_TIME_MS = 2 * 60 * 1000; // 2 minutes stale threshold

  getCache(key: string): FeedCacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > this.STALE_TIME_MS;
  }

  setCache(key: string, data: Omit<FeedCacheEntry, 'timestamp'>) {
    const existing = this.cache.get(key);
    this.cache.set(key, {
      ...data,
      scrollPosition: data.scrollPosition ?? existing?.scrollPosition ?? 0,
      timestamp: Date.now(),
    });
  }

  saveScrollPosition(key: string, scrollY: number) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.scrollPosition = scrollY;
    }
  }

  updateSavedId(productId: number, isSaved: boolean) {
    this.cache.forEach((entry) => {
      if (isSaved) {
        if (!entry.savedIds.includes(productId)) {
          entry.savedIds.push(productId);
        }
      } else {
        entry.savedIds = entry.savedIds.filter((id) => id !== productId);
      }
    });
  }

  removeProduct(productId: number) {
    this.cache.forEach((entry) => {
      entry.products = entry.products.filter((p) => p.id !== productId);
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const feedStore = new FeedStore();
