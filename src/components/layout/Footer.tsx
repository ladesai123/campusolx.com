'use client';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { Instagram, Star, Share2, Globe, ChevronDown, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('@/components/shared/FeedbackModal'), { ssr: false });

function MobileAccordion({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#E2E8F0] w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex w-full items-center justify-between py-[24px] text-[18px] md:text-[20px] font-[500] text-[#0F172A] hover:text-[#2563EB] transition-colors"
      >
        {title}
        <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'}`} />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[400px] opacity-100 pb-[24px]' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const searchParams = useSearchParams();
  const feedbackParam = searchParams?.get('feedback');
  
  useEffect(() => {
    if (feedbackParam === '1') setShowFeedbackModal(true);
  }, [feedbackParam]);

  const handleShare = () => {
    const url = 'https://campusolx.com';
    const message = `Hey! Found a cool way for SASTRA students to buy & sell stuff. Check out ${url} 🚀`;
    if (navigator.share) {
      navigator.share({ text: message, title: 'CampusOlx', url });
    } else {
      navigator.clipboard.writeText(message);
      alert('Share message copied! You can now paste it in WhatsApp or anywhere.');
    }
  };

  const menuSections = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
    quickLinks: [
      { label: 'Home', href: '/home' },
      { label: 'Sell an Item', href: '/sell' },
      { label: 'Your Profile', href: '/profile' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
    ],
    contact: [
      { label: 'Email Us', href: 'mailto:campusolx.connect@gmail.com' },
      { label: 'Instagram', href: 'https://instagram.com/campusolx', external: true },
    ]
  };

  return (
    <>
      <footer className="bg-white pt-[64px] pb-[32px] md:pt-[96px] md:pb-[48px] border-t border-[#E2E8F0] relative z-10 w-full font-sans">
        <div className="max-w-[1200px] mx-auto px-[20px] lg:px-[80px]">
          
          <div className="grid grid-cols-1 md:grid-cols-12 md:gap-16 lg:gap-24 mb-16 md:mb-24">
            
            {/* Left Column (Brand & Location) */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-start mb-8 md:mb-0">
              
              <div className="flex w-full items-center justify-between md:mb-8">
                {/* Logo matches top left in mobile and web */}
                <div className="w-[120px] md:w-[150px]">
                  <Logo size="lg" href="/" className="block" />
                </div>
                
                {/* Mobile Button matched on top right */}
                <button 
                  onClick={handleShare}
                  className="flex md:hidden items-center gap-2 rounded-[8px] border border-[#CBD5E1] px-4 py-2 text-[14px] font-[600] text-[#0F172A] hover:bg-[#F8F9FC] hover:border-[#94A3B8] transition-all"
                >
                  Share <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Globe Icon & Location Text */}
              <div className="flex items-center gap-3 text-[#0F172A] font-[600] text-[16px] md:text-[18px] mt-6 md:mt-0 mb-8 md:mb-12">
                <Globe className="h-5 w-5 md:h-6 md:w-6" />
                <span>SASTRA University</span>
              </div>
              
              {/* Desktop Button under Location */}
              <button 
                onClick={handleShare}
                className="hidden md:flex items-center gap-2 rounded-[8px] border border-[#CBD5E1] px-6 py-2.5 text-[16px] font-[600] text-[#0F172A] hover:bg-[#F8F9FC] hover:border-[#94A3B8] transition-all"
              >
                Share CampusOlx <ArrowRight className="h-4 w-4" />
              </button>
              
            </div>

            {/* Right Columns (Desktop Menu Grid) */}
            <div className="hidden md:grid md:col-span-8 lg:col-span-9 grid-cols-4 gap-8">
              <div>
                <h4 className="font-[600] text-[#0F172A] mb-8 text-[18px]">Company</h4>
                <ul className="space-y-4 text-[#0F172A] text-[15px] font-[500]">
                  {menuSections.company.map(link => (
                    <li key={link.label}><Link href={link.href} className="hover:underline underline-offset-4">{link.label}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-[600] text-[#0F172A] mb-8 text-[18px]">Quick Links</h4>
                <ul className="space-y-4 text-[#0F172A] text-[15px] font-[500]">
                  {menuSections.quickLinks.map(link => (
                    <li key={link.label}><Link href={link.href} className="hover:underline underline-offset-4">{link.label}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-[600] text-[#0F172A] mb-8 text-[18px]">Resources</h4>
                <ul className="space-y-4 text-[#0F172A] text-[15px] font-[500]">
                   <li>
                    <button onClick={() => setShowFeedbackModal(true)} className="hover:underline underline-offset-4 text-left w-full">
                      Submit Feedback
                    </button>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:underline underline-offset-4 text-left w-full">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-[600] text-[#0F172A] mb-8 text-[18px]">Contact</h4>
                <ul className="space-y-4 text-[#0F172A] text-[15px] font-[500]">
                  {menuSections.contact.map(link => (
                    <li key={link.label}>
                      <a 
                        href={link.href} 
                        target={link.external ? "_blank" : "_self"} 
                        rel={link.external ? "noopener noreferrer" : ""} 
                        className="hover:underline underline-offset-4"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile Accordion Menu */}
            <div className="md:hidden flex flex-col w-full border-t border-[#E2E8F0]">
              <MobileAccordion title="Company">
                <ul className="space-y-4 text-[#0F172A] text-[16px] font-[500]">
                  {menuSections.company.map(link => (
                    <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
                  ))}
                </ul>
              </MobileAccordion>
              
              <MobileAccordion title="Quick Links">
                <ul className="space-y-4 text-[#0F172A] text-[16px] font-[500]">
                  {menuSections.quickLinks.map(link => (
                    <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
                  ))}
                </ul>
              </MobileAccordion>

              <MobileAccordion title="Resources">
                <ul className="space-y-4 text-[#0F172A] text-[16px] font-[500]">
                  <li>
                    <button onClick={() => setShowFeedbackModal(true)} className="text-left w-full">
                      Submit Feedback
                    </button>
                  </li>
                  <li>
                    <Link href="/faq" className="text-left w-full">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </MobileAccordion>

              <MobileAccordion title="Contact">
                <ul className="space-y-4 text-[#0F172A] text-[16px] font-[500]">
                  {menuSections.contact.map(link => (
                    <li key={link.label}>
                      <a href={link.href} target={link.external ? "_blank" : "_self"} rel={link.external ? "noopener noreferrer" : ""}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </MobileAccordion>
            </div>
            
          </div>

          {/* Bottom Bar: Legal and Copyright */}
          <div className="flex flex-col border-t border-[#E2E8F0] pt-[32px] md:pt-[48px] mt-[64px] md:mt-[96px] gap-4">
            <div className="flex flex-wrap gap-4 md:gap-8 text-[13px] md:text-[14px] font-[500] text-[#64748B]">
              <Link href="/legal/terms" className="hover:text-[#2563EB] transition-colors hover:underline underline-offset-4">Terms of Service</Link>
              <Link href="/legal/privacy" className="hover:text-[#2563EB] transition-colors hover:underline underline-offset-4">Privacy Policy</Link>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-[13px] md:text-[14px] font-[400] text-[#94A3B8]">
                 &copy; {new Date().getFullYear()} CampusOlx. All rights reserved.
              </div>
              <div className="text-[#94A3B8] text-[12px] font-[600] uppercase tracking-widest">
                Made with <span className="text-[#2563EB]">💙</span> at SASTRA • 2025
              </div>
            </div>
          </div>
          
        </div>
      </footer>
      <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
}