import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import LandingNavbar from '@/components/layout/LandingNavbar';

export default function BlogComingSoon() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      <main className="flex-grow flex flex-col items-center justify-center">
        <section 
          className="relative w-full flex-grow flex flex-col justify-center items-center px-[20px] lg:px-[80px] overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_80%)] pointer-events-none"></div>

          <div className="max-w-[800px] w-full mx-auto relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-6 text-blue-600 shadow-sm">
              <span className="text-xl leading-none">🍳</span>
              <span className="text-[13px] font-[700] tracking-wide uppercase">Engineering & Product Blog</span>
            </div>
            
            <h1 className="text-[48px] md:text-[64px] lg:text-[76px] leading-[1.1] font-[700] text-[#0F172A] mb-6 tracking-tight">
              We're cooking.
            </h1>
            
            <p className="max-w-[540px] mx-auto text-[18px] md:text-[20px] text-[#64748B] font-[400] leading-relaxed mb-10">
              Something massive is brewing behind the scenes. Check back soon for stories, product updates, and brutally honest insights from the team.
            </p>
            
            <Button asChild className="rounded-[16px] px-8 py-6 text-[16px] font-[600] bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors">
               <Link href="/">
                 <ArrowLeft className="mr-2 h-5 w-5" />
                 Head back to Commerce
               </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
