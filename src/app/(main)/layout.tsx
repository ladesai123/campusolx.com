import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';

// We only need to import the NotificationProvider and other necessary components/types
import { NotificationProvider } from './context/NotificationContext';
import { User } from '@supabase/supabase-js';

// This layout will wrap all pages inside the (main) group (home, profile, etc.)
// Its primary role is now to handle authentication and provide context, not visual layout.
export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    // The NotificationProvider must be a client component, but its children can be a mix of server and client components.
    // The layout classes (`flex min-h-screen flex-col`) are now removed to prevent conflicts.
    <NotificationProvider user={user as User}>
      {children}
    </NotificationProvider>
  );
}