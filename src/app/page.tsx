"use client";
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



import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { Button } from "@/components/ui/button";
import { LogIn, Leaf, Users, IndianRupee, MessageCircle, Handshake, Download, ArrowRight, Camera, CalendarClock, Tag, Share2 } from 'lucide-react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/shared/Logo';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { ProductCard } from '@/components/ProductCard';


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


// Feedback Carousel Component
function FeedbackCarousel() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: 'snap',
    slides: { perView: 1.15, spacing: 16 }, // show a peek of next card on mobile
    breakpoints: {
      '(min-width: 640px)': { slides: { perView: 2, spacing: 24 } },
      '(min-width: 1024px)': { slides: { perView: 3, spacing: 32 } },
    },
    drag: true,
    renderMode: 'performance',
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('feedback')
        .select('id,name,year,experience')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      setFeedbacks(data || []);
    };
    fetchFeedbacks();
  }, []);

  if (!feedbacks.length) return null;

  return (
    <>
      <div ref={sliderRef} className="keen-slider mt-4 sm:mt-8">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="keen-slider__slide px-1 sm:px-4">
            <div className="rounded-2xl bg-white shadow-xl p-4 sm:p-6 h-full flex flex-col justify-between border border-blue-200 transition-transform duration-300 hover:scale-105 w-[90vw] max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {fb.name?.[0] || '?'}
                </div>
                <span className="text-blue-600 font-semibold text-base sm:text-lg">{fb.name}</span>
              </div>
              <div className="text-slate-700 text-base sm:text-lg mb-4 italic">{fb.experience}</div>
              <div className="text-xs text-slate-400 mt-auto">{fb.year}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {/* We use Math.ceil to correctly calculate the number of unique "slides" needed for pagination 
            based on the number of items and the slides per view on mobile (1.15). 
            However, with keen-slider's `rel` index on a loop, simple map often works fine too,
            but we'll adjust the logic to only map for the actual number of items if we want a full set of dots.
            For simplicity with `keen-slider`'s `rel` index and loop, using `feedbacks.length` is acceptable here.
        */}
        {feedbacks.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${currentSlide === idx ? 'bg-blue-600' : 'bg-blue-100'}`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </>
  );
}


// Product Carousel for Landing Page
function LandingProductCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: 'snap',
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      '(min-width: 640px)': { slides: { perView: 3, spacing: 16 } },
      '(min-width: 1024px)': { slides: { perView: 4, spacing: 20 } },
    },
    drag: true,
    renderMode: 'performance',
  });
  useEffect(() => {
    fetch('/api/products/landing')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);
  if (!products.length) return (
    <div className="text-center text-slate-400 py-12">No products to show yet.</div>
  );
  return (
    <div className="relative">
      {/* Swipe/scroll hint */}
      <div className="flex items-center justify-end mb-2 pr-2 text-blue-500 text-xs sm:text-sm select-none">
        <span className="hidden sm:inline">Scroll to see more</span>
        <span className="inline sm:hidden">Swipe to see more</span>
        <svg className="ml-1 w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <style>{`.animate-bounce-x { animation: bounce-x 1s infinite; } @keyframes bounce-x { 0%,100%{transform:translateX(0);} 50%{transform:translateX(8px);} }`}</style>
      </div>
      {/* Carousel with fixed card size */}
      <div ref={sliderRef} className="keen-slider mt-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="keen-slider__slide flex justify-center px-1"
          >
            <div className="min-w-[170px] max-w-[170px] min-h-[290px] max-h-[290px] flex flex-col h-full overflow-hidden">
              <ProductCard product={product} />
            </div>
          </div>
        ))}
      </div>
      {/* Gradient overlays for carousel edges */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-white/90 to-transparent z-10" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white/90 to-transparent z-10" />
      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors duration-200 bg-blue-100`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// =================================================================================
// Main Landing Page Component
// =================================================================================
export default function LandingPage() {
  const router = useRouter();
  // User count logic (fixes React hook order)
  const [userCount, setUserCount] = useState<number | null>(null);
  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setUserCount(count || 0);
    };
    fetchCount();
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
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
  };

  // Helper to handle login/enter marketplace
  const handleAuthRedirect = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo className="text-2xl" />
          <Button onClick={handleAuthRedirect}>
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        </div>
      </header>
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
            <div className="text-base text-slate-600 mt-1">
              <span className="font-medium">Sign up in <span className="text-blue-600 font-bold">30 seconds</span> and find your first deal today!</span>
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
          {/* 4. Enter Marketplace Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={handleAuthRedirect} size="lg">
              Enter Marketplace <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {installPrompt && (
              <Button onClick={handleInstallClick} size="lg" variant="outline">
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            )}
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
        <section className="py-24">
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
        {/* How It Works Section - NEW JOURNEY DESIGN */}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold tracking-tight text-blue-600 mb-2">Your Effortless CampusOlx Journey</h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                See how easy it is to buy, sell, and connect on campus—powered by smart features and a safe, student-first experience.
              </p>
            </div>
            {/* Timeline/Stepper */}
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Snap &amp; List</h3>
                <p className="text-slate-600 text-sm">Just take a photo—our AI writes your title, description, and picks a category (if you are lucky). List in seconds!</p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block flex-shrink-0 w-12 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full mx-2" />
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg">
                  <CalendarClock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Sell Now, Deliver Later</h3>
                <p className="text-slate-600 text-sm">Outgoing? List now, fix a deal, and deliver when you leave. Pick your date, CampusOlx handles the rest.</p>
              </div>
              <div className="hidden md:block flex-shrink-0 w-12 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full mx-2" />
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg">
                  <Tag className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Flexible Selling</h3>
                <p className="text-slate-600 text-sm">Sell now or schedule for later. Set your price, pick your date, and your listing is live.</p>
              </div>
              <div className="hidden md:block flex-shrink-0 w-12 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full mx-2" />
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg">
                  <Share2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Easy Sharing</h3>
                <p className="text-slate-600 text-sm">Share your listing with friends, groups, or juniors—get more eyes on your deal instantly.</p>
              </div>
              <div className="hidden md:block flex-shrink-0 w-12 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full mx-2" />
              {/* Step 5 */}
              <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Safe Chat &amp; Deal</h3>
                <p className="text-slate-600 text-sm">Buyers request, you accept, then chat securely to fix price and meeting spot. No spam, no hassle.</p>
              </div>
              <div className="hidden md:block flex-shrink-0 w-12 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full mx-2" />
              {/* Step 6 */}
              <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg">
                  <Handshake className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">On-campus Exchange</h3>
                <p className="text-slate-600 text-sm">Meet on campus, hand over your item, and celebrate a deal done right. No shipping, no stress.</p>
              </div>
            </div>
            {/* CTA */}
            <div className="text-center mt-16">
              <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/login">
                  Start Your CampusOlx Journey
                </Link>
              </Button>
            </div>
          </div>
        </section>
        {/* Feedback Carousel Section (moved just before CTA) */}
        <section className="bg-[#f5f7ff] py-12 sm:py-20">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-600">See what the CampusOlx community is saying</h2>
            </div>
            <FeedbackCarousel />
          </div>
        </section>
        {/* FAQ Section */}
        <section className="bg-white py-20 border-t">
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
        {/* Call to Action Section */}
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
