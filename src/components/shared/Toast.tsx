"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
}

export default function Toast({ message, onClose, duration = 3000, type = "success" }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose, duration]);

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[100] flex justify-center px-4 pb-10 transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
    >
      <div className="bg-[#2D2335] text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md w-full sm:w-auto border border-white/10">
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
        )}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-white/50" />
        </button>
      </div>
    </div>
  );
}
