"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { deleteProduct, toggleProductStatus, bumpProductAction, updateProfileAction } from "./actions";
import { deleteRequestAction, fulfillRequestAction, editRequestAction } from "@/app/(main)/requests/actions";
import { toggleSaveAction } from "@/app/(main)/home/actions";
import type { Database } from "@/lib/database.types";
import type { ProductWithProfile, RequestWithProfile } from "@/lib/types";
import type { ProductAnalytics } from "./page";
import { ProductCard } from "@/components/ProductCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Undo2, Tag, Trash2, User as UserIcon, ArrowUpCircle, BarChart2, TrendingUp, MessageSquare, Users, ChevronRight, Package, Heart, FileSearch, Eye, Info, ArrowLeft } from "lucide-react";
import SharePopup from "@/components/shared/SharePopup";
import { Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RequestCard } from "@/components/RequestCard";
import Toast from "@/components/shared/Toast";
import { getOptimizedCloudinaryUrl } from '@/lib/utils';

type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileClientProps {
    profile: Profile | null;
    userProducts: Product[];
    savedProducts: ProductWithProfile[];
    userRequests: RequestWithProfile[];
    productAnalytics?: ProductAnalytics[];
}

export default function ProfileClient({ profile, userProducts, savedProducts, userRequests, productAnalytics = [] }: ProfileClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'requests'>('listings');
    const [loggingOut, setLoggingOut] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
    const [bumpingId, setBumpingId] = useState<number | null>(null);
    const [requestActionId, setRequestActionId] = useState<number | null>(null);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shareProduct, setShareProduct] = useState<Product | null>(null);
    const [editingRequest, setEditingRequest] = useState<RequestWithProfile | null>(null);
    const [isEditingRequest, setIsEditingRequest] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [analyticsProduct, setAnalyticsProduct] = useState<Product | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const analyticsMap = new Map(productAnalytics.map(a => [a.product_id, a]));

    const truncateTitle = (title: string, maxWords: number = 5) => {
        if (!title) return "";
        const words = title.split(/\s+/);
        if (words.length <= maxWords) return title;
        return words.slice(0, maxWords).join(' ') + '...';
    };

    const googleName = profile?.name || "User";
    const googlePhoto = profile?.profile_picture_url || undefined;
    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Apr 2026';

    const activeCount = userProducts.filter(p => p.status === 'available' || p.status === 'pending_reservation' || p.status === 'reserved').length;
    const soldCount = userProducts.filter(p => p.status === 'sold').length;

    async function handleLogout() {
        setLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        setTimeout(() => { router.replace('/login'); }, 300);
    }

    async function handleDeleteProduct(productId: number) {
        setDeleting(true);
        await deleteProduct(productId);
        setDeleting(false);
        setDeleteId(null);
        setToastMessage("Listing deleted successfully");
        router.refresh();
    }

    async function handleStatusChange(productId: number, newStatus: string) {
        setStatusUpdatingId(productId);
        await toggleProductStatus(productId, newStatus);
        setStatusUpdatingId(null);
        setToastMessage(newStatus === 'sold' ? "Listing marked as sold" : "Listing relisted successfully");
        router.refresh();
    }

    async function handleBump(productId: number) {
        setBumpingId(productId);
        try {
            await bumpProductAction(productId);
            setToastMessage("Listing bumped to top! 🚀");
        } catch (e: any) { alert(e.message); }
        setBumpingId(null);
        router.refresh();
    }

    async function handleFulfillRequest(id: number) {
        setRequestActionId(id);
        await fulfillRequestAction(id);
        setRequestActionId(null);
        setToastMessage("Request marked as fulfilled");
        router.refresh();
    }

    async function handleDeleteRequest(id: number) {
        if (!confirm("Remove this request?")) return;
        setRequestActionId(id);
        await deleteRequestAction(id);
        setRequestActionId(null);
        setToastMessage("Request removed");
        router.refresh();
    }

    async function handleToggleSave(productId: number) {
        try {
            await toggleSaveAction(productId, true); // true because we're toggling from Saved tab (so it's currently saved)
            setToastMessage("Removed from watchlist");
            router.refresh();
        } catch (err: any) {
            alert("Failed to update watchlist");
        }
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
        } catch (err: any) { alert(err.message || "Failed to edit request"); }
        finally { setIsEditingRequest(false); }
    }

    async function onEditProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const formData = new FormData(e.currentTarget);
            const result = await updateProfileAction(formData);
            setIsSavingProfile(false);
            if (result.success) {
                setIsEditingProfile(false);
                setToastMessage("Your profile has been updated.");
                router.refresh();
            }
        } catch (err: any) { alert(err.message || "Failed to update profile"); }
        finally { setIsSavingProfile(false); }
    }

    const getStatusBadge = (status: string | null) => {
        const map: Record<string, { label: string; cls: string }> = {
            available: { label: 'Active', cls: 'bg-green-500' },
            pending_reservation: { label: 'Pending', cls: 'bg-blue-500' },
            reserved: { label: 'Reserved', cls: 'bg-yellow-500' },
            sold: { label: 'Sold', cls: 'bg-red-500' },
        };
        return map[status || ''] || { label: status || '', cls: 'bg-gray-400' };
    };

    const analyticsForProduct = analyticsProduct ? analyticsMap.get(analyticsProduct.id) : null;

    const tabs = [
        { key: 'listings' as const, label: 'My Listings', icon: Package, count: userProducts.length },
        { key: 'saved' as const, label: 'Watchlist', icon: Heart, count: savedProducts.length },
        { key: 'requests' as const, label: 'Requests', icon: FileSearch, count: userRequests.length },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 h-[52px] sticky top-0 z-40 flex items-center">
                <Link href="/home" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Marketplace
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-5 pb-28">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                            <AvatarImage src={googlePhoto} alt={googleName} />
                            <AvatarFallback className="bg-blue-50 text-blue-700 text-xl font-bold">
                                {googleName[0]?.toUpperCase() || <UserIcon className="h-8 w-8" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 truncate">{googleName}</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                                    Verified Student
                                </span>
                                <span className="text-xs text-gray-400">• Joined {memberSince}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 rounded-xl mb-4">
                        {[
                            { label: 'Active', value: activeCount },
                            { label: 'Sold', value: soldCount },
                            { label: 'Saved', value: savedProducts.length },
                        ].map(stat => (
                            <div key={stat.label} className="flex flex-col items-center py-3">
                                <span className={`text-lg font-bold ${stat.value === 0 ? 'text-gray-300' : 'text-gray-800'}`}>
                                    {stat.value}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>



                    <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-11"
                    >
                        <Edit className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 py-3 text-xs font-semibold transition-colors ${activeTab === tab.key
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Listings Tab */}
                    {activeTab === 'listings' && (
                        <div className="p-3">
                            {userProducts.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No listings yet.</p>
                                    <Button variant="outline" size="sm" asChild className="mt-3">
                                        <Link href="/sell">Post a Listing</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {userProducts.map(product => {
                                        const badge = getStatusBadge(product.status);
                                        const bumpedAtStr = (product as any).bumped_at;
                                        const bumpedDate = bumpedAtStr ? new Date(bumpedAtStr) : null;
                                        let canBump = true;
                                        let bumpTimeStr = "";
                                        if (bumpedDate) {
                                            const hrs = (Date.now() - bumpedDate.getTime()) / 3600000;
                                            if (hrs < 18) { canBump = false; bumpTimeStr = `${Math.ceil(18 - hrs)}h`; }
                                        }
                                        const isSold = product.status === 'sold';
                                        return (
                                            <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                                <div className="relative">
                                                    <Image
                                                        src={getOptimizedCloudinaryUrl(product.image_urls?.[0], 300)}
                                                        alt={product.title}
                                                        width={200} height={140}
                                                        className="w-full h-32 object-cover bg-gray-100"
                                                        unoptimized
                                                    />
                                                    <span className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="p-2.5">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{product.title}</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">₹{product.price?.toLocaleString()}</p>

                                                    {/* Action buttons */}
                                                    <div className="flex gap-1 mt-2">
                                                        <Link href={`/edit/${product.id}`} className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600">
                                                            <Edit className="h-3.5 w-3.5" />
                                                            <span className="text-[10px]">Edit</span>
                                                        </Link>
                                                        <button
                                                            disabled={!canBump || bumpingId === product.id || isSold}
                                                            onClick={() => handleBump(product.id)}
                                                            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-600 disabled:opacity-40"
                                                        >
                                                            {bumpingId === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpCircle className="h-3.5 w-3.5" />}
                                                            <span className="text-[10px]">{canBump ? 'Bump' : bumpTimeStr}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => { setAnalyticsProduct(product); }}
                                                            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-colors text-gray-600"
                                                        >
                                                            <BarChart2 className="h-3.5 w-3.5" />
                                                            <span className="text-[10px]">Analytics</span>
                                                        </button>
                                                    </div>
                                                    {/* Status action */}
                                                    <div className="flex gap-1 mt-1">
                                                        {isSold ? (
                                                            <button onClick={() => handleStatusChange(product.id, 'available')} disabled={statusUpdatingId === product.id} className="flex-1 text-[10px] py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium">
                                                                {statusUpdatingId === product.id ? '...' : 'Relist'}
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleStatusChange(product.id, 'sold')} disabled={statusUpdatingId === product.id} className="flex-1 text-[10px] py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium">
                                                                {statusUpdatingId === product.id ? '...' : 'Mark Sold'}
                                                            </button>
                                                        )}
                                                        <button onClick={() => setDeleteId(product.id)} className="flex-1 text-[10px] py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved Tab */}
                    {activeTab === 'saved' && (
                        <div className="p-3">
                            {savedProducts.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Heart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No saved items yet.</p>
                                    <Button variant="outline" size="sm" asChild className="mt-3">
                                        <Link href="/home">Browse Marketplace</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {savedProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            isSaved={true}
                                            onToggleSave={() => handleToggleSave(product.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="p-3">
                            {userRequests.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <FileSearch className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No requests posted yet.</p>
                                    <Button variant="outline" size="sm" asChild className="mt-3">
                                        <Link href="/requests">Post a Request</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {userRequests.map(request => (
                                        <div key={request.id} className="relative">
                                            <RequestCard request={request} currentUserId={profile?.id} />
                                            <div className="flex gap-2 mt-2">
                                                {request.status === 'active' ? (
                                                    <Button size="sm" variant="outline" className="flex-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                                        onClick={() => handleFulfillRequest(request.id)} disabled={requestActionId === request.id}>
                                                        Mark Fulfilled
                                                    </Button>
                                                ) : (
                                                    <span className="flex-1 text-center text-xs font-semibold text-green-600 bg-green-50 rounded-md border border-green-200 py-1.5 flex items-center justify-center">
                                                        Fulfilled ✅
                                                    </span>
                                                )}
                                                {request.status === 'active' && (
                                                    <Button size="sm" variant="outline" className="shrink-0"
                                                        onClick={() => setEditingRequest(request)} disabled={requestActionId === request.id}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="destructive" className="shrink-0"
                                                    onClick={() => handleDeleteRequest(request.id)} disabled={requestActionId === request.id}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Share Popup */}
            {showSharePopup && shareProduct && (
                <SharePopup product={{ id: shareProduct.id, title: shareProduct.title }} onClose={() => { setShowSharePopup(false); setShareProduct(null); }} />
            )}

            {/* Delete Product Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl w-[92vw] max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                        <AlertDialogDescription>This will also permanently delete all related chats. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDeleteProduct(deleteId)} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                            {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : <><Trash2 className="mr-2 h-4 w-4" />Delete</>}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Analytics Modal */}
            <AlertDialog open={!!analyticsProduct} onOpenChange={(o) => !o && setAnalyticsProduct(null)}>
                <AlertDialogContent className="rounded-2xl w-[92vw] max-w-sm p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            Analytics
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 text-xs">
                            {truncateTitle(analyticsProduct?.title || "")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-3 gap-2 py-2">
                        <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center">
                            <Users className="h-5 w-5 text-purple-500 mb-1" />
                            <span className="text-xl font-bold text-purple-700">{analyticsForProduct?.connections_count ?? 0}</span>
                            <span className="text-[10px] text-purple-500 mt-0.5">Interested</span>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center">
                            <MessageSquare className="h-5 w-5 text-blue-500 mb-1" />
                            <span className="text-xl font-bold text-blue-700">{analyticsForProduct?.messages_count ?? 0}</span>
                            <span className="text-[10px] text-blue-500 mt-0.5">Messages</span>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center">
                            <Eye className="h-5 w-5 text-orange-500 mb-1" />
                            <span className="text-xl font-bold text-orange-700">{analyticsProduct?.view_count ?? 0}</span>
                            <span className="text-[10px] text-orange-500 mt-0.5">Total Views</span>
                        </div>
                    </div>
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg flex items-start gap-2">
                        <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-slate-500 leading-tight">
                            Tip: To see specific connection requests and student messages, please check your Chat section.
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAnalyticsProduct(null)}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Request Modal */}
            <AlertDialog open={!!editingRequest} onOpenChange={(o) => !o && setEditingRequest(null)}>
                <AlertDialogContent className="w-[92vw] max-w-[425px] rounded-2xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Request</AlertDialogTitle>
                    </AlertDialogHeader>
                    {editingRequest && (
                        <form onSubmit={onEditRequestSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="req-title">Item Name</Label>
                                <Input id="req-title" name="title" defaultValue={editingRequest.title} required minLength={3} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="req-budget">Max Budget (₹) - Optional</Label>
                                <Input id="req-budget" name="max_budget" type="number" defaultValue={editingRequest.max_budget || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="req-whatsapp">WhatsApp Number</Label>
                                <Input id="req-whatsapp" name="whatsapp_number" type="tel" defaultValue={editingRequest.whatsapp_number || ''} required pattern="[0-9]{10}" />
                            </div>
                            <AlertDialogFooter className="mt-6">
                                <AlertDialogCancel type="button" onClick={() => setEditingRequest(null)}>Cancel</AlertDialogCancel>
                                <Button type="submit" className="bg-blue-600" disabled={isEditingRequest}>
                                    {isEditingRequest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Changes
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Profile Modal */}
            <AlertDialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <AlertDialogContent className="w-[92vw] max-w-[425px] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Profile</AlertDialogTitle>
                        <AlertDialogDescription>Keep your details updated to help students find you.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={onEditProfileSubmit} className="space-y-6 mt-4">
                        {/* Personal Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 border-b pb-1">Personal Info</h3>
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-xs text-gray-500">Full Name</Label>
                                <Input id="full_name" defaultValue={googleName} disabled className="bg-gray-50 border-gray-200 text-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone_number" className="text-xs text-gray-500">Phone Number</Label>
                                <Input id="phone_number" name="phone_number" type="tel" defaultValue={profile?.phone_number || ''} placeholder="e.g. 9876543210" pattern="[0-9]{10}" />
                            </div>
                        </div>

                        {/* Campus Details Section */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-gray-900 border-b pb-1">Campus Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="university" className="text-xs text-gray-500">University</Label>
                                <Input id="university" defaultValue={profile?.university || 'SASTRA University'} disabled className="bg-gray-50 border-gray-200 text-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year" className="text-xs text-gray-500">Year of Study</Label>
                                <Input id="year" name="year" defaultValue={profile?.year || ''} placeholder="e.g. 3rd Year" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hostel_block" className="text-xs text-gray-500">Hostel/Block Name</Label>
                                <Input id="hostel_block" name="hostel_block" defaultValue={profile?.hostel_block || ''} placeholder="e.g. Vinaya Block" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room_no" className="text-xs text-gray-500">Room Number</Label>
                                <p className="text-[10px] text-gray-400 -mt-1">For on-campus pickups for the room</p>
                                <Input id="room_no" name="room_no" defaultValue={profile?.room_no || ''} placeholder="e.g. S10" />
                            </div>
                        </div>

                        <AlertDialogFooter className="mt-8 flex-row gap-2">
                            <AlertDialogCancel type="button" className="flex-1 rounded-xl" onClick={() => setIsEditingProfile(false)}>Cancel</AlertDialogCancel>
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl" disabled={isSavingProfile}>
                                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}