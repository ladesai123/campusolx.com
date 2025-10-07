"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useEffect, useMemo, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { acceptConnection, declineConnection } from '../profile/actions';
import { markAllNotificationsRead } from './notifications';
import { NotificationContext } from '../context/NotificationContext';
import type { User } from '@supabase/supabase-js';
import type { ConnectionWithPreview } from '../profile/page';


interface ChatClientProps {
  connections: ConnectionWithPreview[];
  user: User;
  unreadCounts: Record<number, number>;
}

export default function ChatClient({ connections, user, unreadCounts }: ChatClientProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState<number|null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState<number|null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loadingChatId, setLoadingChatId] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);


  const notificationCtx = useContext(NotificationContext);
  useEffect(() => {
    // Remove this useEffect that marks all notifications as read when visiting chat list
    // if (user?.id) {
    //   markAllNotificationsRead(user.id).then(() => {
    //     notificationCtx?.refetchUnreadCount();
    //   });
    // }
    const channel = supabase
      .channel('realtime chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, () => router.refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => router.refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, user?.id, notificationCtx]);

  // Show all connections, including pending
  const sellingConversations = connections.filter((c: ConnectionWithPreview) => c.seller?.id === user.id);
  const buyingConversations = connections.filter((c: ConnectionWithPreview) => c.requester?.id === user.id);
  const allConversations = [...sellingConversations, ...buyingConversations];

  // Skeleton loader for initial load
  if (!connections) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }


  // Responsive: card is clickable on mobile, button on desktop
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openChat = async (conv: ConnectionWithPreview) => {
    setLoadingChatId(conv.id);
    setLoading(true);
    try {
      // Mark notifications for this chat as read (server action)
      if (user?.id && conv.id) {
        try {
          const { markChatNotificationsRead } = await import('./notifications');
          await markChatNotificationsRead(user.id, conv.id);
        } catch (err) {
          console.error('Failed to mark notifications as read:', err);
        }
      }
      if (notificationCtx?.refetchUnreadCount) {
        await notificationCtx.refetchUnreadCount();
      }
      // Always refresh the chat list UI before navigating
      await router.refresh();
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      setLoading(false);
      alert('Failed to open chat.');
    } finally {
      setLoading(false);
      setLoadingChatId(null);
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 ml-2">
        <Link href="/home">← Back to Marketplace</Link>
      </Button>
      <Tabs defaultValue="all" className="w-full max-w-2xl mx-auto">
        <TabsList className="mb-6 flex justify-center bg-slate-50 rounded-lg shadow-sm p-1 gap-2 sticky top-0 z-10">
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow font-semibold">All</TabsTrigger>
          <TabsTrigger value="selling" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow font-semibold">Selling</TabsTrigger>
          <TabsTrigger value="buying" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow font-semibold">Buying</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {allConversations.length > 0 ? (
            <div className="space-y-3">
              {allConversations.map((conv: ConnectionWithPreview) => {
                const isSeller = conv.seller?.id === user.id;
                const isPending = conv.status === 'pending';
                const otherUser = isSeller ? conv.requester : conv.seller;
                return (
                  <div
                    key={conv.id}
                    className={`group bg-white border border-slate-200 rounded-xl flex items-center px-4 py-3 shadow-sm transition hover:bg-slate-50 cursor-pointer relative ${loadingChatId === conv.id ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={e => {
                      if (window.innerWidth >= 640) {
                        if (
                          e.target instanceof HTMLElement &&
                          e.currentTarget.contains(e.target) &&
                          !e.target.closest('button')
                        ) {
                          e.preventDefault();
                          return;
                        }
                      }
                      if (!isPending || !isSeller) openChat(conv);
                    }}
                    style={{ touchAction: 'manipulation' }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open chat with ${otherUser?.name}`}
                  >
                    <Image src={otherUser?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'U')}&background=be3a1e&color=fff`} alt={otherUser?.name ?? 'User'} width={48} height={48} className="rounded-full mr-3" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-0">
                      <p className="font-semibold text-slate-900 truncate">{otherUser?.name}</p>
                      <p className="text-sm text-slate-600 break-words whitespace-normal">Regarding: "{conv.product?.title}"</p>
                      <p className="text-xs text-slate-500 truncate">{conv.latestMessage?.content || (isPending ? (isSeller ? 'Request pending your action.' : 'Waiting for seller to accept.') : 'No messages yet.')}</p>
                      {isPending && isSeller && (
                        <>
                          <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full sm:w-auto"
                              disabled={loadingChatId === conv.id}
                              onClick={e => {
                                e.stopPropagation();
                                setAcceptDialogOpen(conv.id);
                              }}
                            >Accept</Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full sm:w-auto"
                              disabled={loadingChatId === conv.id}
                              onClick={e => {
                                e.stopPropagation();
                                setDeclineDialogOpen(conv.id);
                              }}
                            >Decline</Button>
                          </div>
                          {/* Accept/Decline Dialogs */}
                          <AlertDialog open={acceptDialogOpen === conv.id} onOpenChange={open => !open && setAcceptDialogOpen(null)}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Accept Request?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to accept this request?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogAction
                                  onClick={async () => {
                                    setLoading(true);
                                    await acceptConnection(conv.id);
                                    setLoading(false);
                                    setAcceptDialogOpen(null);
                                  }}
                                >Yes, Accept</AlertDialogAction>
                                <AlertDialogCancel>No, Go Back</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog open={declineDialogOpen === conv.id} onOpenChange={open => !open && setDeclineDialogOpen(null)}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Decline Request?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to decline this request?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogAction
                                  onClick={async () => {
                                    setLoading(true);
                                    await declineConnection(conv.id);
                                    setLoading(false);
                                    setDeclineDialogOpen(null);
                                  }}
                                >Yes, Decline</AlertDialogAction>
                                <AlertDialogCancel>No, Go Back</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                    {/* Unread badge */}
                    {unreadCounts[conv.id] > 0 && !isPending && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white z-20">
                        {unreadCounts[conv.id]}
                      </span>
                    )}
                    {!isPending || !isSeller ? (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openChat(conv);
                        }}
                        disabled={loadingChatId === conv.id || isPending}
                        className="ml-3 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 p-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Open chat"
                      >
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </button>
                    ) : null}
                    {/* Loading animation overlay */}
                    {loadingChatId === conv.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-10">
                        <span className="loader border-2 border-t-4 border-blue-500 rounded-full w-6 h-6 animate-spin"></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (<p className="text-slate-400 text-center py-10">No conversations yet.</p>)}
        </TabsContent>
        <TabsContent value="selling">
          {sellingConversations.length > 0 ? (
            <div className="space-y-3">
              {sellingConversations.map((conv: ConnectionWithPreview) => {
                const isPending = conv.status === 'pending';
                const otherUser = conv.requester;
                return (
                  <div
                    key={conv.id}
                    className={`group bg-white border border-slate-200 rounded-xl flex items-center px-4 py-3 shadow-sm transition hover:bg-slate-50 cursor-pointer ${loadingChatId === conv.id ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={() => openChat(conv)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open chat with ${otherUser?.name}`}
                  >
                    <Image src={otherUser?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'U')}&background=be3a1e&color=fff`} alt={otherUser?.name ?? 'User'} width={48} height={48} className="rounded-full mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{otherUser?.name}</p>
                      <p className="text-sm text-slate-600 truncate">Regarding: "{conv.product?.title}"</p>
                      <p className="text-xs text-slate-500 truncate">{conv.latestMessage?.content || (isPending ? 'Request pending your action.' : 'No messages yet.')}</p>
                    </div>
                    {/* Unread badge */}
                    {unreadCounts[conv.id] > 0 && !isPending && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white z-20">
                        {unreadCounts[conv.id]}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        openChat(conv);
                      }}
                      disabled={loadingChatId === conv.id}
                      className="ml-3 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 p-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label="Open chat"
                    >
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </button>
                    {loadingChatId === conv.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-10">
                        <span className="loader border-2 border-t-4 border-blue-500 rounded-full w-6 h-6 animate-spin"></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (<p className="text-slate-400 text-center py-10">No selling conversations yet.</p>)}
        </TabsContent>
        <TabsContent value="buying">
          {buyingConversations.length > 0 ? (
            <div className="space-y-3">
              {buyingConversations.map((conv: ConnectionWithPreview) => {
                const isPending = conv.status === 'pending';
                const otherUser = conv.seller;
                return (
                  <div
                    key={conv.id}
                    className={`group bg-white border border-slate-200 rounded-xl flex items-center px-4 py-3 shadow-sm transition hover:bg-slate-50 cursor-pointer ${loadingChatId === conv.id ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={() => openChat(conv)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open chat with ${otherUser?.name}`}
                  >
                    <Image src={otherUser?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'U')}&background=be3a1e&color=fff`} alt={otherUser?.name ?? 'User'} width={48} height={48} className="rounded-full mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{otherUser?.name}</p>
                      <p className="text-sm text-slate-600 truncate">Regarding: "{conv.product?.title}"</p>
                      <p className="text-xs text-slate-500 truncate">{conv.latestMessage?.content || (isPending ? 'Waiting for seller to accept.' : 'No messages yet.')}</p>
                    </div>
                    {/* Unread badge */}
                    {unreadCounts[conv.id] > 0 && !isPending && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white z-20">
                        {unreadCounts[conv.id]}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        openChat(conv);
                      }}
                      disabled={loadingChatId === conv.id}
                      className="ml-3 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 p-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label="Open chat"
                    >
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </button>
                    {loadingChatId === conv.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-10">
                        <span className="loader border-2 border-t-4 border-blue-500 rounded-full w-6 h-6 animate-spin"></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (<p className="text-slate-400 text-center py-10">No buying conversations yet.</p>)}
        </TabsContent>
      </Tabs>
    </>
  );
}
