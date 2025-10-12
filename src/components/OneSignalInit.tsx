
"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
    oneSignalInitialized?: boolean;
  }
}

export default function OneSignalInit(): null {
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // ✅ PREVENT MULTIPLE INITIALIZATION
        if (window.oneSignalInitialized) {
          console.log('✅ OneSignal already initialized, skipping');
          return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            await OneSignal.init({
              appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
              safari_web_id: process.env.NEXT_PUBLIC_SAFARI_WEB_ID || undefined,
              autoPrompt: false, // ✅ Only use custom prompts, no automatic OneSignal popups
              notifyButton: { enable: false },
              allowLocalhostAsSecureOrigin: true, // for development
            });

            window.oneSignalInitialized = true;
            console.log('✅ OneSignal initialized successfully');
          } catch (err: any) {
            if (err.message?.includes('already initialized')) {
              window.oneSignalInitialized = true;
              console.log('✅ OneSignal was already initialized');
              return;
            }
            throw err;
          }

          // ✅ WAIT FOR USER SESSION TO BE READY
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const { data: { user }, error } = await supabase.auth.getUser();
              if (error) {
                console.log('⏳ User session error:', error.message);
                return;
              }
              
              if (user) {
                await OneSignal.login(user.id);
                await OneSignal.User.addTag('user_id', user.id);
                console.log('✅ User tagged in OneSignal:', user.id);
              } else {
                console.log('⏳ No user session found, will tag on auth change');
              }
            } catch (err) {
              console.log('⏳ User session not ready, will tag on auth change');
            }
          }, 2000);

          // ✅ LISTEN FOR AUTH CHANGES TO TAG NEW LOGINS
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            if (event === 'SIGNED_IN' && session?.user) {
              await OneSignal.login(session.user.id);
              await OneSignal.User.addTag('user_id', session.user.id);
              console.log('✅ New user tagged in OneSignal:', session.user.id);
            }
            if (event === 'SIGNED_OUT') {
              await OneSignal.logout();
              console.log('✅ User untagged from OneSignal');
            }
          });

          // ✅ SUBSCRIPTION CHANGE HANDLER (SDK v16 syntax)
          OneSignal.User.PushSubscription.addEventListener('change', async (event: any) => {
            if (!mounted) return;
            const isSubscribed = event.current.optedIn;
            console.log('🔔 OneSignal subscription changed:', isSubscribed);
            if (isSubscribed) {
              try {
                const playerId = OneSignal.User.PushSubscription.id;
                console.log('✅ OneSignal Player ID:', playerId);
              } catch (err) {
                console.error("Failed to get OneSignal playerId:", err);
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
