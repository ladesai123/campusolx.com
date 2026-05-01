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
  whatsapp_number: string | null;
  view_count: number;
  bumped_at: string | null;
};

export type RequestWithProfile = Database["public"]["Tables"]["requests"]["Row"] & {
  profiles: {
    id: string;
    name: string;
    university: string | null;
    profile_picture_url: string | null;
  } | null;
};
// This file defines the shape of the data used throughout your application.

// Defines the new, more specific statuses a product can have.
export type ProductStatus = 'available' | 'sold' | 'pending_reservation' | 'reserved';

// Defines the structure of a user's profile information.
export type Profile = {
  id: string;
  created_at: string | null;
  name: string;
  university: string;
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
  view_count?: number;
  bumped_at?: string | null;
};

