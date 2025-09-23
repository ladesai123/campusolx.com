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
  created_at: string;
  title: string;
  description: string | null;
  price: number;
  mrp: number | null;
  category: string;
  image_urls: string[];
  status: ProductStatus;
  seller_id: string;
  available_from: string | null;
  // --- THIS IS THE FIX (Part 2) ---
  // We are updating the nested profiles object to include all the fields
  // that you are fetching and using in your components.
  profiles: {
    id: string;
    name: string;
    university: string | null;
    profile_picture_url: string | null;
  } | null;
};

