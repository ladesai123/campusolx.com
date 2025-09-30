// Safe, isolated OneSignal initialization React component

"use client";
// TypeScript declaration for window.OneSignalDeferred (OneSignal v16)
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

import { useEffect } from 'react';

export default function OneSignalInit() {
  useEffect(() => {
    try {
      // OneSignal v16 deferred initialization
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal: any) {
        await OneSignal.init({
          appId: "f64a7b92-a44f-49fd-ae38-3d6e788b179b",
          autoPrompt: false,
        });
      });
    } catch (err) {
      console.error('OneSignal failed to initialize:', err);
    }
  }, []);
  return null;
}
