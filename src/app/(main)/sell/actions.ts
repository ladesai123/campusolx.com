'use server';

import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';
import { ProductStatus } from '@/lib/types'; // We import our specific status types for code safety

// Configure Cloudinary with your server-side credentials. This is secure because it only runs on the server.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function sellItemAction(formData: FormData) {
  // --- 1. Read all form data, including the new availability fields ---
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string, 10);
  const mrp = formData.get('mrp') ? parseInt(formData.get('mrp') as string, 10) : null;
  const category = formData.get('category') as string;
  const images = formData.getAll('images') as File[];
  
  // These are the new fields from your "Smart" Sell Form
  const availability = formData.get('availability') as string; // Will be 'now' or 'future'
  const availableDate = formData.get('available_date') as string; // The date string if 'future'

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to sell an item.' };
  }
  
  // File size validation remains the same
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  for (const image of images) {
    if (image.size > MAX_FILE_SIZE) {
      console.error(`Server-side check failed: File "${image.name}" is too large.`);
      return; 
    }
  }

  // --- 2. UPGRADED: Upload images securely to Cloudinary ---
  const imageUrls: string[] = [];
  for (const image of images) {
    if (image.size > 0) {
      try {
        const imageBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          uploadStream.end(buffer);
        });
        // @ts-ignore
        imageUrls.push(result.secure_url);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        continue; // If one image fails, we continue with the others
      }
    }
  }

  // --- 3. UPGRADED: Determine the correct status and availability date ---
  let itemStatus: ProductStatus = 'available';
  let availableFromValue: string | null = null;

  if (availability === 'future' && availableDate) {
    // This is the initial state for a reservable item
    itemStatus = 'pending_reservation'; 
    availableFromValue = availableDate;
  }

  // --- IMAGE VALIDATION: Ensure at least one image was uploaded ---
  if (!imageUrls.length) {
    return { success: false, error: 'At least one image is required to list a product. Please upload a valid image.' };
  }

  // --- 4. UPGRADED: Insert product data with the new dynamic fields ---
  const { data: newProduct, error: insertError } = await supabase.from('products').insert({
    seller_id: user.id,
    title,
    description,
    price: isNaN(price) ? 0 : price,
    mrp: (mrp && !isNaN(mrp)) ? mrp : null,
    category,
    image_urls: imageUrls,
    status: itemStatus,             // <-- Using our new dynamic status
    available_from: availableFromValue, // <-- Using our new date value
  }).select('id, title').single();

  if (insertError) {
    console.error('Database insert error:', insertError);
    return { success: false, error: 'Database insert error' };
  }

  // --- 5. Revalidate paths and redirect (this part remains the same) ---
  revalidatePath('/home');
  revalidatePath('/profile');
  
  return { success: true, product: newProduct };

};

