"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { useKeenSlider } from 'keen-slider/react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import 'keen-slider/keen-slider.min.css';

function LandingProductCard({ product }: { product: any }) {
  const price = typeof product.price === 'number' ? product.price : 0;
  const formattedPrice = price > 0
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(price)
    : 'Free';

  // Calculate simulated MRP & Discount for visual demonstration if DB doesn't have it explicitly
  const mrp = product.mrp || (price > 0 ? Math.round(price * 1.5) : null);
  const discountPercentage = mrp && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const formattedMRP = mrp
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(mrp)
    : '';

  const isSoldOut = product.status === 'sold';
  const isNegotiable = product.is_negotiable;

  return (
    <Link href={`/product/${product.id}`} className="group relative flex flex-col h-full bg-white rounded-[16px] shadow-sm hover:shadow-md border border-slate-100 overflow-hidden mx-2 my-4 transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-[60%] w-full bg-[#F8F9FC] overflow-visible">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={product.image_urls?.[0] || '/placeholder.png'}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-70' : ''}`}
          />
        </div>

        {/* Top Right: Status Badges (Quiet & Simple) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10 pointer-events-none">
          {isSoldOut ? (
            <Badge className="bg-red-50/95 text-red-600 border border-red-100 shadow-sm font-semibold text-[10px] px-2 py-0.5 uppercase tracking-wider">
              Sold Out
            </Badge>
          ) : isNegotiable ? (
            <Badge className="bg-blue-50/95 text-blue-600 border border-blue-100 shadow-sm font-semibold text-[10px] px-2 py-0.5 uppercase tracking-wider">
              Negotiable
            </Badge>
          ) : null}
        </div>
        
        {/* Overlapping Share Button (Bottom Right of Image) */}
        <div className="absolute -bottom-5 right-4 z-20 transition-transform duration-300 group-hover:-translate-y-1">
           <div className="h-11 w-11 bg-white rounded-[14px] shadow-sm border border-slate-100 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-colors pointer-events-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
           </div>
        </div>
      </div>
      
      {/* Text Content */}
      <div className="flex flex-col flex-grow p-5 pt-6 justify-start bg-white z-0">
        <h3 className="text-[18px] font-[600] text-[#0F172A] line-clamp-2 leading-tight mb-3">
          {product.title}
        </h3>
        
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-[700] text-[#0F172A] tracking-[-0.02em]">{formattedPrice}</span>
            {mrp && discountPercentage > 0 && (
              <span className="text-[14px] font-[500] text-slate-500 line-through decoration-slate-400">
                MRP: {formattedMRP.replace('₹', '')}
              </span>
            )}
          </div>
          {mrp && discountPercentage > 0 && (
            <span className="text-[14px] font-[600] text-emerald-600 tracking-tight">
              ({discountPercentage}% off)
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LandingProductCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: 'snap',
    slides: { perView: 1.2, spacing: 16 },
    breakpoints: {
      '(min-width: 640px)': { slides: { perView: 2.2, spacing: 24 } },
      '(min-width: 1024px)': { slides: { perView: 3.2, spacing: 32 } },
    },
    drag: true,
    renderMode: 'performance',
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });
  
  useEffect(() => {
    async function fetchLandingProducts() {
      try {
        const supabase = createClient();
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('show_on_landing', true)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) {
          console.error('Error fetching landing products:', error);
          return;
        }
        
        setProducts(products || []);
      } catch (error) {
        console.error('Error in fetchLandingProducts:', error);
      }
    }
    
    fetchLandingProducts();
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#64748B]">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative pb-8">
      <div ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <div
            key={product.id}
            className="keen-slider__slide h-[400px] sm:h-[450px]"
          >
            <LandingProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}