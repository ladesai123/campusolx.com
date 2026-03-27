import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, GraduationCap, MapPin } from 'lucide-react';
import LandingNavbar from '@/components/layout/LandingNavbar';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      <LandingNavbar />
      
      <main className="flex-grow pt-[100px]">
        {/* Hero / Header Section */}
        <section 
          className="relative bg-white px-[20px] lg:px-[80px] py-[60px] md:py-[100px] flex flex-col justify-center items-center overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center'
          }}
        >
          {/* Subtle radial gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_80%)] pointer-events-none"></div>

          <div className="max-w-[800px] w-full mx-auto relative z-10">
            
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src="/assets/profile.png" 
                  alt="Lade Sai Teja" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h1 className="text-[40px] md:text-[56px] font-[700] text-[#0F172A] tracking-tight leading-none mb-4">
                  The Story.
                </h1>
                <div className="flex flex-wrap gap-4 text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap size={18} className="text-blue-600" />
                    <span>BTech Final Year</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={18} className="text-blue-600" />
                    <span>SASTRA University</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="prose prose-slate prose-lg max-w-none">
              <div className="bg-blue-50/50 rounded-3xl p-8 mb-12 border border-blue-100/50">
                <p className="text-[20px] md:text-[22px] font-[600] text-blue-900 leading-relaxed italic mb-0">
                  "Built by a SASTRA student who saw a problem and decided to solve it."
                </p>
              </div>

              <div className="space-y-8 text-[18px] md:text-[20px] text-slate-600 leading-relaxed font-[400]">
                <p>
                  Every year, when seniors packed up and left, I'd walk through the hostels and see piles of useful things — books, lamps, cycles — just left behind or tossed away. Honestly, it hurt to watch so much go to waste, knowing that someone right here on campus could have used it. 
                </p>
                
                <p>
                  I kept thinking, <span className="text-[#0F172A] font-[600]">"Why does this keep happening? Why isn't there a simple way for us to help each other out?"</span>
                </p>

                <p>
                  That's when I decided to do something about it. CampusOlx was born from that feeling — a hope that even if I could help just one thing find a new home instead of a dustbin, it would make a difference.
                </p>

                <p>
                  For me, every item reused or passed on here is a small success. This isn't just a website or an app — it's a piece of our campus story. I kept hoping someone would create this, until I realized <span className="text-blue-600 font-[600]">I could be the one to do it.</span>
                </p>

                <p>
                  Thank you for being a part of this, for caring, and for making CampusOlx what it is. Together, we're making campus life kinder and less wasteful, one small act at a time.
                </p>
              </div>

              {/* Signature Section */}
              <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-1">Lade Sai Teja</h3>
                  <p className="text-slate-500 font-medium mb-4">Founder, CampusOLX</p>
                  <Button asChild variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2">
                    <Link href="https://ladesaiteja.me" target="_blank">
                      <Globe size={18} />
                      ladesaiteja.me
                    </Link>
                  </Button>
                </div>
                
                <div className="hidden md:block opacity-10 select-none pointer-events-none">
                   <h2 className="text-8xl font-black italic tracking-tighter">SAITEJA</h2>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Contact Link */}
      <footer className="bg-[#F8F9FC] py-12 px-6 border-t border-slate-100">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
            Made with <span className="text-[#2563EB]">💙</span> at SASTRA • 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
