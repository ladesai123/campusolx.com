import { ProductCardSkeleton, CategoryPillSkeleton } from "@/components/shared/SkeletonLoaders";
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
        <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 animate-pulse" />
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
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
