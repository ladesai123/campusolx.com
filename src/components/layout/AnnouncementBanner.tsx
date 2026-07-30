'use client';

import { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the announcement has been dismissed by the user in this session
    const isDismissed = sessionStorage.getItem('co-cloudinary-announcement-dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('co-cloudinary-announcement-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-blue-50/30 border-b border-blue-100/50 text-[#0F172A] py-2 px-4 pr-10 z-[60] transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap text-[11px] md:text-xs font-medium">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] md:text-[11px] font-semibold shrink-0 border border-blue-100/80">
          <Camera className="h-3 w-3" />
          <span>Photo Update</span>
        </span>
        <span className="text-slate-500 font-normal text-center">
          Some older product photos aren't loading due to a storage update. If your listing has no photo, please delete it and upload a new one. Sorry for the inconvenience!
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 active:bg-slate-200/80 transition-all duration-200 focus:outline-none"
        aria-label="Dismiss notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
