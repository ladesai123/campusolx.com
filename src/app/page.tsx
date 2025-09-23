'use client'; // <-- IMPORTANT: We make this a Client Component to handle user interaction.

import { useState, useEffect } from 'react'; // <-- Import hooks for state and effects
import { Button } from "@/components/ui/button";
import { LogIn, Leaf, Users, IndianRupee, Instagram, Linkedin, Mail, ArrowRight, Camera, MessageCircle, Handshake, Download } from 'lucide-react'; // <-- Added Download icon
import Link from 'next/link';
import Logo from '@/components/shared/Logo';

// =================================================================================
// Main Landing Page Component
// =================================================================================
export default function LandingPage() {
  // --- PWA Install Logic ---
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // This effect listens for the browser's "beforeinstallprompt" event.
    // This event fires when the browser determines the site is an installable PWA.
    const handler = (e: Event) => {
      e.preventDefault(); // Prevent the browser from showing its default install banner.
      setInstallPrompt(e); // Save the event so we can trigger it later.
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Cleanup the event listener when the component unmounts.
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return; // Guard clause if the prompt isn't ready.

    // Show the browser's installation prompt.
    (installPrompt as any).prompt();
  };
  // --- End of PWA Install Logic ---

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo className="text-2xl" />
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">
            Buy. Sell. <span className="text-blue-600">Reuse.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            The exclusive marketplace for SASTRA students. Save money, find what you need, and give your old items a new home, right here on campus.
          </p>
          
          {/* ===== THIS IS THE FIX ===== */}
          {/* This container will now show the "Install App" button next to the main button
              but ONLY if the browser has confirmed the app is installable. */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                Enter Marketplace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            {/* The "Install App" button is conditionally rendered here */}
            {installPrompt && (
              <Button onClick={handleInstallClick} size="lg" variant="outline">
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            )}
          </div>
        </section>

        {/* --- All other sections remain the same --- */}
        <section className="bg-slate-50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              <ValuePropCard
                icon={<IndianRupee className="h-8 w-8 text-blue-600" />}
                title="Save Smart"
                description="Find textbooks, electronics, and more at student-friendly prices. Your wallet will thank you."
              />
              <ValuePropCard
                icon={<Users className="h-8 w-8 text-blue-600" />}
                title="Connect with Peers"
                description="Deal directly with fellow students on campus. It's safe, convenient, and builds a stronger community."
              />
              <ValuePropCard
                icon={<Leaf className="h-8 w-8 text-blue-600" />}
                title="Live Sustainably"
                description="Give your items a second life. Every transaction reduces waste and contributes to a greener campus."
              />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">Fresh on Campus</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Get a sneak peek at what your fellow students are selling right now.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <ProductPreviewCard
                title="Algorithms Textbook"
                price="₹450"
                category="Books"
                emoji="📚"
              />
              <ProductPreviewCard
                title="Study Desk Lamp"
                price="₹300"
                category="Furniture"
                emoji="💡"
              />
              <ProductPreviewCard
                title="Noise-Cancelling Headphones"
                price="₹1,200"
                category="Electronics"
                emoji="🎧"
              />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">A Simple, Safe Campus Story</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                        From listing to meetup, here’s how easy it is to connect and transact with fellow students.
                    </p>
                </div>
                <div className="relative mt-16">
                    <div className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 md:block">
                        <div className="mx-auto w-2/3 border-t-2 border-dashed border-slate-300"></div>
                    </div>
                    <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
                        <HowItWorksStep
                            icon={<Camera className="h-7 w-7" />}
                            title="Snap & List"
                            description="Take a photo, add a title and price. Your item is instantly live for others on campus to see."
                        />
                        <HowItWorksStep
                            icon={<MessageCircle className="h-7 w-7" />}
                            title="Chat Securely"
                            description="This is our core feature! Use our private chat to talk to buyers without sharing personal contact info."
                        />
                        <HowItWorksStep
                            icon={<Handshake className="h-7 w-7" />}
                            title="Meet on Campus"
                            description="Agree on a public place on campus to exchange your item. No shipping, no hassle."
                        />
                    </div>
                </div>
            </div>
        </section>
        
        <section className="bg-blue-600">
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-bold text-white">Ready to Join Your Campus Marketplace?</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
                    Sign up in seconds and start buying, selling, and reusing today.
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8 bg-white text-blue-600 hover:bg-slate-100">
                    <Link href="/login">
                        Get Started Now
                    </Link>
                </Button>
            </div>
        </section>
      </main>

    </div>
  );
}

// Helper Components
function ValuePropCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  );
}

function ProductPreviewCard({ title, price, category, emoji }: { title: string; price: string; category: string; emoji: string; }) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex h-48 items-center justify-center rounded-t-lg bg-slate-100 text-6xl">
        {emoji}
      </div>
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{category}</p>
        <h3 className="mt-1 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-lg font-semibold text-slate-500">{price}</p>
        <Button asChild className="mt-4 w-full" variant="outline">
          <Link href="/login">
            View Item
          </Link>
        </Button>
      </div>
    </div>
  );
}

function HowItWorksStep({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
    return (
      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-md">
            {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>
    );
  }

