'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle, User } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { initOneSignal } from '@/lib/onesignal';

// Define simple types for the data we're receiving from the server.
// Using 'any' for now is okay, but you can make these more specific later for better type safety.
type Product = any; 
type Profile = any;

// Define the shape of the data this component expects to receive from the server "shell".
interface HomePageClientProps {
  profile: Profile | null;
  initialProducts: Product[];
}

export default function HomePageClient({ profile, initialProducts }: HomePageClientProps) {
  const [showSubscribeBanner, setShowSubscribeBanner] = useState(false);
  // We use `useState` to manage the list of products on the client-side.
  const [products, setProducts] = useState(initialProducts);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    initOneSignal();

    let tries = 0;
    const maxTries = 10;
    const interval = setInterval(async () => {
      const OneSignal = (window as any).OneSignal;
      if (
        OneSignal &&
        OneSignal.User &&
        OneSignal.User.PushSubscription &&
        typeof OneSignal.User.PushSubscription.optedIn === 'function'
      ) {
        try {
          const isSubscribed = await OneSignal.User.PushSubscription.optedIn();
          console.log('OneSignal subscription status:', isSubscribed);
          if (!isSubscribed) {
            setShowSubscribeBanner(true);
          }
          clearInterval(interval);
        } catch (e) {
          console.error('OneSignal subscription check failed:', e);
          clearInterval(interval);
        }
      } else {
        tries++;
        if (tries >= maxTries) {
          console.error('OneSignal SDK/User.PushSubscription not available after max retries');
          clearInterval(interval);
        }
      }
    }, 1000); // Check every second, up to 10 seconds

    // Supabase realtime listener (unchanged)
    const channel = supabase
      .channel('realtime products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          router.refresh(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [supabase, router]);

  // The logout function now runs on the client-side for a faster user experience.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect to the public landing page.
    router.refresh(); // Refresh to ensure all server-side data is cleared.
  };
  
  return (
    <div className="p-4 sm:p-6">
      {showSubscribeBanner && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-blue-900 shadow">
          <div>
            <span className="font-semibold">Enable notifications</span> to get instant alerts for new messages, requests, and deals!
          </div>
          <Button
            variant="default"
            onClick={() => {
              setShowSubscribeBanner(false);
              const OneSignal = (window as any).OneSignal;
              if (OneSignal && typeof OneSignal.showSlidedownPrompt === 'function') {
                console.log('Attempting to show OneSignal subscribe prompt');
                OneSignal.showSlidedownPrompt();
              }
            }}
          >
            Subscribe
          </Button>
        </div>
      )}
      <div className="container mx-auto">
        <header className="flex flex-wrap gap-4 justify-between items-center pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Welcome, {profile?.name || 'Student'}!
              </h1>
              <p className="text-sm text-slate-500">
                You are browsing listings for: <span className="font-semibold">{profile?.university}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="icon" aria-label="My Profile">
                    <Link href="/profile">
                        <User className="h-5 w-5" />
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/sell">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Sell Item
                    </Link>
                </Button>
                <Button onClick={handleLogout} variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
            </div>
        </header>

        <main className="mt-8">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-20">
              <h2 className="text-xl font-medium">No items for sale yet.</h2>
              <p className="mt-2">Be the first to list something!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}