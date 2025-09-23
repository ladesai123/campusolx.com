'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
// --- THIS IS THE FIX (Part 1) ---
// We now import the 'createClient' function from our new, modern client-side helper.
import { createClient } from '@/lib/client';

type NotificationContextType = {
  unreadCount: number;
  refetchUnreadCount: () => Promise<void>;
};

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children, user }: { children: ReactNode; user: User | null }) {
  // --- THIS IS THE FIX (Part 2) ---
  // We create a single instance of the modern Supabase client using useMemo.
  // This ensures the client is created only once per component lifecycle and that
  // your entire app now uses the same '@supabase/ssr' library, resolving the conflict.
  const supabase = useMemo(() => createClient(), []);
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper to refetch unread count
  const refetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('is_read', false);
    setUnreadCount(count ?? 0);
  };

  useEffect(() => {
    if (user) {
      refetchUnreadCount();

      // Set up a real-time listener to hear new notifications as they are inserted or updated.
      const channel = supabase
        .channel('realtime-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            // Increment the count in real-time for new notifications.
            setUnreadCount((currentCount) => currentCount + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `receiver_id=eq.${user.id},is_read=eq.true`,
          },
          (payload) => {
            // Decrement the count in real-time when notifications are marked as read.
            setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));
          }
        )
        .subscribe();

      // Cleanup function to remove the real-time listener.
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

// This is the custom hook your Navbar uses to get the notification count. It remains unchanged.
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

