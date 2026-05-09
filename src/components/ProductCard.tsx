'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Tag, Undo2, CalendarClock, Share2, Eye, Heart, Handshake } from 'lucide-react';
import { toggleProductStatus } from '@/app/(main)/profile/actions'; 
import { SubmitButton } from '@/components/shared/SubmitButton'; 
import type { ProductWithProfile } from '@/lib/types';
import ShareButton from '@/components/shared/ShareButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLoader from '@/components/shared/AppLoader';

interface ProductCardProps {
  product: ProductWithProfile;
  showAdminActions?: boolean;
  deleteAction?: (id: number) => Promise<void>;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

// Helper function to format the future availability date nicely (e.g., "Dec 20")
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // timeZone: 'UTC' is added to prevent the date from shifting due to the user's local timezone.
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

// Helper function to calculate the discount percentage.
const calculateDiscount = (price: number | null, mrp: number | null) => {
  if (price === null || !mrp || mrp <= price) return null;
  const discount = ((mrp - price) / mrp) * 100;
  return Math.round(discount);
};

export function ProductCard({ product, showAdminActions = false, deleteAction, isSaved, onToggleSave }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.mrp);
  // Virtualization: Instantly treat expired reservations as 'available'
  const now = new Date();
  const availableFromDate = product.available_from ? new Date(product.available_from) : null;
  const hasReservationPassed = availableFromDate ? now >= availableFromDate : false;
  const effectiveStatus = (product.status === 'pending_reservation' && hasReservationPassed) 
    ? 'available' 
    : product.status;

  const isReservable = effectiveStatus === 'pending_reservation' && !!product.available_from;
  const isReserved = effectiveStatus === 'reserved';
  const formattedPrice = typeof product.price === 'number'
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(product.price)
    : 'Free';

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <AppLoader />
        </div>
      )}
      <div className="relative">
        <a href={`/product/${product.id}`} className="block" onClick={handleProductClick} tabIndex={0} role="button">
          <div className="aspect-square w-full overflow-hidden relative flex items-end justify-end bg-slate-100">
            <Image
              src={product.image_urls?.[0] && product.image_urls[0].length > 0 ? product.image_urls[0] : '/placeholder.png'}
              alt={`${product.title} - ${product.category || 'Product'} for sale`}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
        </div>
      </a>

      {/* Action Buttons Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {onToggleSave && (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave();
                }}
                className="absolute top-2 right-2 z-10 bg-white rounded-full shadow-sm p-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group/heart pointer-events-auto"
                title={isSaved ? "Remove from Favourites" : "Save to Favourites"}
            >
                <Heart 
                    className={`h-3.5 w-3.5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover/heart:text-red-400'}`} 
                />
            </button>
        )}
        
        <div className="absolute bottom-2 right-2 z-10 pointer-events-auto">
            <ShareButton 
                productId={product.id} 
                title={product.title} 
                imageUrl={product.image_urls?.[0]} 
                variant="ghost" 
                size="icon"
                className="bg-white rounded-full shadow-sm p-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95 text-gray-500 hover:text-blue-600"
                compact={true}
                attachImage={false}
            />
        </div>

        {isReservable && (
            <div className="absolute top-2 left-2 max-w-[80%] z-[5]">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-sm text-[10px] font-bold px-2 py-0.5">
                    <CalendarClock className="mr-1 h-3 w-3 inline-block" />
                    {formatDate(product.available_from)}
                </Badge>
            </div>
        )}
        {(isReserved || effectiveStatus === 'sold') && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[5]">
                <Badge
                    className={`px-4 py-1.5 text-sm font-bold tracking-widest border-2 ${isReserved ? 'bg-blue-600/90 border-blue-400' : 'bg-rose-600/90 border-rose-400'} text-white rounded-full shadow-xl`}
                >
                    {isReserved ? 'RESERVED' : 'SOLD'}
                </Badge>
            </div>
        )}
      </div>
    </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="flex-grow truncate font-semibold text-gray-800" title={product.title}>
          {product.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold text-gray-900 leading-none">
            {typeof product.price === 'number' && product.price > 0 ? formattedPrice : 'Free'}
          </p>
          {typeof product.mrp === 'number' && typeof product.price === 'number' && product.mrp > product.price && (
            <p className="text-xs text-gray-400 line-through">
              {product.mrp.toLocaleString('en-IN')}
            </p>
          )}
          {discount && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Negotiable & Stats Row */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-wrap gap-1">
            {product.is_negotiable && typeof product.price === 'number' && product.price > 0 && effectiveStatus !== 'sold' && effectiveStatus !== 'reserved' && (
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Handshake className="w-3 h-3 mr-1" />
                Negotiable
              </span>
            )}
          </div>
          
          {typeof product.view_count === 'number' && product.view_count > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
              <Eye className="h-3 w-3" />
              {product.view_count >= 1000
                ? `${(product.view_count / 1000).toFixed(1)}k`
                : product.view_count
              }
            </div>
          )}
        </div>
        {showAdminActions && (
          <div className="flex w-full gap-2 mt-4 border-t pt-4">
            <form action={toggleProductStatus.bind(null, product.id, effectiveStatus ?? 'available')} className="flex-1">
              <SubmitButton variant="outline" size="sm" className="w-full">
                {effectiveStatus === 'available' ? <Tag className="mr-2 h-4 w-4"/> : <Undo2 className="mr-2 h-4 w-4"/>}
                {effectiveStatus === 'available' ? 'Mark Sold' : 'Relist'}
              </SubmitButton>
            </form>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/edit/${product.id}`}><Edit className="h-4 w-4"/></Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4"/></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your listing. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form action={() => deleteAction && deleteAction(product.id)}>
                    <SubmitButton variant="destructive">Delete</SubmitButton>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}

