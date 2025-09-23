
'use client';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { Instagram } from 'lucide-react';

// This is a reusable Footer component that can be placed in your main layout.
export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-gray-100">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
          {/* Share CampusOlx with a friend */}
          <div className="md:col-span-4 flex flex-col items-center gap-2 mb-4">
            <button
              type="button"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 transition-colors text-sm"
              title="Share CampusOlx with a friend"
              onClick={() => {
                const url = 'https://campusolx.com';
                const message = `Hey! Found a cool way for SASTRA students to buy & sell stuff. Check out ${url} 🚀`;
                // Try WhatsApp Web if available
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                if (navigator.userAgent.toLowerCase().includes('whatsapp')) {
                  window.open(whatsappUrl, '_blank');
                } else if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
                  // On mobile, open WhatsApp if installed
                  window.open(whatsappUrl, '_blank');
                } else if (navigator.share) {
                  navigator.share({ text: message, title: 'CampusOlx', url });
                } else {
                  navigator.clipboard.writeText(message);
                  alert('Share message copied! You can now paste it in WhatsApp or anywhere.');
                }
              }}
            >
              Share CampusOlx with a friend
            </button>
            <Link
              href="/why-campusolx"
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-white border border-blue-100 shadow hover:bg-blue-50 transition text-blue-700 font-semibold text-sm"
              title="Why CampusOlx? Read the story behind CampusOlx"
            >
              <img
                src="/assets/profile.png"
                alt="Lade Sai Teja, Founder CampusOlx"
                className="w-8 h-8 rounded-full border-2 border-blue-200 shadow"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
              Why CampusOlx?
            </Link>
          </div>
          {/* Section 1: Brand Info */}
          <div>
            <Logo size="lg" href="/" className="block" />
            <p className="mt-2 text-gray-500">The easiest way to buy and sell on campus.</p>
          </div>
          {/* Section 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-700">Quick Links</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li><Link href="/home" className="text-gray-500 transition-colors hover:text-blue-600">Home</Link></li>
              <li><Link href="/sell" className="text-gray-500 transition-colors hover:text-blue-600">Sell an Item</Link></li>
              <li><Link href="/profile" className="text-gray-500 transition-colors hover:text-blue-600">Your Profile</Link></li>
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
  );
}
