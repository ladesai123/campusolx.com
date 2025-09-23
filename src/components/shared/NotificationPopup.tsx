"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface NotificationPopupProps {
  message: string;
  onClose: () => void;
}

export default function NotificationPopup({ message, onClose }: NotificationPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="flex items-center gap-4 rounded-lg bg-green-100 p-4 text-green-800 shadow-lg border border-green-200">
        <CheckCircle className="h-6 w-6 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
