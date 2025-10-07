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
import { Share2 } from "lucide-react";
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
        // Delay navigation slightly to show success message
        setTimeout(() => {
            setLoggingOut(false);
            setShowLogoutMsg(true);
            setTimeout(() => {
                setShowLogoutMsg(false);
                router.replace('/login');
            }, 1200);
        }, 100);
    }

    async function handleDeleteProduct(productId: number) {
        setDeleting(true);
        await deleteProduct(productId);
        setDeleting(false);
        setDeleteId(null); // Close the dialog
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
        <div className="w-full flex flex-col items-center px-2 py-8">
            {/* Top nav actions */}
            <div className="w-full max-w-2xl flex flex-row items-center justify-between mb-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/home">← Back to Marketplace</Link>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" disabled={loggingOut}>
                    {loggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Logout
                </Button>
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
            
            {/* Listings container */}
            <section className="w-full flex justify-center">
                <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold mb-4 text-center">My Listings</h2>
                    <div className="flex flex-col gap-6">
                        {userProducts.length > 0 ? (
                            userProducts.map(product => {
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
                                    <Card key={product.id} className="relative w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4 p-4 justify-center">
                                        {/* Promote button at top right */}
                                        <Button size="sm" variant="secondary" className="absolute top-2 right-2 flex items-center gap-2" onClick={() => { setShareProduct(product); setShowSharePopup(true); }}>
                                            <Share2 className="h-4 w-4" />
                                            Promote
                                        </Button>
                                        <div className="flex flex-col items-center">
                                            <Image 
                                                src={product.image_urls?.[0] || 'https://placehold.co/80x80'} 
                                                alt={product.title} 
                                                width={80} 
                                                height={80} 
                                                className="rounded-md object-contain bg-slate-100 p-1" 
                                                unoptimized 
                                            />
                                            <span className={`mt-2 px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                                                Status: {statusLabel}
                                            </span>
                                        </div>
                                        <div className="flex-grow w-full flex flex-col items-center">
                                            <h3 className="font-semibold text-lg text-center sm:text-left">{product.title}</h3>
                                        </div>
                                        {/* Actions row, always inside card and visually grouped */}
                                        <div className="flex flex-col sm:flex-row gap-2 items-center sm:items-center min-w-[140px] w-full sm:w-auto justify-center">
                                            
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
                                            {/* Edit/Delete Buttons */}
                                            <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                                                <Link href={`/edit/${product.id}`}>Edit</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => setDeleteId(product.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500">No listings found.</div>
                        )}
                        </div>
                    </div>
                </section>
                
                {/* SharePopup for promoting products */}
                {showSharePopup && shareProduct && (
                    <SharePopup 
                        product={{ id: shareProduct.id, title: shareProduct.title }} 
                        onClose={() => { setShowSharePopup(false); setShareProduct(null); }} 
                    />
                )}
                
                {/* Toast Messages */}
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