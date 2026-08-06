-- =================================================================
-- CampusOLX 2.0 — Production B-Tree Index Optimization Script
-- Execute in Supabase SQL Editor to eliminate sequential table scans
-- =================================================================

-- 1. PRODUCTS INDEXES (Accelerates marketplace search, status filtering, RLS)
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status_hidden ON public.products (is_hidden, status);
CREATE INDEX IF NOT EXISTS idx_products_landing ON public.products (show_on_landing, is_hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- 2. CONNECTIONS INDEXES (Accelerates chat listing & RLS evaluation)
CREATE INDEX IF NOT EXISTS idx_connections_seller_id ON public.connections (seller_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections (requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_product_id ON public.connections (product_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections (status);

-- 3. MESSAGES INDEXES (Accelerates chat message fetching & real-time listeners)
CREATE INDEX IF NOT EXISTS idx_messages_connection_id ON public.messages (connection_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

-- 4. NOTIFICATIONS INDEXES (Accelerates unread count badges & real-time updates)
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_unread ON public.notifications (receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_connection_id ON public.notifications (connection_id);

-- 5. SAVED ITEMS, REQUESTS & RATINGS INDEXES
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON public.saved_items (user_id);
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.requests (user_id, status);
CREATE INDEX IF NOT EXISTS idx_ratings_rater ON public.ratings (rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_connection ON public.ratings (connection_id);
