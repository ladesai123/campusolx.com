import { redirect, notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import { createClient } from "@/lib/server";
import type { Metadata } from "next";
import { ProductWithProfile } from "@/lib/types";

// Minimal subset for metadata fetch only
interface ProductMetaRow {
  id: number;
  title: string;
  description: string | null;
  image_urls: string[] | null;
  category: string | null;
}

// Dynamic metadata for rich link previews
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id,title,description,image_urls,category")
    .eq("id", parseInt(params.id, 10))
    .single<ProductMetaRow>();

  if (!product) {
    return {
  title: "Product not found • CampusOlx",
      description: "This listing may have been removed.",
      robots: { index: false },
    };
  }

  const url = `https://campusolx.com/product/${product.id}`;
  const image = product.image_urls?.[0];
  const safeDescription = product.description?.slice(0, 150) || "Browse campus deals on CampusOlx.";

  return {
  title: `${product.title} • CampusOlx`,
    description: safeDescription,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description: safeDescription,
      url,
  siteName: "CampusOlx",
      type: "website",
      images: image
        ? [
            {
              url: image,
              width: 800,
              height: 800,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.title,
      description: safeDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: product } = await supabase
    .from("products")
    .select(`*, profiles ( id, name, university, profile_picture_url )`)
    .eq("id", parseInt(params.id, 10))
    .single();

  if (!product) {
    notFound();
  }

  // Tell Supabase to expect a single `ProductWithProfile` object.
  // This is more type-safe than casting to `any`.
  const typedProduct = product as unknown as ProductWithProfile;

  // Ensure the `profiles` field is a single object, not an array.
  const transformedProduct: ProductWithProfile = {
    ...typedProduct,
    profiles: Array.isArray(typedProduct.profiles)
      ? typedProduct.profiles[0]
      : typedProduct.profiles,
  };

  const { data: existingConnection } = await supabase
    .from("connections")
    .select("id, status")
    .eq("product_id", parseInt(params.id, 10))
    .eq("requester_id", user.id)
    .single();

  const { data: savedItem } = await supabase
    .from("saved_items")
    .select("id")
    .eq("product_id", parseInt(params.id, 10))
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: similarProductsData } = await supabase
    .from("products")
    .select(`*, profiles ( id, name, university, profile_picture_url )`)
    .eq("category", transformedProduct.category || "")
    .neq("id", transformedProduct.id)
    .eq("status", "available")
    .limit(4);

  const similarProducts = (similarProductsData || []).map(p => ({
    ...p,
    profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
  })) as unknown as ProductWithProfile[];

  return (
    <ProductDetailsClient
      user={user}
      product={transformedProduct}
      existingConnection={existingConnection}
      initialIsSaved={!!savedItem}
      similarProducts={similarProducts}
    />
  );
}
