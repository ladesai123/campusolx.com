'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Tag, Undo2, CalendarClock, Share2 } from 'lucide-react';
import { toggleProductStatus } from '@/app/(main)/profile/actions'; 
import { SubmitButton } from '@/components/shared/SubmitButton'; 
import { Product } from '@/lib/types'; 
import ShareButton from '@/components/shared/ShareButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLoader from '@/components/shared/AppLoader';

interface ProductCardProps {
  product: Product;
  showAdminActions?: boolean;
  deleteAction?: (id: number) => Promise<void>;
}

// Helper function to format the future availability date nicely (e.g., "Dec 20")
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // timeZone: 'UTC' is added to prevent the date from shifting due to the user's local timezone.
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

// Helper function to calculate the discount percentage.
const calculateDiscount = (price: number, mrp: number | null) => {
  if (!mrp || mrp <= price) return null;
  const discount = ((mrp - price) / mrp) * 100;
  return Math.round(discount);
};

export function ProductCard({ product, showAdminActions = false, deleteAction }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.mrp);
  const isReservable = product.status === 'pending_reservation' && product.available_from;
  const isReserved = product.status === 'reserved';
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(product.price);

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
          <div className="aspect-square w-full overflow-hidden">
            <Image
              src={product.image_urls?.[0] || 'https://placehold.co/400x400'}
              alt={product.title}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </a>
        {/* Share button: always visible for mobile users */}
        <div className="absolute top-2 right-2 z-10">
          <ShareButton 
            productId={product.id} 
            title={product.title} 
            imageUrl={product.image_urls?.[0]} 
            variant="outline" 
            size="icon"
            attachImage={false}
            message={`Check out "${product.title}" on CampusOlx – the marketplace for SASTRA students! {url}`}
          />
        </div>
        {isReservable && (
          <div className="absolute top-2 left-2 max-w-[90vw] sm:max-w-xs">
            <Badge className="bg-yellow-400 text-black shadow text-xs font-semibold px-2 py-1 whitespace-normal break-words">
              <CalendarClock className="mr-1 h-3.5 w-3.5 inline-block align-text-bottom" />
              Reserve: Available {formatDate(product.available_from)}
            </Badge>
          </div>
        )}
        {(isReserved || product.status === 'sold') && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge
              className={`px-4 py-1 text-base font-bold tracking-wider ${isReserved ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}
            >
              {isReserved ? 'RESERVED' : 'SOLD'}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="flex-grow truncate font-semibold text-gray-800" title={product.title}>
          {product.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <p className="text-lg font-bold text-gray-900">
             {product.price > 0 ? formattedPrice : 'Free'}
          </p>
          {product.mrp && product.mrp > product.price && (
            <p className="text-sm text-gray-500 line-through">
              MRP: {product.mrp.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        {discount && (
          <p className="text-sm font-semibold text-green-600">
            ({discount}% off)
          </p>
        )}
        {showAdminActions && (
          <div className="flex w-full gap-2 mt-4 border-t pt-4">
            <form action={toggleProductStatus.bind(null, product.id, product.status)} className="flex-1">
              <SubmitButton variant="outline" size="sm" className="w-full">
                {product.status === 'available' ? <Tag className="mr-2 h-4 w-4"/> : <Undo2 className="mr-2 h-4 w-4"/>}
                {product.status === 'available' ? 'Mark Sold' : 'Relist'}
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

