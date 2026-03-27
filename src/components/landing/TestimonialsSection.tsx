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
  const displayFeedbacks = feedbacks.slice(0, 3);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full">
        {displayFeedbacks.map((fb) => (
          <div key={fb.id} className="bg-white rounded-[16px] p-[24px] shadow-soft border border-transparent flex flex-col justify-between">
            <div className="text-[#0F172A] text-[18px] mb-8 leading-relaxed italic">
              "{fb.experience}"
            </div>
            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-xl flex-shrink-0">
                {fb.name?.[0] || '?'}
              </div>
              <div>
                <div className="text-[#0F172A] font-bold text-lg leading-tight">{fb.name}</div>
                <div className="text-[#64748B] text-sm mt-1">{fb.year}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}