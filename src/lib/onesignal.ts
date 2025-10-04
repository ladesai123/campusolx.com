// OneSignal integration (isolated)
// This module is safe to import anywhere. It will not throw if OneSignal is not enabled or fails.

export function initOneSignal() {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return;
  try {
    // Only load if not already loaded
    if (!(window as any).OneSignal) {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
      script.async = true;
      script.onload = () => {
        (window as any).OneSignal = (window as any).OneSignal || [];
        (window as any).OneSignal.push(function() {
          (window as any).OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            notifyButton: { enable: true },
            allowLocalhostAsSecureOrigin: true,
          });
        });
      };
      document.head.appendChild(script);
    }
  } catch (err) {
    // Never throw, just log
    console.error('OneSignal init failed:', err);
  }
}
