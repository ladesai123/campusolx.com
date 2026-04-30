"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { deleteProduct, toggleProductStatus, bumpProductAction } from "./actions";
import { deleteRequestAction, fulfillRequestAction } from "@/app/(main)/requests/actions";
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
import { Loader2, Edit, Undo2, Tag, Trash2, User as UserIcon, ArrowUpCircle } from "lucide-react";
import { Share2 } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import SharePopup from "@/components/shared/SharePopup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editRequestAction } from "@/app/(main)/requests/actions";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { RequestCard } from "@/components/RequestCard";
import type { ProductWithProfile, RequestWithProfile } from "@/lib/types";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
interface ProfileClientProps {
    profile: Profile | null;
    userProducts: Product[];
    savedProducts: ProductWithProfile[];
    userRequests: RequestWithProfile[];
}

export default function ProfileClient({ profile, userProducts, savedProducts, userRequests }: ProfileClientProps) {
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shareProduct, setShareProduct] = useState<Product | null>(null);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutMsg, setShowLogoutMsg] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
    const [bumpingId, setBumpingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'requests'>('listings');
    const [requestActionId, setRequestActionId] = useState<number | null>(null);
    
    // Request Edit State
    const [editingRequest, setEditingRequest] = useState<RequestWithProfile | null>(null);
    const [isEditingRequest, setIsEditingRequest] = useState(false);


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

    async function handleBump(productId: number) {
        setBumpingId(productId);
        try {
            await bumpProductAction(productId);
        } catch (e: any) {
            alert(e.message);
        }
        setBumpingId(null);
        router.refresh();
    }

    async function handleFulfillRequest(id: number) {
        setRequestActionId(id);
        await fulfillRequestAction(id);
        setRequestActionId(null);
        router.refresh();
    }

    async function handleDeleteRequest(id: number) {
        if (!confirm("Are you sure you want to delete this request?")) return;
        setRequestActionId(id);
        await deleteRequestAction(id);
        setRequestActionId(null);
        router.refresh();
    }

    async function onEditRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingRequest) return;
        setIsEditingRequest(true);
        try {
            const formData = new FormData(e.currentTarget);
            await editRequestAction(editingRequest.id, formData);
            setEditingRequest(null);
            router.refresh();
        } catch (err: any) {
            alert(err.message || "Failed to edit request");
        } finally {
            setIsEditingRequest(false);
        }
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
                    <span className="text-base text-slate-500 mt-1">{profile?.university || "SASTRA University, Thanjavur"}</span>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="w-full max-w-2xl flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'listings' 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    My Listings ({userProducts.length})
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'saved' 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Favourites ({savedProducts.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'requests' 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    My Requests ({userRequests.length})
                </button>
            </div>

            {/* Content container */}
            <section className="w-full flex justify-center">
                <div className="w-full max-w-2xl">
                    {activeTab === 'listings' ? (
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
                                
                                // Bump logic
                                const bumpedAtStr = (product as any).bumped_at;
                                const bumpedDate = bumpedAtStr ? new Date(bumpedAtStr) : null;
                                let canBump = true;
                                let bumpTimeStr = "";
                                if (bumpedDate) {
                                    const now = new Date();
                                    const hoursSinceBump = (now.getTime() - bumpedDate.getTime()) / (1000 * 60 * 60);
                                    if (hoursSinceBump < 18) {
                                        canBump = false;
                                        const hoursLeft = Math.ceil(18 - hoursSinceBump);
                                        bumpTimeStr = `in ${hoursLeft}h`;
                                    }
                                }
                                
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
                                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-center sm:items-center min-w-[140px] w-full sm:w-auto justify-center mt-2 sm:mt-0">
                                            
                                            {/* Bump Button (only for available/reserved) */}
                                            {product.status !== 'sold' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                                                    disabled={!canBump || bumpingId === product.id}
                                                    onClick={() => handleBump(product.id)}
                                                    title={canBump ? "Bump to top of feed" : `Wait ${bumpTimeStr} to bump again`}
                                                >
                                                    {bumpingId === product.id ? (
                                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                                                    )}
                                                    {canBump ? 'Bump' : bumpTimeStr}
                                                </Button>
                                            )}

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
                    ) : activeTab === 'saved' ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {savedProducts.length > 0 ? (
                                savedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <p className="text-4xl mb-3">💔</p>
                                    <p>No saved items yet.</p>
                                    <Button variant="outline" size="sm" asChild className="mt-4">
                                        <Link href="/home">Browse marketplace</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {userRequests.length > 0 ? (
                                userRequests.map(request => (
                                    <div key={request.id} className="relative group flex flex-col h-full">
                                        <RequestCard request={request} currentUserId={profile?.id} />
                                        <div className="mt-2 flex gap-2 w-full">
                                            {request.status === 'active' ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                                    onClick={() => handleFulfillRequest(request.id)}
                                                    disabled={requestActionId === request.id}
                                                >
                                                    Mark Fulfilled
                                                </Button>
                                            ) : (
                                                <span className="flex-1 text-center py-1 text-xs font-semibold text-green-600 bg-green-50 rounded-md border border-green-200 flex items-center justify-center">
                                                    Fulfilled ✅
                                                </span>
                                            )}
                                            {request.status === 'active' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="shrink-0"
                                                    onClick={() => setEditingRequest(request)}
                                                    disabled={requestActionId === request.id}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                className="shrink-0"
                                                onClick={() => handleDeleteRequest(request.id)}
                                                disabled={requestActionId === request.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <p className="text-4xl mb-3">🔍</p>
                                    <p>You haven't posted any requests.</p>
                                    <Button variant="outline" size="sm" asChild className="mt-4">
                                        <Link href="/requests">Post a Request</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </section>
                
                {/* SharePopup for promoting products */}
                {showSharePopup && shareProduct && (
                    <SharePopup 
                        product={{ id: shareProduct.id, title: shareProduct.title }} 
                        onClose={() => { setShowSharePopup(false); setShareProduct(null); }} 
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this product? This will also permanently delete all related chat conversations and connection requests. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteId && handleDeleteProduct(deleteId)}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Request Edit Modal */}
                <AlertDialog open={!!editingRequest} onOpenChange={(o) => !o && setEditingRequest(null)}>
                    <AlertDialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl p-6">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit Request</AlertDialogTitle>
                        </AlertDialogHeader>
                        {editingRequest && (
                            <form onSubmit={onEditRequestSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Item Name</Label>
                                    <Input id="title" name="title" defaultValue={editingRequest.title} required minLength={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_budget">Max Budget (₹) - Optional</Label>
                                    <Input id="max_budget" name="max_budget" type="number" defaultValue={editingRequest.max_budget || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                                    <Input id="whatsapp_number" name="whatsapp_number" type="tel" defaultValue={editingRequest.whatsapp_number || ''} required pattern="[0-9]{10}" />
                                </div>
                                <AlertDialogFooter className="mt-6 flex-row justify-end gap-2 sm:gap-2">
                                    <AlertDialogCancel type="button" onClick={() => setEditingRequest(null)}>Cancel</AlertDialogCancel>
                                    <Button type="submit" className="bg-blue-600 w-full sm:w-auto" disabled={isEditingRequest}>
                                        {isEditingRequest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Save Changes
                                    </Button>
                                </AlertDialogFooter>
                            </form>
                        )}
                    </AlertDialogContent>
                </AlertDialog>
                
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