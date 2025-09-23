// Safe, isolated OneSignal initialization React component
'use client';
import { useEffect } from 'react';
import { initOneSignal } from '@/lib/onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    try {
      initOneSignal();
    } catch (err) {
      // Never throw, just log
      console.error('OneSignal failed to initialize:', err);
    }
  }, []);
  return null;
}
