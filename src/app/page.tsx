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
    <div className="flex flex-col items-start p-[24px] bg-white rounded-[16px] shadow-soft border border-transparent">
      <div className="mb-6 flex h-[48px] w-[48px] items-center justify-center rounded-xl bg-[#F8F9FC] text-[#2563EB]">
        {icon}
      </div>
      <h3 className="text-[20px] font-[600] text-[#0F172A] mb-3">{title}</h3>
      <p className="text-[16px] font-[400] text-[#64748B] leading-relaxed">{description}</p>
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

// =================================================================================
// Main Landing Page Component
// =================================================================================
export default function LandingPage() {
  const router = useRouter();
  // User count logic
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
    displayUserCount = String(userCount);
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
      return; 
    }

    const handler = (e: Event) => {
      console.log('PWA install prompt intercepted');
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
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
      (installPrompt as any).preventDefault();
      (installPrompt as any).prompt();
      
      (installPrompt as any).userChoice.then((choiceResult: any) => {
        console.log('PWA install choice:', choiceResult.outcome);
        setInstallPrompt(null);
      });
    } else {
      alert('To install CampusOlx:\n\n1. Click the browser menu (⋮)\n2. Select "Install CampusOlx"\n3. Or add to home screen\n\nNote: Installation is available on mobile browsers and some desktop browsers.');
    }
  };

  // Enhanced helper to handle login/enter marketplace with loading state
  const [authLoading, setAuthLoading] = useState(false);
  const handleAuthRedirect = async () => {
    setAuthLoading(true);
    
    if (isAuthenticated !== null) {
      if (isAuthenticated) {
        router.push('/home');
      } else {
        router.push('/login');
      }
      setAuthLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        setIsAuthenticated(true);
        router.push('/home');
      } else {
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
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative bg-white px-[20px] lg:px-[80px] py-[96px] pt-[120px] lg:pt-[160px] flex flex-col justify-center items-center overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center'
          }}
        >
          {/* Subtle radial gradient overlay to fade grid near edges */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_80%)] pointer-events-none"></div>

          <div className="max-w-[1000px] w-full mx-auto relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E0E7FF] border border-[#C7D2FE] mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2563EB]"></span>
              </span>
              <span className="text-[14px] font-[600] text-[#2563EB]">
                {userCount !== null ? userCount : '1000+'} active users buying & selling right now
              </span>
            </div>
            
            <h1 className="text-[48px] lg:text-[72px] leading-[1.1] font-[700] text-[#0F172A] mb-6 tracking-tight">
              Your campus. <span className="text-[#2563EB]">Your marketplace.</span>
            </h1>
            
            <p className="max-w-[640px] mx-auto text-[18px] md:text-[20px] text-[#64748B] font-[400] leading-relaxed mb-10">
              Buy, sell, and swap with students right on your campus — no strangers, no shipping, no hassle. Just your college community.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="rounded-[16px] px-8 py-6 text-[16px] font-[600] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors border-0">
                <Link href="/home">Start Selling Today</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-[16px] px-8 py-6 text-[16px] font-[600] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8F9FC] transition-colors bg-white">
                <Link href="/home">Browse Listings</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="bg-[#F8F9FC] px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[1200px] w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[40px] font-[600] text-[#0F172A] mb-4">Trade smarter, save more, and build a greener campus</h2>
              <p className="mx-auto max-w-[640px] text-[16px] md:text-[18px] font-[400] text-[#64748B] leading-relaxed">
                Join thousands of students who are turning unused gear into cash and scoring unbelievable deals, just steps away from their dorms.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <ValuePropCard
                icon={<IndianRupee className="h-6 w-6 text-[#2563EB]" />}
                title="Save big. Spend less."
                description="Discover unbeatable student-friendly prices on everything from textbooks to tech. Keep cash in your pocket where it belongs."
              />
              <ValuePropCard
                icon={<Users className="h-6 w-6 text-[#2563EB]" />}
                title="Connect & transact safely"
                description="Buy and sell directly with verified students right here on campus. Enjoy the convenience of secure, face-to-face transactions."
              />
              <ValuePropCard
                icon={<Leaf className="h-6 w-6 text-[#2563EB]" />}
                title="Give your gear a second life"
                description="Help build a greener campus by recycling your items. Reduce waste and make a little money while supporting sustainability."
              />
            </div>
          </div>
        </section>
        
        {/* Product Preview Section */}
        <section id="products" className="bg-white px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[1200px] w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[40px] font-[600] text-[#0F172A] mb-4">Discover exactly what your peers are passing on</h2>
              <p className="mx-auto max-w-[640px] text-[16px] md:text-[18px] font-[400] text-[#64748B] leading-relaxed">
                From barely-used engineering textbooks to late-night dorm essentials, explore the absolute best deals floating around SASTRA today.
              </p>
            </div>
            <div className="w-full">
              <LandingProductCarousel />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="howitworks" className="bg-[#F8F9FC] px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[1200px] w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[40px] font-[600] text-[#0F172A] mb-4">Zero shipping. Zero strangers. Zero hassle.</h2>
              <p className="mx-auto max-w-[640px] text-[16px] md:text-[18px] font-[400] text-[#64748B] leading-relaxed">
                Experience the absolute fastest, most secure way to exchange items through our dead-simple, student-to-student four step process.
              </p>
            </div>

            <div className="relative mt-8">
              <div className="hidden lg:block absolute top-[40px] left-[12%] right-[12%] h-[1px] border-t border-dashed border-[#CBD5E1] z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center p-[24px] bg-white rounded-[16px] shadow-soft border border-transparent">
                  <div className="w-[80px] h-[80px] rounded-full bg-[#F8F9FC] text-[#2563EB] flex items-center justify-center text-[28px] font-bold mb-6">
                    1
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3">List Your Item</h3>
                  <p className="text-[16px] text-[#64748B] leading-relaxed">Take a photo, set your price, and let our AI write the description.</p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center p-[24px] bg-white rounded-[16px] shadow-soft border border-transparent">
                  <div className="w-[80px] h-[80px] rounded-full bg-[#F8F9FC] text-[#2563EB] flex items-center justify-center text-[28px] font-bold mb-6">
                    2
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3">Buyers Connect</h3>
                  <p className="text-[16px] text-[#64748B] leading-relaxed">Verified SASTRA students browse and send requests for your item securely.</p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center text-center p-[24px] bg-white rounded-[16px] shadow-soft border border-transparent">
                  <div className="w-[80px] h-[80px] rounded-full bg-[#F8F9FC] text-[#2563EB] flex items-center justify-center text-[28px] font-bold mb-6">
                    3
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3">Get Notified</h3>
                  <p className="text-[16px] text-[#64748B] leading-relaxed">Receive instant push notifications for messages, offers, and interactions.</p>
                </div>
                {/* Step 4 */}
                <div className="flex flex-col items-center text-center p-[24px] bg-white rounded-[16px] shadow-soft border border-transparent">
                  <div className="w-[80px] h-[80px] rounded-full bg-[#F8F9FC] text-[#2563EB] flex items-center justify-center text-[28px] font-bold mb-6">
                    4
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3">Meet & Exchange</h3>
                  <p className="text-[16px] text-[#64748B] leading-relaxed">Chat securely, fix price, and meet on campus for a safe public exchange.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-16">
              <Button asChild className="rounded-[16px] px-8 py-6 text-[16px] font-[600] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors border-0">
                 <Link href="/home">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Safety Tips Section */}
        <section id="safety" className="bg-white px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[1200px] w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[40px] font-[600] text-[#0F172A] mb-4">Built by students, secured by institutional trust</h2>
              <p className="mx-auto max-w-[640px] text-[16px] md:text-[18px] font-[400] text-[#64748B] leading-relaxed">
                We strictly enforce SASTRA-exclusive email verification, but maintaining a perfectly secure environment starts with smart, public trading habits.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#F8F9FC] p-[40px] rounded-[16px] border border-transparent shadow-soft">
                <h3 className="text-[20px] font-[600] text-emerald-700 mb-6 flex items-center">
                  ✅ Safe Trading Tips
                </h3>
                <ul className="space-y-4 text-[#64748B] text-[16px]">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Meet in public campus areas (library, cafeteria, main entrance)</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Verify student ID before transactions</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Inspect items thoroughly before payment</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Use secure payment methods (UPI, bank transfer)</li>
                </ul>
              </div>
              
              <div className="bg-[#F8F9FC] p-[40px] rounded-[16px] border border-transparent shadow-soft">
                <h3 className="text-[20px] font-[600] text-rose-700 mb-6 flex items-center">
                  ❌ Avoid These Red Flags
                </h3>
                <ul className="space-y-4 text-[#64748B] text-[16px]">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Requests to meet in isolated or off-campus locations</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Sellers who won't show student ID</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Prices that seem too good to be true</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span>Pressure to pay immediately without inspection</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-[#64748B] mb-6 text-[16px]">If you encounter any suspicious behavior or feel unsafe, contact us immediately.</p>
              <Button asChild className="rounded-[16px] px-6 py-5 text-[16px] font-[600] bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8F9FC]">
                <Link href="mailto:campusolx.connect@gmail.com?subject=Safety%20Concern">Report Issue</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feedback Carousel Section */}
        <section id="testimonials" className="bg-[#F8F9FC] px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[1200px] w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[40px] font-[600] text-[#0F172A] mb-4">Real students. Real deals. Real savings.</h2>
              <p className="mx-auto max-w-[640px] text-[16px] md:text-[18px] font-[400] text-[#64748B] leading-relaxed">
                Don't just take our word for it—see how keeping commerce exclusively within our campus is profoundly changing how students buy and sell.
              </p>
            </div>
            <FeedbackCarousel />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="bg-white px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[800px] w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[40px] font-[600] text-[#0F172A] mb-4">Everything you need to trade with absolute confidence</h2>
              <p className="mx-auto max-w-[640px] text-[16px] md:text-[18px] font-[400] text-[#64748B] leading-relaxed">
                Got questions? We've gathered all the answers to help you navigate, sell, and buy within the campus securely and simply.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* FAQ 1 */}
              <details className="group bg-white rounded-[16px] p-6 shadow-soft border border-transparent">
                <summary className="font-[600] text-[18px] text-[#0F172A] cursor-pointer flex items-center justify-between">
                  <span>Can I sell items now and deliver them later?</span>
                  <span className="ml-2 text-[#2563EB] group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-4 text-[16px] text-[#64748B] leading-relaxed">Absolutely! You can list items anytime and choose to deliver them after exams, before leaving hostel, or whenever it’s convenient for you.</div>
              </details>
              {/* FAQ 2 */}
              <details className="group bg-white rounded-[16px] p-6 shadow-soft border border-transparent">
                <summary className="font-[600] text-[18px] text-[#0F172A] cursor-pointer flex items-center justify-between">
                  <span>I’m a junior/fresher—can I use CampusOlx?</span>
                  <span className="ml-2 text-[#2563EB] group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-4 text-[16px] text-[#64748B] leading-relaxed">Definitely! This platform is made with you in mind. Find affordable essentials, get advice from seniors, and even share your own unused items.</div>
              </details>
              {/* FAQ 3 */}
              <details className="group bg-white rounded-[16px] p-6 shadow-soft border border-transparent">
                <summary className="font-[600] text-[18px] text-[#0F172A] cursor-pointer flex items-center justify-between">
                  <span>Does CampusOlx handle payments or money transactions?</span>
                  <span className="ml-2 text-[#2563EB] group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-4 text-[16px] text-[#64748B] leading-relaxed">No, CampusOlx does not process or handle any payments. All transactions and exchanges are done directly between students. You can connect, agree on a price, and arrange payment in person or through any method you’re comfortable with.</div>
              </details>
            </div>
          </div>
        </section>
        
        {/* CTA Banner section */}
        <section className="bg-white px-[20px] lg:px-[80px] py-[96px]">
          <div className="max-w-[1200px] w-full mx-auto text-center bg-[#2563EB] px-[20px] py-[80px] md:p-[80px] rounded-[32px] overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-[40px] font-[600] text-white mb-4 leading-tight">
                Turn your items into <br className="hidden md:block"/>
                <span className="relative inline-block whitespace-nowrap">
                  extra cash
                  <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full text-white/50 h-[8px] md:h-[12px]" viewBox="0 0 100 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 9.5C35 2 65 2 97.5 9.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                  </svg>
                </span>{" "}
                today.
              </h2>
              <p className="mx-auto max-w-[640px] text-[18px] md:text-[20px] text-blue-100 font-[500] mb-10 leading-relaxed">
                Join 1000+ students trading textbooks, gadgets, and more<br className="hidden md:block"/> every single day.
              </p>
              <Button asChild className="rounded-[12px] px-10 py-7 text-[16px] font-[700] bg-white text-[#2563EB] hover:bg-slate-50 transition-colors border-0 mb-10">
                <Link href="/login">
                  Create Your Student Account
                </Link>
              </Button>
              <div className="text-[11px] md:text-[13px] font-[700] text-blue-200 tracking-widest uppercase">
                INSTITUTIONAL VERIFICATION REQUIRED • @SASTRA.AC.IN
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
