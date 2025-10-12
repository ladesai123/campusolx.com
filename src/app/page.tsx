"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { Button } from "@/components/ui/button";
import { LogIn, Leaf, Users, IndianRupee, MessageCircle, Handshake, Download, ArrowRight, Camera, CalendarClock, Tag, Share2, Bell, Zap, Loader2 } from 'lucide-react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/layout/LandingNavbar';
import MarketplaceStats from '@/components/landing/MarketplaceStats';
import FounderStoryCard from '@/components/landing/FounderStory';
import LandingProductCarousel from '@/components/landing/ProductCarousel';
import FeedbackCarousel from '@/components/landing/TestimonialsSection';

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

// UserCountSection: Shows live user count from Supabase profiles table
function UserCountSection() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setCount(count || 0);
    };
    fetchCount();
  }, []);
  return null; // No longer used as a standalone section
}






// =================================================================================
// Main Landing Page Component
// =================================================================================
export default function LandingPage() {
  const router = useRouter();
  // User count logic (fixes React hook order)
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setUserCount(count || 0);
    };
    fetchCount();
    
    // Also check auth state on mount
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
    
    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      setIsAuthenticated(!!user);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Format the user count for display
  let displayUserCount: React.ReactNode = (
    <span className="inline-block align-middle" style={{ minWidth: '2.5em', letterSpacing: '0.2em' }}>
      <span style={{
        display: 'inline-block',
        animation: 'dot-bounce 1s infinite',
        fontSize: '1.2em',
        animationDelay: '0s',
      }}>.</span>
      <span style={{
        display: 'inline-block',
        animation: 'dot-bounce 1s infinite',
        fontSize: '1.2em',
        animationDelay: '0.2s',
      }}>.</span>
      <span style={{
        display: 'inline-block',
        animation: 'dot-bounce 1s infinite',
        fontSize: '1.2em',
        animationDelay: '0.4s',
      }}>.</span>
      <style>{`
        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5em); }
        }
      `}</style>
    </span>
  );
  if (userCount !== null && userCount > 0) {
    if (userCount >= 91 && userCount <= 99) displayUserCount = '100+';
    else if (userCount > 100) displayUserCount = `${Math.ceil(userCount / 10) * 10}+`;
    else displayUserCount = String(userCount);
  }

  // --- PWA Install Logic ---
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInAppBrowser = (window.navigator as any).standalone; // iOS PWA
    
    if (isStandalone || isInAppBrowser) {
      console.log('App is already installed');
      return; // Don't show install button if already installed
    }

    const handler = (e: Event) => {
      // DON'T preventDefault here - let the browser show its native popup first
      console.log('PWA install prompt intercepted');
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Fallback: Show install button after 5 seconds if no native prompt
    const timer = setTimeout(() => {
      if (!installPrompt) {
        console.log('No native install prompt, showing manual install button');
        setShowInstallButton(true);
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      // Prevent the default behavior now and show our custom prompt
      (installPrompt as any).preventDefault();
      (installPrompt as any).prompt();
      
      // Log the user's choice
      (installPrompt as any).userChoice.then((choiceResult: any) => {
        console.log('PWA install choice:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null); // Clear the prompt after use
      });
    } else {
      // Fallback: show manual install instructions
      alert('To install CampusOlx:\n\n1. Click the browser menu (⋮)\n2. Select "Install CampusOlx"\n3. Or add to home screen\n\nNote: Installation is available on mobile browsers and some desktop browsers.');
    }
  };

  // Enhanced helper to handle login/enter marketplace with loading state
  const [authLoading, setAuthLoading] = useState(false);
  const handleAuthRedirect = async () => {
    setAuthLoading(true);
    
    // If we already know the auth state, use it
    if (isAuthenticated !== null) {
      if (isAuthenticated) {
        router.push('/home');
      } else {
        router.push('/login');
      }
      setAuthLoading(false);
      return;
    }
    
    // Otherwise, check fresh
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        // User is already logged in, redirect to home
        setIsAuthenticated(true);
        router.push('/home');
      } else {
        // User needs to login, redirect to login page
        setIsAuthenticated(false);
        router.push('/login');
      }
    } catch (err) {
      console.error('Landing page - Auth check error:', err);
      setIsAuthenticated(false);
      router.push('/login');
    }
    setAuthLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      <LandingNavbar />
      <main className="flex-grow">
        {/* Hero Section with User Count and Sign Up */}
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          {/* 1. Main Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-7xl mt-[-2.5rem]">
            Buy. Sell. <span className="text-blue-600">Reuse.</span>
          </h1>
          {/* 2. Tagline */}
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            The exclusive marketplace for SASTRA students. Save money, find what you need, and give your old items a new home, right here on campus.
          </p>
          {/* 3. User Count and Sign Up Message */}
          <div className="my-8">
            <span className="text-5xl font-black text-blue-600 tracking-tight block">
              {displayUserCount}
            </span>
            <div className="text-xl font-semibold text-slate-800 mb-1 tracking-tight mt-2">
              members are active and buying/selling right now
            </div>
            <div className="text-base text-slate-600 mt-1 mb-6">
              <span className="font-medium">Sign up in <span className="text-blue-600 font-bold">30 seconds</span> and find your first deal today!</span>
            </div>
            
            {/* 3.5 Enter Marketplace Buttons - RIGHT AFTER SIGNUP MESSAGE */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button asChild size="lg">
                <Link href="/home">
                  Enter Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {showInstallButton && (
                <Button onClick={handleInstallClick} size="lg" variant="outline">
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
              )}
            </div>
            
            <style jsx>{`
              .dot-bounce {
                display: inline-block;
                animation: bounce 1s infinite;
                font-size: 1.2em;
              }
              .dot-bounce.delay-150 { animation-delay: 0.15s; }
              .dot-bounce.delay-300 { animation-delay: 0.3s; }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-0.5em); }
              }
            `}</style>
          </div>
          
          {/* 4. Marketplace Activity Stats - AFTER BUTTONS */}
          <div className="mb-8">
            <MarketplaceStats />
          </div>
        </section>
        {/* Value Props Section - UPDATED TEXT */}
        <section className="bg-slate-50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              <ValuePropCard
                icon={<IndianRupee className="h-8 w-8 text-blue-600" />}
                title="Save big. Spend less."
                description="Discover unbeatable student-friendly prices on everything from textbooks to tech. Keep cash in your pocket where it belongs."
              />
              <ValuePropCard
                icon={<Users className="h-8 w-8 text-blue-600" />}
                title="Connect & transact safely"
                description="Buy and sell directly with verified students right here on campus. Enjoy the convenience of secure, face-to-face transactions."
              />
              <ValuePropCard
                icon={<Leaf className="h-8 w-8 text-blue-600" />}
                title="Give your gear a second life"
                description="Help build a greener campus by recycling your items. Reduce waste and make a little money while supporting sustainability."
              />
            </div>
          </div>
        </section>
        {/* Product Preview Section */}
        <section id="products" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight text-blue-600">Fresh on Campus</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Get a sneak peek at what your fellow students are selling right now.
              </p>
            </div>
            <div className="mt-16">
              <LandingProductCarousel />
            </div>
          </div>
        </section>
        {/* How It Works Section - REDESIGNED */}
        <section id="howitworks" className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight text-blue-600 mb-4">How CampusOlx Works</h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                From listing to meeting, here's your complete journey on the safest campus marketplace
              </p>
            </div>

            {/* Desktop: Grid Layout, Mobile: Vertical Timeline */}
            <div className="max-w-7xl mx-auto">
              {/* Desktop Grid (hidden on mobile) */}
              <div className="hidden lg:grid grid-cols-2 gap-12 mb-16">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Step 1: List Item */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      1
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">List Your Item</h3>
                        <p className="text-slate-600 mb-4">Take a photo, set your price, and let our AI write the description. List in under 30 seconds!</p>
                        <div className="bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800"><strong>Smart Feature:</strong> AI auto-categorizes and describes your item</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Get Notified */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      3
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Bell className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Get Instant Notifications</h3>
                        <p className="text-slate-600 mb-4">Receive push notifications when buyers show interest or message you. Never miss a potential sale!</p>
                        <div className="bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800"><strong>Stay Updated:</strong> Real-time alerts for messages, offers, and interest</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Step 2: Buyers Connect */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 relative mt-12">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      2
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Buyers Connect</h3>
                        <p className="text-slate-600 mb-4">Students browse, find your item, and send a request. Only verified SASTRA students can contact you.</p>
                        <div className="bg-slate-50 px-4 py-3 rounded-lg border-l-4 border-slate-400">
                          <p className="text-sm text-slate-700"><strong>Safe & Secure:</strong> Verified student-only marketplace</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Meet & Exchange */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      4
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Handshake className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Meet & Exchange</h3>
                        <p className="text-slate-600 mb-4">Chat securely, fix the price, choose a campus meetup spot, and complete your transaction safely.</p>
                        <div className="bg-slate-50 px-4 py-3 rounded-lg border-l-4 border-slate-400">
                          <p className="text-sm text-slate-700"><strong>On Campus:</strong> Meet in public campus areas for safe exchanges</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Timeline (visible only on mobile) */}
              <div className="lg:hidden space-y-8">
                {/* Step 1 */}
                <div className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 ml-8">
                    <div className="absolute -left-6 top-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      1
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Camera className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-bold text-slate-900">List Your Item</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">Take a photo, set your price, and let our AI write the description.</p>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-blue-800">
                      <strong>Smart Feature:</strong> AI auto-categorizes your item
                    </div>
                  </div>
                  <div className="absolute left-0 top-20 w-0.5 h-16 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 ml-8">
                    <div className="absolute -left-6 top-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      2
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Users className="w-8 h-8 text-slate-600" />
                      <h3 className="text-lg font-bold text-slate-900">Buyers Connect</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">Verified SASTRA students browse and send requests for your item.</p>
                    <div className="bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-700">
                      <strong>Safe & Secure:</strong> Student-only marketplace
                    </div>
                  </div>
                  <div className="absolute left-0 top-20 w-0.5 h-16 bg-gradient-to-b from-blue-600 to-blue-700"></div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 ml-8">
                    <div className="absolute -left-6 top-6 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      3
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Bell className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-bold text-slate-900">Get Notified</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">Receive instant push notifications for messages and offers.</p>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-blue-800">
                      <strong>Stay Updated:</strong> Real-time alerts
                    </div>
                  </div>
                  <div className="absolute left-0 top-20 w-0.5 h-16 bg-gradient-to-b from-blue-700 to-blue-600"></div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 ml-8">
                    <div className="absolute -left-6 top-6 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      4
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Handshake className="w-8 h-8 text-slate-600" />
                      <h3 className="text-lg font-bold text-slate-900">Meet & Exchange</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">Chat securely, fix price, and meet on campus for safe exchange.</p>
                    <div className="bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-700">
                      <strong>On Campus:</strong> Safe public meetups
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-16">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Start?</h3>
                    <p className="text-slate-600 text-sm">Join thousands of SASTRA students buying and selling safely</p>
                  </div>
                  <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 w-full">
                    <Link href="/home">
                      Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Tips Section - NEW! */}
        <section id="safety" className="bg-white py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-blue-600 mb-4">🛡️ Stay Safe While Trading</h2>
              <p className="text-slate-600 text-lg">Your safety is our top priority. Follow these guidelines for secure campus transactions.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                  ✅ Safe Trading Tips
                </h3>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start"><span className="mr-2">•</span>Meet in public campus areas (library, cafeteria, main entrance)</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Verify student ID before transactions</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Inspect items thoroughly before payment</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Use secure payment methods (UPI, bank transfer)</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Trust your instincts - if something feels wrong, walk away</li>
                </ul>
              </div>
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  ❌ Avoid These Red Flags
                </h3>
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-start"><span className="mr-2">•</span>Requests to meet in isolated or off-campus locations</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Sellers who won't show student ID</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Prices that seem too good to be true</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Pressure to pay immediately without inspection</li>
                  <li className="flex items-start"><span className="mr-2">•</span>Cash-only transactions for expensive items</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="text-center bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-3">🚨 Report Suspicious Activity</h3>
                <p className="text-blue-700 mb-4">If you encounter any suspicious behavior or feel unsafe, contact us immediately.</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="mailto:campusolx.connect@gmail.com?subject=Safety%20Concern">Report Issue</Link>
                </Button>
              </div>
              <div className="text-center bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="text-xl font-bold text-amber-800 mb-3">📋 Your Rights & Responsibilities</h3>
                <p className="text-amber-700 mb-4">Know your rights as a student buyer/seller on our platform.</p>
                <div className="flex gap-2 justify-center">
                  <Button asChild variant="outline" className="text-xs">
                    <Link href="/legal/privacy">Privacy Policy</Link>
                  </Button>
                  <Button asChild variant="outline" className="text-xs">
                    <Link href="/legal/terms">Terms of Service</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Carousel Section (moved just before CTA) */}
        <section id="testimonials" className="bg-[#f5f7ff] py-12 sm:py-20">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-600">See what the CampusOlx community is saying</h2>
            </div>
            <FeedbackCarousel />
          </div>
        </section>
        {/* FAQ Section */}
        <section id="faqs" className="bg-white py-20 border-t">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-extrabold text-blue-600 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {/* FAQ 1 */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>Can I sell items now and deliver them later?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">Absolutely! You can list items anytime and choose to deliver them after exams, before leaving hostel, or whenever it’s convenient for you.</div>
              </details>
              {/* FAQ 2 */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>I’m a junior/fresher—can I use CampusOlx?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">Definitely! This platform is made with you in mind. Find affordable essentials, get advice from seniors, and even share your own unused items.</div>
              </details>
              {/* FAQ 3 */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>How do I get featured on the CampusOlx homepage?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">Share your experience or feedback with us through the “Share Your Experience” button in the footer. The best stories and reviews get featured for the whole campus to see!</div>
              </details>
              {/* FAQ 4 */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>How do I contact someone about a listing?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">Each listing has a “Contact Seller” or “Message” button. Start a conversation and arrange meetups right on campus.</div>
              </details>
              {/* FAQ 5 */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>What if I don’t find what I’m looking for?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">Let us know! You can post a “Wanted” item, and someone might just have exactly what you need.</div>
              </details>
              {/* FAQ - Does CampusOlx handle payments or money transactions? */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>Does CampusOlx handle payments or money transactions?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">No, CampusOlx does not process or handle any payments. All transactions and exchanges are done directly between students. You can connect, agree on a price, and arrange payment in person or through any method you’re comfortable with. CampusOlx is here to provide a safe platform to connect SASTRA students and make buying and selling on campus easy and trustworthy.</div>
              </details>
              {/* FAQ 6 - How does CampusOlx prevent fake or scam listings? */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>How does CampusOlx prevent fake or scam listings?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">We take your safety seriously. Every item listed on CampusOlx goes through an AI-powered review, and our admin team also checks for authenticity. If any listing is found to be fake or misleading, it is immediately removed and the user is permanently blocked from CampusOlx. This ensures our marketplace stays safe and trustworthy for everyone.</div>
              </details>
              {/* FAQ 7 - Why should I use CampusOlx instead of other platforms? */}
              <details className="group border rounded-lg p-4 transition-all">
                <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                  <span>Why should I use CampusOlx?</span>
                  <span className="ml-2 text-blue-500 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-slate-700">It’s built for SASTRA students, by a SASTRA student—no scams, no random strangers, and everything is right here on campus.</div>
              </details>
            </div>
          </div>
        </section>

        {/* About Us Section - Links to Personal Story */}
        <section id="about" className="bg-slate-50 py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="mb-12">
              <h2 className="text-3xl font-extrabold text-blue-600 mb-4">Meet the Founder</h2>
              <p className="text-slate-600 text-lg">Built by a SASTRA student who saw a problem and decided to solve it</p>
            </div>
            <FounderStoryCard />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-3">💰</div>
                <h4 className="font-bold text-lg mb-2">Save Money</h4>
                <p className="text-slate-600">Affordable campus essentials for every student</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🌱</div>
                <h4 className="font-bold text-lg mb-2">Reduce Waste</h4>
                <p className="text-slate-600">Give items a second life instead of throwing them away</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h4 className="font-bold text-lg mb-2">Build Community</h4>
                <p className="text-slate-600">Connect with fellow SASTRA students safely</p>
              </div>
            </div>

          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-blue-600">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-white">Join the CampusOLX Community</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Ready to be part of SASTRA's most trusted marketplace? Start saving money, reduce waste, and connect with your campus community today.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/home">
                Get Started Now
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
