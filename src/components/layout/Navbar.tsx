
'use client';

import Link from 'next/link';
import { PlusCircle, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/app/(main)/context/NotificationContext';
import Logo from '@/components/shared/Logo';

export default function Navbar() {
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="lg" />
        <div className="flex items-center gap-2 sm:gap-4">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/sell">
              <PlusCircle className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Sell Item</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="relative rounded-full p-2 h-9 w-9">
            <Link href="/chat">
              <MessageCircle className="h-6 w-6 text-gray-600 transition-colors hover:text-brand" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="relative rounded-full p-2 h-9 w-9">
            <Link href="/profile">
              <User className="h-6 w-6 text-gray-600 transition-colors hover:text-brand" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

