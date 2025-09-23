"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CalendarClock, MessageSquare, CheckCircle, Hourglass } from "lucide-react";
import { createConnectionAction } from "@/app/(main)/chat/actions";
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
  profiles: {
    id: string;
    name: string | null;
    university: string | null;
    profile_picture_url: string | null;
  } | null;
}

interface ProductDetailsClientProps {
  user: User;
  product: Product | null;
  existingConnection: { id: number; status: string } | null;
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
}: ProductDetailsClientProps) {
  const router = useRouter();
  const [showReserveTip, setShowReserveTip] = useState(false);
  const [showBuyerTip, setShowBuyerTip] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
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
  const isReservable = product.status === "pending_reservation";
  const isOwner = user.id === product.seller_id;


  // --- UPGRADED LOGIC: This now sends a REQUEST, it doesn't instantly connect ---
  const handleSendRequest = () => {
    startTransition(async () => {
      const result = await createConnectionAction(product.id, product.seller_id);
      if (result.success) {
        setNotification("Request sent! You can chat with the seller once they accept.");
      } else {
        setNotification(result.message || "An error occurred.");
      }
      router.refresh();
    });
  };

  // This function is triggered when the "Request to Reserve" button is clicked.
  // Its only job is to show the educational popup.
  const handleRequestReservation = () => {
    setShowReserveTip(true);
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
            >
              {isPending ? "Sending Request..." : "Send Request"}
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

            <p className="mt-4 text-gray-600">{product.description}</p>

            <div className="mt-auto pt-6">
              {isOwner ? (
                <div className="rounded-md border bg-gray-100 p-3 text-center text-sm text-gray-700">
                  This is your listing.
                </div>
              ) : (
                <>
                  {/* --- UPGRADED: Conditional Button Logic --- */}
                  {existingConnection?.status === "accepted" ? (
                    <Button size="lg" className="w-full" asChild>
                      <Link href={`/chat/${existingConnection.id}`}>
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Go to Chat
                      </Link>
                    </Button>
                  ) : existingConnection ? (
                    <Button
                      size="lg"
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      disabled
                    >
                      <Hourglass className="mr-2 h-5 w-5" />
                      Request Sent (Pending Approval)
                    </Button>
                  ) : isReservable ? (
                    <Button size="lg" className="w-full" onClick={handleRequestReservation}>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Request to Reserve
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => setShowBuyerTip(true)}
                      disabled={isPending || product.status !== "available"}
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {isPending ? "Sending Request..." : "Connect with Seller"}
                      {product.status && product.status !== "available" && ` (${product.status.toUpperCase()})`}
                    </Button>
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
              {isPending ? "Connecting..." : "Ready to connect?"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                </>
              )}

              {/* Seller Information */}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

