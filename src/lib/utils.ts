import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Injects Cloudinary optimization parameters into a raw secure_url.
 * This saves bandwidth by serving a compressed WebP instead of the raw original image.
 */
const BEAUTIFUL_IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='4' fill='%23f8fafc'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5' fill='%23cbd5e1'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";

export function getOptimizedCloudinaryUrl(url: string | null | undefined, width = 500): string {
  if (!url) return BEAUTIFUL_IMAGE_FALLBACK;
  
  // Only process Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Inject q_auto (auto quality), f_auto (auto format like webp/avif), and w_{width} for resizing
    return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
  }
  
  return url;
}
