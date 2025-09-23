// React client component to tag the logged-in user in OneSignal
'use client';
import { useEffect } from 'react';
import { tagUserWithOneSignal } from '@/lib/onesignal-tag-user';

export default function OneSignalTagUser({ userId }: { userId: string | null | undefined }) {
  useEffect(() => {
    if (userId) tagUserWithOneSignal(userId);
  }, [userId]);
  return null;
}
