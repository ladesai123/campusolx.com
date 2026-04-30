'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/app/(main)/context/NotificationContext';
import Logo from '@/components/shared/Logo';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';

export default function Navbar() {
  const { unreadCount } = useNotifications();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // Try profile table first
      supabase.from('profiles').select('profile_picture_url, name').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.profile_picture_url) {
            setProfilePic(data.profile_picture_url);
          }
          if (data?.name) {
            const parts = data.name.trim().split(' ');
            setInitials(parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : (data.name.slice(0, 2)).toUpperCase()
            );
          }
        });
    });
  }, []);

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

          {/* Profile picture / initials avatar */}
          <Link href="/profile" className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center bg-gray-100">
            {profilePic ? (
              <Image
                src={profilePic}
                alt="Profile"
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : initials ? (
              <span className="text-xs font-bold text-gray-600">{initials}</span>
            ) : (
              <User className="h-5 w-5 text-gray-500" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
