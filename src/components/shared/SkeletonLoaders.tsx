import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm relative h-full">
      <div className="aspect-square w-full bg-slate-100 animate-shimmer" />
      <div className="p-3 flex-grow space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-6 w-1/3" />
        <div className="pt-3 border-t border-gray-50 flex justify-between">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  );
}

export function CategoryPillSkeleton() {
    return (
        <Skeleton className="h-14 w-20 rounded-2xl shrink-0" />
    );
}

export function BannerSkeleton() {
    return (
        <Skeleton className="w-full h-32 rounded-2xl" />
    );
}
