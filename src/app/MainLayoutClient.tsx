// app/MainLayoutClient.tsx
'use client';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppLoader from '@/components/shared/AppLoader';
import { NotificationProvider } from '@/app/(main)/context/NotificationContext';
import { User } from '@supabase/supabase-js';

export default function MainLayoutClient({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname.startsWith('/login');
  const shouldRenderNavbar = user && !isLandingPage && !isLoginPage;

  // We no longer hide the footer here, as the CSS will handle it
  // on the chat page.
  return (
    <NotificationProvider user={user}>
      {shouldRenderNavbar && <Navbar />}
  <main>
        <Suspense fallback={<AppLoader className="min-h-[60vh]" />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </NotificationProvider>
  );
}