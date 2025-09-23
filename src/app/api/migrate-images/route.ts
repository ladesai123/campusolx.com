// src/app/api/migrate-images/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Admin Clients
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // IMPORTANT: Make sure this secret key matches the one in your URL
  if (secret !== 'c@mpusolx-2025') { 
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting migration with FINAL logic (Filter in Code)...');

    // 1. Fetch ALL products that have an image_urls value.
    // We REMOVED the failing .like() filter.
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, title, image_urls')
      .not('image_urls', 'is', null);

    if (productError) throw productError;
    console.log(`Fetched ${products.length} total products with images.`);

    let migratedCount = 0;
    let productsToMigrate = 0;

    // 2. Loop through each product.
    for (const product of products) {
      if (!product.image_urls || product.image_urls.length === 0) {
        continue; // Skip if array is empty
      }
      
      const imageUrlToUpload = product.image_urls[0];

      // 3. Use JAVASCRIPT to check if it's a Supabase URL that needs migrating.
      if (!imageUrlToUpload.includes('supabase.co')) {
          console.log(`- Product ${product.id} ("${product.title}") seems already migrated or is not a Supabase URL. Skipping.`);
          continue;
      }

      productsToMigrate++; // Increment count of products we will attempt to migrate

      try {
        console.log(`- Processing product: "${product.title}" (ID: ${product.id})`);
        
        // 4. Tell Cloudinary to upload the image.
        console.log(`  > Uploading to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(imageUrlToUpload, {
          folder: 'products',
        });
        
        // 5. Update the product row with the new Cloudinary URL.
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ image_urls: [uploadResult.secure_url] })
          .eq('id', product.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`  > ✨ Successfully migrated product ${product.id}.`);
        migratedCount++;
      } catch (e: any) {
        console.error(`- Failed to migrate product ${product.id} ("${product.title}"): ${e.message}`);
      }
    }

    return NextResponse.json({
      message: 'Migration process finished.',
      totalProductsFound: products.length,
      productsToMigrate,
      migratedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Migration failed', error: error.message }, { status: 500 });
  }
}