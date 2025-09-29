"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, ImageOff } from "lucide-react";

interface ShareButtonProps {
  productId: number;
  title: string;
  imageUrl?: string | null;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default" | "lg";
  className?: string;
  compact?: boolean; // if true, show only icon
  message?: string; // Optional custom message template. If contains {url} placeholder it will be replaced. Otherwise URL appended.
  attachImage?: boolean; // New flag: only attempt Web Share Level 2 with image when true
}

export default function ShareButton({ productId, title, imageUrl, variant = "ghost", size = "icon", className = "", compact = true, message, attachImage = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [fileUnsupported, setFileUnsupported] = useState(false);

  // Determine origin dynamically for local dev vs prod.
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://campusolx.com';
  const shareUrl = `${origin}/product/${productId}`;

  const shareMessage = (() => {
    if (message) {
      if (message.includes('{url}')) return message.replace('{url}', shareUrl);
      return `${message}\n${shareUrl}`;
    }
    // Use the same message as in the user's production code
    return `Hey! Check out this item: "${title}" on CampusOlx, a marketplace for SASTRA students to buy and sell second-hand things. ${shareUrl} 🚀`;
  })();

  const tryFileShare = async () => {
    if (!attachImage || !imageUrl) return false;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `campusolx-${productId}.jpg`, { type: blob.type || "image/jpeg" });
      const data: ShareData & { files?: File[] } = {
  title: `Buy ${title} on CampusOlx`,
        text: shareMessage,
        url: shareUrl,
        files: [file],
      };
      if ((navigator as any).canShare && (navigator as any).canShare({ files: data.files })) {
        await (navigator as any).share(data);
        return true;
      } else {
        setFileUnsupported(true);
        return false;
      }
    } catch (err) {
      console.warn('File share failed, falling back', err);
      return false;
    }
  };

  const handleShare = async () => {
    try {
      // If image attach requested, attempt it first (Web Share Level 2)
      if (attachImage) {
        const fileShared = await tryFileShare();
        if (fileShared) return;
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      if (navigator.userAgent.toLowerCase().includes('whatsapp')) {
        window.open(whatsappUrl, '_blank');
        return;
      } else if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
        window.open(whatsappUrl, '_blank');
        return;
      } else if (navigator.share) {
        await navigator.share({ text: shareMessage, title: 'CampusOlx', url: shareUrl });
        return;
      } else {
        await navigator.clipboard.writeText(shareMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        alert('Share message copied! You can now paste it in WhatsApp or anywhere.');
      }
    } catch (e) {
      console.warn("Share cancelled or failed", e);
    }
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <Button aria-label="Share this product" variant={variant} size={size} onClick={handleShare}>
        <Share2 className="h-5 w-5" />
        {!compact && <span className="ml-2">Share</span>}
      </Button>
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow">
          Copied!
        </span>
      )}
      {fileUnsupported && attachImage && (
        <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow flex items-center gap-1">
          <ImageOff className="h-3 w-3" /> Img preview not supported
        </span>
      )}
    </div>
  );
}
