"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { deleteProduct, toggleProductStatus } from "./actions";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Undo2, Tag, Trash2, User as UserIcon } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import SharePopup from "@/components/shared/SharePopup";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
interface ProfileClientProps {
    profile: Profile | null;
    userProducts: Product[];
}

export default function ProfileClient({ profile, userProducts }: ProfileClientProps) {
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shareProduct, setShareProduct] = useState<Product | null>(null);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutMsg, setShowLogoutMsg] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);


    async function handleLogout() {
        setLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        setShowLogoutMsg(true);
        setTimeout(() => {
            setShowLogoutMsg(false);
            router.replace('/login');
        }, 1200);
    }

    async function handleDeleteProduct(productId: number) {
        setDeleting(true);
        await deleteProduct(productId);
        setDeleting(false);
        setShowDeleteMsg(true);
        setTimeout(() => setShowDeleteMsg(false), 1200);
        router.refresh();
    }

    async function handleStatusChange(productId: number, newStatus: string) {
        setStatusUpdatingId(productId);
        await toggleProductStatus(productId, newStatus);
        setStatusUpdatingId(null);
        router.refresh();
    }

    const googleName = profile?.name || "User";
    const googlePhoto = profile?.profile_picture_url || undefined;

    return (
        <div className="container mx-auto px-2 py-8 flex flex-col items-center">
            {/* Top nav actions */}
            <div className="w-full max-w-2xl flex flex-row items-center justify-between mb-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/home">← Back to Marketplace</Link>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
            {/* Profile card */}
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-row items-center gap-6 px-6 py-6 mb-10 border border-slate-100">
                <Avatar className="h-20 w-20 shadow border-2 border-slate-200">
                    <AvatarImage
                        src={googlePhoto}
                        alt={googleName}
                    />
                    <AvatarFallback>
                        {googleName[0]?.toUpperCase() || <UserIcon className="h-10 w-10 text-slate-400" />}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center">
                    <span className="text-2xl font-bold text-slate-900 leading-tight">{googleName}</span>
                    <span className="text-base text-slate-500 mt-1">SASTRA University, Thanjavur</span>
                </div>
            </div>
            <section className="w-full max-w-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-center">My Listings</h2>
                {userProducts.length > 0 ? (
                    <div className="space-y-6">
                        {userProducts.map(product => {
                            // Status label logic
                            let statusLabel = '';
                            let statusColor = '';
                            if (product.status === 'sold') {
                                statusLabel = 'Sold';
                                statusColor = 'bg-red-500 text-white';
                            } else if (product.status === 'available') {
                                statusLabel = 'Available';
                                statusColor = 'bg-green-500 text-white';
                            } else if (product.status === 'reserved') {
                                statusLabel = 'Reserved';
                                statusColor = 'bg-yellow-400 text-black';
                            } else if (product.status === 'pending_reservation') {
                                statusLabel = 'Pending Reservation';
                                statusColor = 'bg-blue-500 text-white';
                            }
                            const isReservation = product.status === 'reserved' || product.status === 'pending_reservation';
                            return (
                                <Card key={product.id} className="relative flex flex-col sm:flex-row items-center sm:items-center gap-4 p-4 max-w-2xl mx-auto w-full">
                                    {/* Share icon at top right */}
                                    <div className="absolute top-2 right-2">
                                        <ShareButton
                                            productId={product.id}
                                            title={product.title}
                                            imageUrl={product.image_urls?.[0] || null}
                                            message={`Hey! Check out this item I listed on CampusOlx, the marketplace for SASTRA University: "${product.title}". You can find it here: {url}`}
                                            attachImage={typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(window.navigator.userAgent)}
                                            size="icon"
                                            variant="ghost"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Image src={product.image_urls?.[0] || 'https://placehold.co/80x80'} alt={product.title} width={80} height={80} className="rounded-md object-contain bg-slate-100 p-1" unoptimized />
                                        <span className={`mt-2 px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>Status: {statusLabel}</span>
                                    </div>
                                    <div className="flex-grow w-full">
                                        <h3 className="font-semibold text-lg text-center sm:text-left">{product.title}</h3>
                                    </div>
                                    {/* All actions in a single column on mobile, row on desktop */}
                                    <div className="flex flex-col sm:flex-row gap-2 items-center sm:items-stretch min-w-[140px] w-full sm:w-auto">
                                        {/* Promote/Share with Friends Button */}
                                        <Button size="sm" variant="secondary" className="w-full sm:w-auto" onClick={() => { setShareProduct(product); setShowSharePopup(true); }}>
                                            Promote
                                        </Button>
                                        {/* Status/Action Button */}
                                        {product.status === 'sold' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                                disabled={statusUpdatingId === product.id}
                                                onClick={() => handleStatusChange(product.id, 'available')}
                                            >
                                                {statusUpdatingId === product.id ? (
                                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                ) : (
                                                    <Undo2 className="mr-2 h-4 w-4" />
                                                )}
                                                Relist
                                            </Button>
                                        ) : isReservation ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                                disabled={statusUpdatingId === product.id}
                                                onClick={() => handleStatusChange(product.id, product.status === 'reserved' ? 'pending_reservation' : 'reserved')}
                                            >
                                                {statusUpdatingId === product.id ? (
                                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                ) : null}
                                                {product.status === 'reserved' ? 'Mark as Pending Reservation' : 'Mark as Reserved'}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                                disabled={statusUpdatingId === product.id}
                                                onClick={() => handleStatusChange(product.id, 'sold')}
                                            >
                                                {statusUpdatingId === product.id ? (
                                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                ) : (
                                                    <Tag className="mr-2 h-4 w-4" />
                                                )}
                                                Mark as Sold
                                            </Button>
                                        )}
                                        {/* Edit Button */}
                                        <Button asChild size="sm" variant="ghost" className="w-full sm:w-auto"><Link href={`/edit/${product.id}`}><Edit className="mr-2 h-4 w-4"/> Edit</Link></Button>
                                        {/* Delete Button */}
                                        <AlertDialog open={deleteId === product.id} onOpenChange={open => setDeleteId(open ? product.id : null)}>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive" aria-label="Delete" className="w-full sm:w-auto"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete <span className="font-semibold">{product.title}</span>? This action cannot be undone and will remove all images from storage.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction disabled={deleting} onClick={() => handleDeleteProduct(product.id)}>
                                                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (<p className="text-slate-500 text-center">You haven't listed any products yet.</p>)}
            </section>
            {/* SharePopup for promoting products */}
            {showSharePopup && shareProduct && (
                <SharePopup product={{ id: shareProduct.id, title: shareProduct.title }} onClose={() => { setShowSharePopup(false); setShareProduct(null); }} />
            )}
            {showLogoutMsg && (
                <div className="fixed left-1/2 bottom-8 z-50 -translate-x-1/2 rounded-lg bg-slate-900 text-white px-6 py-3 shadow-lg animate-fade-in">
                    Logged out successfully
                </div>
            )}
            {showDeleteMsg && (
                <div className="fixed left-1/2 bottom-8 z-50 -translate-x-1/2 rounded-lg bg-green-600 text-white px-6 py-3 shadow-lg animate-fade-in">
                    Product deleted successfully
                </div>
            )}
        </div>
    );
}
