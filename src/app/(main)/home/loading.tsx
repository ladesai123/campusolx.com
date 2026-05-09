import { ProductCardSkeleton, CategoryPillSkeleton, BannerSkeleton } from "@/components/shared/SkeletonLoaders";
import { MapPin } from "lucide-react";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Location bar */}
      <div className="bg-white px-4 py-2 flex items-center gap-1.5 border-b">
        <MapPin className="h-3.5 w-3.5 text-gray-200 shrink-0" />
        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="px-4 pt-4 pb-2">
        <BannerSkeleton />
      </div>

      {/* Wanted Items Strip Skeleton */}
      <div className="px-4 pt-4">
        <div className="mb-2 bg-blue-50/50 -mx-4 px-4 py-4 border-y border-blue-100 sm:rounded-2xl sm:mx-0 sm:border-x">
          <div className="flex justify-between items-end mb-3">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[160px] h-32 bg-white rounded-xl border border-gray-100 shrink-0 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills Skeleton */}
      <div className="bg-white border-b sticky top-[64px] z-40">
        <div className="flex gap-2 px-4 py-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <CategoryPillSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4 max-w-2xl mx-auto sm:max-w-none">
        {/* Listings header */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
