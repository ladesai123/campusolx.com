"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

export default function FeedbackCarousel() {
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