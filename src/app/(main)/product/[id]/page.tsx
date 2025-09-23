import { redirect, notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import { createClient } from "@/lib/server";
import type { Metadata } from "next";

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

  const { data: existingConnection } = await supabase
    .from("connections")
    .select("id, status")
    .eq("product_id", parseInt(params.id, 10))
    .eq("requester_id", user.id)
    .single();

  return <ProductDetailsClient user={user} product={product} existingConnection={existingConnection} />;
}
