import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { ProductCard } from "@/components/ProductCard";
import { Profile, ProductWithProfile } from "@/lib/types";
import CategoryFilter from "@/components/shared/CategoryFilter";
import AppLoader from "@/components/shared/AppLoader";
import React, { Suspense } from "react";

/**
 * Home page (authenticated). Uses dynamic filtering via searchParams.
 * We intentionally defer reading searchParams until after the first awaited
 * call (Supabase user fetch) to satisfy Next.js guidance and avoid the
 * dynamic API usage warning.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Build base query first.
  let productsQuery = supabase
    .from("products")
    .select("*, profiles ( university )")
    .order("created_at", { ascending: false });

  // Safely normalize selected categories AFTER the first await.
  let normalizedCategories: string[] | undefined;
  if (searchParams) {
    const raw = searchParams["category"]; // could be string | string[] | undefined
    if (Array.isArray(raw)) {
      normalizedCategories = raw as string[];
    } else if (typeof raw === "string" && raw.trim().length > 0) {
      normalizedCategories = [raw];
    }
  }

  if (normalizedCategories && normalizedCategories.length > 0) {
    productsQuery = productsQuery.in("category", normalizedCategories);
  }

  // Parallel fetches: profile, filtered products, category list for counts.
  const [profileRes, productsRes, categoryCountsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    productsQuery,
    supabase.from("products").select("category"),
  ]);

  const profile = profileRes.data as Profile | null;
  let products = (productsRes.data as ProductWithProfile[]) || [];
  // Filter out hidden products
  products = products.filter((p) => !p.is_hidden);

  // Derive counts (only iterate once over small projected result set).
  interface CategoryRow {
    category: string | null;
  }
  const categoryCounts = ((categoryCountsRes.data || []) as CategoryRow[]).reduce(
    (acc, row) => {
      if (row.category) acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {profile && (
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-sm text-gray-600">
              Here are the latest listings from students at{" "}
              {profile.university || "your university"}.
            </p>
          </div>
        )}
        <CategoryFilter categoryCounts={categoryCounts} />

        <Suspense fallback={<AppLoader className="min-h-[40vh]" />}>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold">No Products Found</h2>
              <p className="mt-2 text-gray-600">
                No listings match your current filter. Try selecting different
                categories.
              </p>
            </div>
          )}
        </Suspense>
      </main>
    </>
  );
}
