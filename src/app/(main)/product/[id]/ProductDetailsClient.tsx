"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Handshake } from 'lucide-react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SimpleSpinner from "@/components/shared/SimpleSpinner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CalendarClock, MessageSquare, CheckCircle, Hourglass, Heart } from "lucide-react";
import { createConnectionAction } from "@/app/(main)/chat/actions";
import { toggleSaveAction } from "@/app/(main)/home/actions";
import NotificationPopup from "@/components/shared/NotificationPopup";
import ShareButton from "@/components/shared/ShareButton";

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number | null; // Allow null
  mrp: number | null;
  category: string | null; // Allow null
  image_urls: string[] | null; // Allow null
  seller_id: string;
  status: string | null; // Allow null
  available_from: string | null;
  is_negotiable: boolean;
  profiles: {
    id: string;
    name: string | null;
    university: string | null;
    profile_picture_url: string | null;
  } | null;
  whatsapp_number: string | null;
}

interface ProductDetailsClientProps {
  user: User;
  product: Product | null;
  existingConnection: { id: number; status: string } | null;
  initialIsSaved?: boolean;
}

// Helper functions (these can be moved to a utils file if you prefer)
const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

const calculateDiscount = (price: number, mrp: number | null) => {
  if (!mrp || mrp <= price) return null;
  const discount = ((mrp - price) / mrp) * 100;
  return Math.round(discount);
};

export default function ProductDetailsClient({
  user,
  product,
  existingConnection,
  initialIsSaved,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const [showReserveTip, setShowReserveTip] = useState(false);
  const [showBuyerTip, setShowBuyerTip] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(!!existingConnection /* override below */);
  // Correctly initialize
  useState(() => setIsSaved(!!initialIsSaved)); 
  const [isPending, startTransition] = useTransition();

  if (!product) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-gray-600">This listing may have been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/home">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const discount = calculateDiscount(product.price || 0, product.mrp);
  
  // Virtualization: Instantly treat expired reservations as 'available'
  const now = new Date();
  const availableFromDate = product.available_from ? new Date(product.available_from) : null;
  const hasReservationPassed = availableFromDate ? now >= availableFromDate : false;
  const effectiveStatus = (product.status === 'pending_reservation' && hasReservationPassed) 
    ? 'available' 
    : product.status;

  const isReservable = effectiveStatus === "pending_reservation";
  const isOwner = user.id === product.seller_id;
  const isNegotiable = product.is_negotiable && typeof product.price === 'number' && product.price > 0 && effectiveStatus !== 'sold' && effectiveStatus !== 'reserved';

  // Build WhatsApp deep-link with a pre-filled message if seller provided a number
  const whatsappUrl = product.whatsapp_number
    ? `https://wa.me/91${product.whatsapp_number}?text=${encodeURIComponent(
        `Hi! I'm interested in buying your "${product.title}" listed on CampusOlx. Is it still available?`
      )}`
    : null;
  const handleSendRequest = () => {
    startTransition(async () => {
      // Prepare form data for connectWithSeller
      const formData = new FormData();
      formData.append("productId", String(product.id));
      formData.append("sellerId", product.seller_id);

      // Call the correct server action
      try {
        // Import connectWithSeller dynamically to avoid circular imports
        const { connectWithSeller } = await import("../actions");
        const result = await connectWithSeller(formData);
        
        if (result?.success) {
          setNotification("✅ Request sent successfully! You can chat with the seller once they accept your request. Check your notifications for updates.");
        } else {
          setNotification("❌ Connection request failed. Please try again or contact support.");
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Connection request failed";
        setNotification(`❌ ${errorMessage}. Please try again or contact support.`);
        console.error("connectWithSeller error:", err);
      }
      router.refresh();
    });
  };

  const handleRequestReservation = () => {
    setShowReserveTip(true);
  };

  const handleToggleSave = async () => {
    if (!product) return;
    const currentlySaved = isSaved;
    // Optimistic toggle
    setIsSaved(!currentlySaved);
    try {
      await toggleSaveAction(product.id, currentlySaved);
    } catch (e) {
      // Revert on error
      setIsSaved(currentlySaved);
      setNotification("❌ Failed to update favourites.");
    }
  };

  return (
    <>
      {notification && (
        <NotificationPopup message={notification} onClose={() => setNotification(null)} />
      )}

      {/* --- The "Golden Rule" Popup for Buyers --- */}
      <AlertDialog open={showReserveTip} onOpenChange={setShowReserveTip}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              💡 Pro-Tip: How to Reserve Smart
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2 text-sm text-muted-foreground">
                <p>
                  You're about to request this item! To make sure your deal is secure, we{" "}
                  <strong>strongly recommend</strong> you follow these steps after the seller accepts:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Meet in Person:</strong> Arrange to see the item on campus before paying a
                    deposit. Check its condition to ensure it matches the description.
                  </li>
                  <li>
                    <strong>Agree on the Deposit:</strong> The seller will likely ask for a small
                    deposit (20-30%) to lock in the deal. This is normal.{" "}
                    <strong>Never pay the full amount upfront.</strong>
                  </li>
                  <li>
                    <strong>Confirm the Details:</strong> Use the chat to confirm the final price, the
                    deposit amount, and the pickup date.
                  </li>
                </ul>
                <p className="text-xs text-gray-500">
                  Remember: Trust your instincts. If something feels off, walk away. All deals are at
                  your own risk.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* The button in the popup now calls the function to send the request. */}
            <Button
              onClick={() => {
                handleSendRequest();
                setShowReserveTip(false);
              }}
              disabled={isPending}
              className="flex items-center justify-center"
            >
              {isPending ? (
                <SimpleSpinner size="sm" text="Sending Request..." />
              ) : (
                "Send Request"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Main Product Details UI --- */}
      <div className="container mx-auto max-w-4xl px-4 py-8 relative">
        {/* Page-level share (top-right) */}
        <div className="hidden md:block absolute top-4 right-4">
          <ShareButton 
            productId={product.id} 
            title={product.title} 
            imageUrl={product.image_urls?.[0] || null}
            message={`Check out "${product.title}" on CampusOlx – the marketplace for SASTRA students! {url}`}
            attachImage={false}
          />
        </div>
        <Link
          href="/home"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
            <Image
              src={product.image_urls?.[0] || 'https://placehold.co/600x600'}
              alt={product.title}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
            
            {/* Heart / Save Button */}
            {!isOwner && (
              <button
                onClick={handleToggleSave}
                className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm p-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                title={isSaved ? "Remove from Favourites" : "Save to Favourites"}
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </button>
            )}

            <div className="absolute top-3 right-3 md:hidden">
              <ShareButton 
                productId={product.id} 
                title={product.title} 
                imageUrl={product.image_urls?.[0] || null}
                message={`Check out "${product.title}" on CampusOlx – the marketplace for SASTRA students! {url}`}
                attachImage={false}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit">
              {product.category}
            </Badge>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {product.title}
            </h1>

            {/* Reservation Status Display */}
            {isReservable && product.available_from && (
              <div className="mt-4 flex items-center rounded-lg bg-blue-50 p-3 text-blue-800">
                <CalendarClock className="mr-3 h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">This item is for reservation.</p>
                  <p className="text-sm">
                    Available for pickup from:{" "}
                    <strong>{formatDate(product.available_from)}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Pricing Info */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
              <p className="text-4xl font-bold text-gray-900">
                ₹{(product.price || 0).toLocaleString("en-IN")}
              </p>
              {discount && (
                <>
                  <p className="text-xl text-gray-500 line-through">
                    MRP: {product.mrp?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xl font-semibold text-green-600">({discount}% off)</p>
                </>
              )}
            </div>

            {/* Negotiable Status */}
            {isNegotiable && (
              <div className="mt-4 flex items-center text-green-600">
                <Handshake className="mr-2 h-5 w-5" />
                <span className="font-semibold">Price is negotiable</span>
              </div>
            )}

            <p className="mt-4 text-gray-600">{product.description}</p>

            <div className="mt-auto pt-6">
              {isOwner ? (
                <div className="rounded-md border bg-gray-100 p-3 text-center text-sm text-gray-700">
                  This is your listing.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* --- UPGRADED: Conditional Button Logic --- */}
                  {existingConnection?.status === "accepted" ? (
                    <>
                      {/* WhatsApp button if available */}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-3 text-base font-semibold text-white shadow hover:bg-green-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Chat on WhatsApp
                        </a>
                      )}
                      <Button size="lg" className="w-full" asChild>
                        <Link href={`/chat/${existingConnection.id}`}>
                          <MessageSquare className="mr-2 h-5 w-5" />
                          Go to Chat
                        </Link>
                      </Button>
                    </>
                  ) : existingConnection ? (
                    <>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-3 text-base font-semibold text-white shadow hover:bg-green-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Chat on WhatsApp
                        </a>
                      )}
                      <Button
                        size="lg"
                        className="w-full bg-amber-500 hover:bg-amber-600"
                        disabled
                      >
                        <Hourglass className="mr-2 h-5 w-5" />
                        Request Sent (Pending Approval)
                      </Button>
                    </>
                  ) : isReservable ? (
                    <>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-3 text-base font-semibold text-white shadow hover:bg-green-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Chat on WhatsApp
                        </a>
                      )}
                      <Button size="lg" className={`w-full ${whatsappUrl ? 'variant-outline border' : ''}`} onClick={handleRequestReservation}>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Request to Reserve
                      </Button>
                    </>
                  ) : (
                    <>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-3 text-base font-semibold text-white shadow hover:bg-green-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Chat on WhatsApp
                        </a>
                      )}
                      <Button
                        size="lg"
                        className={`w-full flex items-center justify-center ${whatsappUrl ? 'variant-outline border' : ''}`}
                        onClick={() => setShowBuyerTip(true)}
                        disabled={isPending || effectiveStatus !== "available"}
                      >
                        {isPending ? (
                          <SimpleSpinner size="sm" text="Sending Request..." />
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-5 w-5" />Connect with Seller
                            {effectiveStatus && effectiveStatus !== "available" && ` (${effectiveStatus.toUpperCase()})`}
                          </>
                        )}
                      </Button>
                    </>
                  )}
      {/* Buyer Pro Tip Dialog for Connect with Seller */}
      <AlertDialog open={showBuyerTip} onOpenChange={setShowBuyerTip}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>💡 Pro Tip: Arrange a Safe Meetup</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 pt-2 text-sm text-muted-foreground">
                <div>Don’t feel pressured to share your phone number right away.</div>
                <div>Once you’re comfortable, you can exchange numbers to coordinate the meetup.</div>
                <div>Always meet in a public place on campus for safety.</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={() => {
                handleSendRequest();
                setShowBuyerTip(false);
              }}
              disabled={isPending}
            >
{isPending ? (
                <SimpleSpinner size="sm" text="Connecting..." />
              ) : (
                "Ready to connect?"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                </div>
              )}

              {/*
              Seller Information
              <div className="mt-6 flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.profiles?.profile_picture_url || ""} />
                  <AvatarFallback>
                    {product.profiles?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{product.profiles?.name}</p>
                  <p className="text-sm text-gray-500">{product.profiles?.university}</p>

                </div>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

