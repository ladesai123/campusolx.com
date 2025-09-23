'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function MainContentWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith('/chat');

  // If it's a chat page, don't use the standard flex-grow so the chat layout can take over.
  return (
    <main className={isChatPage ? 'flex-grow-0' : 'flex-grow'}>
      {children}
    </main>
  );
}