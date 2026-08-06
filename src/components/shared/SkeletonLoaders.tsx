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

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
      <div className="bg-white rounded-2xl p-5 border space-y-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 py-3 bg-gray-50 rounded-xl">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border shadow-sm">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}
