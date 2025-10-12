import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';

// We only need to import the NotificationProvider and other necessary components/types
import { NotificationProvider } from './context/NotificationContext';
import { User } from '@supabase/supabase-js';
import OneSignalInit from '@/components/OneSignalInit';
import Script from 'next/script';

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
    <>
      {/* OneSignal only loads on authenticated pages */}
      {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && (
        <>
          <Script
            src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
            strategy="afterInteractive"
          />
          <OneSignalInit />
        </>
      )}
      <NotificationProvider user={user as User}>
        {children}
      </NotificationProvider>
    </>
  );
}