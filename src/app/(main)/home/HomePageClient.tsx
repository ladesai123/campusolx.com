'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import { ProductCard } from '@/components/ProductCard';
import Navbar from '@/components/layout/Navbar';

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
  // We use `useState` to manage the list of products on the client-side.
  const [products, setProducts] = useState(initialProducts);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // ✅ REMOVED DUPLICATE initOneSignal() - handled globally in OneSignalInit.tsx

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

    // ✅ OneSignal subscription is now handled by OneSignalHomePrompt component

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return (
    <>
      <Navbar />

      <div className="p-4 sm:p-6">
        <div className="container mx-auto">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome, {profile?.name || 'Student'}!
            </h1>
            <p className="text-sm text-slate-500">
              You are browsing listings for: <span className="font-semibold">{profile?.university}</span>
            </p>
          </div>

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
    </>
  );
}