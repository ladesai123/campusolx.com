"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { useKeenSlider } from 'keen-slider/react';
import { ProductCard } from '@/components/ProductCard';
import 'keen-slider/keen-slider.min.css';

export default function LandingProductCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
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
        <p className="text-slate-500">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
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
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${currentSlide === idx ? 'bg-blue-600' : 'bg-blue-100'}`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}