"use client";

import { Check, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SharePopupProps {
  product: { id: number; title: string };
  onClose: () => void;
}

export default function SharePopup({ product, onClose }: SharePopupProps) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : `https://campusolx.com/product/${product.id}`;
  const shareMessage = `Hey! Check out this item I listed on CampusOlx, the marketplace for SASTRA University: "${product.title}". You can find it here: ${shareUrl}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
  title: `Check out ${product.title} on CampusOlx`,
        text: shareMessage,
        url: shareUrl,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareMessage);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full mx-auto shadow-xl p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Thank you for listing!</h3>
        <p className="mt-2 text-sm text-gray-600">
          Your item is now live. Share it with your friends and groups to get it sold faster!
        </p>
        
        <div className="mt-6">
          <Button onClick={handleShare} className="w-full bg-blue-600 hover:bg-blue-700">
            <Share2 className="mr-2 h-4 w-4" />
            Share with Friends
          </Button>
        </div>

        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
          Maybe later
        </button>
      </div>
    </div>
  );
}
