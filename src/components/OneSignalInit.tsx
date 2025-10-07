
"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

export default function OneSignalInit() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // only init for logged-in users

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            safari_web_id: process.env.NEXT_PUBLIC_SAFARI_WEB_ID || undefined,
            autoPrompt: false, // we will prompt manually
            notifyButton: { enable: false },
          });

          // Map this subscription to your Supabase user id:
          await OneSignal.setExternalUserId(user.id);

          // If not enabled, show slidedown prompt once (optional UX)
          const isEnabled = await OneSignal.isPushNotificationsEnabled();
          if (!isEnabled) {
            OneSignal.showSlidedownPrompt?.();
          }

          // When subscription changes (user allows), get player ID and save it
          OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
            if (!mounted) return;
            if (isSubscribed) {
              try {
                const playerId = await OneSignal.getUserId();
                if (!playerId) return;
                // You can save playerId to Supabase here if needed
              } catch (err) {
                console.error("Failed to save OneSignal playerId:", err);
              }
            }
          });
        });
      } catch (err) {
        console.error("OneSignalInit error:", err);
      }
    })();

    return () => { mounted = false; };
  }, [supabase]);

  return null;
}
