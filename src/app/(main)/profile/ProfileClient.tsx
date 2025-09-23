'use client';



import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Tag, Undo2, LogOut } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { toggleProductStatus, deleteProduct } from './actions';
import { createClient } from '@/lib/client';
import type { Profile, Product } from './page';

interface ProfileClientProps {
    profile: Profile | null;
    userProducts: Product[];
}

export default function ProfileClient({ profile, userProducts }: ProfileClientProps) {
    // Helper to share a product
    function handleShareProduct(product: any) {
        const url = `https://campusolx.com/product/${product.id}`;
        const message = `Hey! Check out this item: "${product.title}" on CampusOlx, a marketplace for SASTRA students to buy and sell second-hand things. ${url} 🚀`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        if (navigator.userAgent.toLowerCase().includes('whatsapp')) {
            window.open(whatsappUrl, '_blank');
        } else if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
            window.open(whatsappUrl, '_blank');
        } else if (navigator.share) {
            navigator.share({ text: message, title: 'CampusOlx', url });
        } else {
            navigator.clipboard.writeText(message);
            alert('Share message copied! You can now paste it in WhatsApp or anywhere.');
        }
    }
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutMsg, setShowLogoutMsg] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    const [deleting, setDeleting] = useState(false);

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
        setDeleteId(null);
        setShowDeleteMsg(true);
        setTimeout(() => setShowDeleteMsg(false), 1200);
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <Button asChild variant="ghost" className="pl-0 text-slate-600">
                    <Link href="/home"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace</Link>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="gap-1.5" disabled={loggingOut} aria-label="Logout">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
            <div className="flex items-center gap-4 mb-10">
                <Image src={profile?.profile_picture_url || 'https://placehold.co/80x80'} alt={profile?.name || ''} width={80} height={80} className="rounded-full" priority unoptimized/>
                <div>
                    <h1 className="text-3xl font-bold">{profile?.name}</h1>
                    <p className="text-slate-500">{profile?.university}</p>
                </div>
            </div>
            <section>
                <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
                {userProducts.length > 0 ? (
                    <div className="space-y-4">
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
                                                    // Reservation logic
                                                    const isReservation = product.status === 'reserved' || product.status === 'pending_reservation';
                                                                                return (
                                                                                    <Card key={product.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                                                                                        {/* Share icon at top right */}
                                                                                        <button
                                                                                            type="button"
                                                                                            className="absolute top-2 right-2 p-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                                                                                            title="Share this product"
                                                                                            onClick={() => handleShareProduct(product)}
                                                                                        >
                                                                                            <Share2 className="h-5 w-5" />
                                                                                        </button>
                                                                                        <div className="flex flex-col items-center">
                                                                                            <Image src={product.image_urls?.[0] || 'https://placehold.co/80x80'} alt={product.title} width={80} height={80} className="rounded-md object-contain bg-slate-100 p-1" unoptimized />
                                                                                            <span className={`mt-2 px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>Status: {statusLabel}</span>
                                                                                        </div>
                                                                                        <div className="flex-grow">
                                                                                            <h3 className="font-semibold text-lg">{product.title}</h3>
                                                                                        </div>
                                                                                        <div className={`flex ${isReservation ? 'flex-col sm:flex-row' : 'flex-row'} w-full sm:w-auto gap-2`}>
                                                                {product.status === 'sold' ? (
                                                                    <form action={toggleProductStatus.bind(null, product.id, 'available')} className="flex-1 sm:flex-none">
                                                                        <Button size="sm" variant="outline" className="w-full"><Undo2 className="mr-2 h-4 w-4"/>Relist</Button>
                                                                    </form>
                                                                ) : isReservation ? (
                                                                    <form action={toggleProductStatus.bind(null, product.id, product.status === 'reserved' ? 'pending_reservation' : 'reserved')} className="flex-1 sm:flex-none">
                                                                        <Button size="sm" variant="outline" className="w-full">
                                                                            {product.status === 'reserved' ? 'Mark as Pending Reservation' : 'Mark as Reserved'}
                                                                        </Button>
                                                                    </form>
                                                                ) : (
                                                                    <form action={toggleProductStatus.bind(null, product.id, 'sold')} className="flex-1 sm:flex-none">
                                                                        <Button size="sm" variant="outline" className="w-full"><Tag className="mr-2 h-4 w-4"/>Mark as Sold</Button>
                                                                    </form>
                                                                )}
                                                                <Button asChild size="sm" variant="ghost"><Link href={`/edit/${product.id}`}><Edit className="mr-2 h-4 w-4"/> Edit</Link></Button>
                                                                <AlertDialog open={deleteId === product.id} onOpenChange={open => setDeleteId(open ? product.id : null)}>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button size="sm" variant="destructive" aria-label="Delete"><Trash2 className="h-4 w-4"/></Button>
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
                ) : (<p className="text-slate-500">You haven't listed any products yet.</p>)}
            </section>
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
// End of component