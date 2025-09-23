
'use client';
import { Suspense } from 'react';
import AppLoader from '@/components/shared/AppLoader';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppLoader className="min-h-[60vh]" />}>
      {children}
    </Suspense>
  );
}