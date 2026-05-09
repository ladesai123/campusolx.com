import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Injects Cloudinary optimization parameters into a raw secure_url.
 * This saves bandwidth by serving a compressed WebP instead of the raw original image.
 */
export function getOptimizedCloudinaryUrl(url: string | null | undefined, width = 500): string {
  if (!url) return '/placeholder.png';
  
  // Only process Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Inject q_auto (auto quality), f_auto (auto format like webp/avif), and w_{width} for resizing
    return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
  }
  
  return url;
}
