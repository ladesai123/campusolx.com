'use client';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { Instagram, Star, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('@/components/shared/FeedbackModal'), { ssr: false });

// This is a reusable Footer component that can be placed in your main layout.
export default function Footer() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Use useSearchParams hook, not window.location.search directly in a hook
  const searchParams = useSearchParams();
  const feedbackParam = searchParams?.get('feedback');
  
  useEffect(() => {
    if (feedbackParam === '1') setShowFeedbackModal(true);
  }, [feedbackParam]);
  
  // useRouter is the correct way to handle navigation in Next.js 13+ App Router
  // const router = useRouter(); // You can use this if you need to navigate/replace URL

  return (
    <>
      <footer className="mt-12 border-t bg-gray-100">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
            {/* Share CampusOlx with a friend */}
            <div className="md:col-span-4 flex flex-col items-center gap-2 mb-4">
              <button
                type="button"
           className="inline-block rounded bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
                title="Share CampusOlx with a friend"
                onClick={() => {
                  // NOTE: Change 'https://campusolx.com' to 'http://localhost:3000' for local testing!
                  const url = 'https://campusolx.com'; // Change this line
                  const message = `Hey! Found a cool way for SASTRA students to buy & sell stuff. Check out ${url} 🚀`;
                  // Share logic remains the same
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                  if (navigator.userAgent.toLowerCase().includes('whatsapp')) {
                    window.open(whatsappUrl, '_blank');
                  } else if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
                    window.open(whatsappUrl, '_blank');
                  } else if (navigator.share) {
                    navigator.share({ text: message, title: 'CampusOlx', url });
                  } else {
                    navigator.clipboard.writeText(message);
                    alert('Share message copied! You can now paste it in WhatsApp or anywhere.');
                  }
                }}
              >
                    <span>Share CampusOlx with a friend</span>
                    <Share2 className="w-5 h-5 inline flex-shrink-0 ml-2" />
              </button>

            </div>
            {/* Section 1: Brand Info */}
            <div>
              <Logo size="lg" href="/" className="block" />
              <p className="mt-2 text-gray-500">The easiest way to buy and sell on campus.</p>
            </div>
            {/* Section 2: Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="font-semibold text-gray-700">Quick Links</h4>
              <ul className="mt-2 space-y-1 text-sm flex flex-col items-center md:items-start justify-center mx-auto">
                <li><Link href="/home" className="text-gray-500 transition-colors hover:text-blue-600">Home</Link></li>
                <li><Link href="/sell" className="text-gray-500 transition-colors hover:text-blue-600">Sell an Item</Link></li>
                <li><Link href="/profile" className="text-gray-500 transition-colors hover:text-blue-600">Your Profile</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={async () => {
                      // Check if user is logged in
                      const { createClient } = await import('@/lib/client');
                      const supabase = createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        // Redirect to login with feedback=1
                        window.location.href = `/login?feedback=1&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                      } else {
                        setShowFeedbackModal(true);
                      }
                    }}
                    className="flex items-center gap-1 text-gray-500 transition-colors hover:text-yellow-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                    title="Share Your Experience – Get Featured on Our Website!"
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    Share Your Experience
                  </button>
                </li>
              </ul>
            </div>
            {/* Section 3: Legal */}
              <div>
                <h4 className="font-semibold text-gray-700">Legal</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li><Link href="/legal/terms" className="text-gray-500 hover:text-blue-600">Terms of Service</Link></li>
                  <li><Link href="/legal/privacy" className="text-gray-500 hover:text-blue-600">Privacy Policy</Link></li>
                </ul>
              </div>
            {/* Section 4: Contact */}
            <div>
              <h4 className="font-semibold text-gray-700">Contact</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <a href="mailto:campusolx.connect@gmail.com" className="text-gray-500 hover:text-blue-600">Email Us</a>
                </li>
                <li>
                  <a href="https://instagram.com/campusolx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600">
                    <Instagram className="inline-block h-4 w-4" /> Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar: Copyright */}
          <div className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} <span className="font-semibold">Campus</span><span className="text-brand font-bold">Olx</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
} // <- Correct closing brace for the function