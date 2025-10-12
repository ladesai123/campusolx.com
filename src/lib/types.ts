import type { Database } from "@/lib/database.types";

// For joined product + profile queries
export type ProductWithProfile = Database["public"]["Tables"]["products"]["Row"] & {
  profiles: {
    id: string;
    name: string;
    university: string | null;
    profile_picture_url: string | null;
  } | null;
  is_negotiable: boolean;
};
// This file defines the shape of the data used throughout your application.

// Defines the new, more specific statuses a product can have.
export type ProductStatus = 'available' | 'sold' | 'pending_reservation' | 'reserved';

// Defines the structure of a user's profile information.
export type Profile = {
  id: string;
  name: string;
  university: string;
  // --- THIS IS THE FIX (Part 1) ---
  // We are adding the profile picture URL to the main Profile type.
  profile_picture_url: string | null;
};

// Defines the structure of a product listing.
export type Product = {
  id: number;
  created_at: string | null;
  title: string;
  description: string | null;
  price: number | null;
  mrp: number | null;
  category: string;
  image_urls: string[];
  status: ProductStatus;
  seller_id: string;
  available_from: string | null;
  profiles: {
    id: string;
    name: string;
    university: string | null;
    profile_picture_url: string | null;
  } | null;
  is_negotiable: boolean;
};

