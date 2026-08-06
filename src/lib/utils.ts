import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Injects Cloudinary optimization parameters into a raw secure_url.
 * This saves bandwidth by serving a compressed WebP instead of the raw original image.
 */
const BEAUTIFUL_IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' fill='none'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Cg transform='translate(88, 88)'%3E%3Crect width='24' height='24' x='0' y='0' rx='4' stroke='%23cbd5e1' stroke-width='1.5' fill='%23f8fafc'/%3E%3Ccircle cx='7' cy='7' r='1.5' fill='%23cbd5e1'/%3E%3Cpath d='m21 15-5-5L5 21' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E";

export function getOptimizedCloudinaryUrl(url: string | null | undefined, width = 500): string {
  if (!url) return BEAUTIFUL_IMAGE_FALLBACK;
  
  // Only process Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Inject q_auto (auto quality), f_auto (auto format like webp/avif), and w_{width} for resizing
    return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
  }
  
  return url;
}
