// app/MainLayoutClient.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import LandingNavbar from '@/components/layout/LandingNavbar';
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
  const isPublicStoryPage = ['/about', '/blog', '/careers'].includes(pathname);
  
  // Decide which navbar to show
  // 1. LandingNavbar for public-facing/landing contexts
  // 2. Auth Navbar for internal authenticated sections
  // 3. No Navbar for login (handled at page level usually)
  
  const showLandingNavbar = isLandingPage || isPublicStoryPage;
  const showAuthNavbar = user && !isLandingPage && !isLoginPage && !isPublicStoryPage;

  return (
    <NotificationProvider user={user}>
      {showLandingNavbar && <LandingNavbar />}
      {showAuthNavbar && <Navbar />}
      <main>
        <Suspense fallback={<AppLoader className="min-h-[60vh]" />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </NotificationProvider>
  );
}