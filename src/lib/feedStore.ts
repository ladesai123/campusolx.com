import type { ProductWithProfile, RequestWithProfile } from '@/lib/types';
import type { Database } from '@/lib/database.types';

type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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

export interface ProfileCacheEntry {
  profile: Profile | null;
  userProducts: Product[];
  savedProducts: ProductWithProfile[];
  userRequests: RequestWithProfile[];
  productAnalytics?: any[];
  timestamp: number;
}

export interface ChatRoomCacheEntry {
  messages: any[];
  otherUser?: Profile | null;
  product?: any | null;
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

class ProfileStore {
  private cache = new Map<string, ProfileCacheEntry>();
  private STALE_TIME_MS = 2 * 60 * 1000;

  getCache(userId: string): ProfileCacheEntry | null {
    return this.cache.get(userId) || null;
  }

  setCache(userId: string, data: Omit<ProfileCacheEntry, 'timestamp'>) {
    this.cache.set(userId, {
      ...data,
      timestamp: Date.now(),
    });
  }

  removeUserProduct(userId: string, productId: number) {
    const entry = this.cache.get(userId);
    if (entry) {
      entry.userProducts = entry.userProducts.filter(p => p.id !== productId);
    }
  }

  updateProductStatus(userId: string, productId: number, status: string) {
    const entry = this.cache.get(userId);
    if (entry) {
      const prod = entry.userProducts.find(p => p.id === productId);
      if (prod) prod.status = status;
    }
  }

  clear() {
    this.cache.clear();
  }
}

class ChatStore {
  private roomCache = new Map<string, ChatRoomCacheEntry>();
  private connectionsCache = new Map<string, { connections: any[]; timestamp: number }>();

  getRoomCache(connectionId: string): ChatRoomCacheEntry | null {
    return this.roomCache.get(connectionId) || null;
  }

  setRoomCache(connectionId: string, data: Omit<ChatRoomCacheEntry, 'timestamp'>) {
    this.roomCache.set(connectionId, {
      ...data,
      timestamp: Date.now(),
    });
  }

  appendMessage(connectionId: string, message: any) {
    const entry = this.roomCache.get(connectionId);
    if (entry) {
      const exists = entry.messages.some(m => m.id === message.id);
      if (!exists) {
        entry.messages = [...entry.messages, message];
      }
    }
  }

  getConnectionsCache(userId: string) {
    return this.connectionsCache.get(userId) || null;
  }

  setConnectionsCache(userId: string, connections: any[]) {
    this.connectionsCache.set(userId, {
      connections,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.roomCache.clear();
    this.connectionsCache.clear();
  }
}

export const feedStore = new FeedStore();
export const profileStore = new ProfileStore();
export const chatStore = new ChatStore();
