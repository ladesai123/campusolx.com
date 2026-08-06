"use client";
import { Hourglass } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { useState, useEffect, useMemo, useRef, useCallback, useContext } from "react";
import { markChatNotificationsRead } from '../notifications';
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "../actions";
import { acceptConnection, declineConnection } from "../../profile/actions";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/client";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { NotificationContext } from '../../context/NotificationContext';
import type { Profile, MessageWithSender } from "./page";
import SimpleSpinner from "@/components/shared/SimpleSpinner"; 
// ------------------------

// --- Types ---
type ProductInfo = {
  id: number;
  title: string | null;
  price: number | null;
  image_urls: string[] | null;
  whatsapp_number: string | null;
  is_negotiable?: boolean | null;
  status?: string | null;
};

type ConnectionWithProfiles = {
  id: number;
  seller: Profile | null;
  requester: Profile | null;
  status?: string;
  product?: ProductInfo | null;
};

// --- Client-side Time Component ---
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
};

const ClientTime = ({ timestamp }: { timestamp: string | null }) => {
  const hasMounted = useHasMounted();
  if (!hasMounted) return null;
  if (!timestamp) return <>some time ago</>;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return <>some time ago</>;
  return <>{formatDistanceToNow(date)} ago</>;
};

// --- Main Component ---
interface ChatClientProps {
  initialMessages: MessageWithSender[];
  user: Profile | null; // Use our defined Profile type
  connection: ConnectionWithProfiles;
}

export default function ChatClient({
  initialMessages,
  user,
  connection,
}: ChatClientProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'accept'|'decline'|null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages);
  const [otherUserStatus, setOtherUserStatus] = useState<'online' | 'offline'>('offline');
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const notificationCtx = useContext(NotificationContext);
  const [chatError, setChatError] = useState<string | null>(null);
  const { containerRef, scrollToBottom } = useChatScroll();
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const otherUser = user?.id === connection.seller?.id ? connection.requester : connection.seller;

  // Helper: Is buyer and chat not accepted?
  const isBuyer = user?.id === connection.requester?.id;
  const isSeller = user?.id === connection.seller?.id;
  const isPending = connection.status !== 'accepted';

  // --- Real-time Logic ---
  useEffect(() => {
    if (!user) return;
    console.log('Marking notifications as read for user:', user.id, 'connection:', connection.id);
    markChatNotificationsRead(user.id, connection.id)
      .then(() => {
        notificationCtx?.refetchUnreadCount && notificationCtx.refetchUnreadCount();
        console.log('Notifications marked as read in DB');
      })
      .catch((err: any) => {
        console.error('Error marking notifications as read:', err);
      });

    const channel = supabase.channel(`chat-${connection.id}`, {
      config: { presence: { key: user.id }, broadcast: { self: true } },
    });

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `connection_id=eq.${connection.id}`,
      },
      async (payload) => {
        const { data: newMessage } = await supabase
          .from("messages")
          .select("*, sender:profiles(*)")
          .eq("id", payload.new.id)
          .single();
        if (newMessage) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage as MessageWithSender];
          });
        }
      },
    );


    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState();
      const otherUserIds = Object.keys(presenceState).filter(
        (id) => id !== user.id,
      );
      if (otherUserIds.length > 0) {
        setOtherUserStatus('online');
        const lastActiveVal = (presenceState[otherUserIds[0]] as any)?.[0]?.last_active_at;
        if (lastActiveVal) setLastActive(lastActiveVal);
      } else {
        setOtherUserStatus('offline');
      }
    });

    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      if (key !== user.id) {
        setOtherUserStatus('online');
        const lastActiveVal = (newPresences[0] as any)?.last_active_at;
        if (lastActiveVal) setLastActive(lastActiveVal);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      if (key !== user.id) {
        setOtherUserStatus('offline');
        // Try to get last_active_at from leftPresences if available
        const lastActiveVal = (leftPresences && leftPresences[0]?.last_active_at) || lastActive;
        if (lastActiveVal) setLastActive(lastActiveVal);
      }
    });

    channel.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload.userId !== user.id) {
        setIsOtherTyping(true);
        setTimeout(() => setIsOtherTyping(false), 2500);
      }
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          last_active_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, connection.id, user, notificationCtx]);

  const handleInputChange = useCallback(() => {
    supabase.channel(`chat-${connection.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user?.id },
    });
  }, [supabase, connection.id, user]);

  if (!user || !otherUser) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading chat...
      </div>
    );
  }

  // Layout wrapper for chat page
  // If buyer and connection is not accepted, show info and hide chat UI
  if (isBuyer && isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Your request has been sent!</h2>
        <p className="text-base text-red-500 mb-6 font-semibold">Waiting for seller to accept.</p>
        <Hourglass className="h-10 w-10 text-amber-500 animate-pulse mb-4" />
        <Button asChild variant="outline">
          <Link href="/home">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  // If seller and connection is pending, show accept/decline options
  if (isSeller && isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">New Request!</h2>
        <p className="text-base text-slate-600 mb-6">
          <span className="font-medium">{otherUser?.name}</span> wants to buy your item.
        </p>
        <div className="flex gap-4 mb-6">
          <Button
            onClick={async () => {
              setIsAccepting(true);
              try {
                await acceptConnection(connection.id);
                window.location.reload(); // Refresh to show accepted chat
              } catch (error) {
                console.error('Failed to accept connection:', error);
                alert('Failed to accept request. Please try again.');
              } finally {
                setIsAccepting(false);
              }
            }}
            disabled={isAccepting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? "Accepting..." : "Accept Request"}
          </Button>
          <Button
            onClick={async () => {
              if (confirm('Are you sure you want to decline this request?')) {
                try {
                  await declineConnection(connection.id);
                  window.location.href = '/chat'; // Redirect to chat list
                } catch (error) {
                  console.error('Failed to decline connection:', error);
                  alert('Failed to decline request. Please try again.');
                }
              }
            }}
            variant="destructive"
          >
            Decline Request
          </Button>
        </div>
        <Button asChild variant="outline">
          <Link href="/chat">Back to Requests</Link>
        </Button>
      </div>
    );
  }

  // Otherwise, show normal chat UI
  return (
    <div className="chat-page-container">
      {/* --- Simple Spinner for loading state --- */}
      {isAccepting && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
          <SimpleSpinner size="lg" text="Processing request..." />
        </div>
      )}
      {/* --------------------------------------------- */}
      <div className="w-full max-w-md mx-auto bg-white shadow md:rounded-xl md:my-6 md:max-w-lg">
        {/* Header (not fixed) */}
        <header className="flex items-center gap-3 border-b bg-white p-3 shadow-sm">
          <Button asChild variant="ghost" size="icon">
            <Link href="/chat">
              <ArrowLeft />
            </Link>
          </Button>
          <Image
            src={otherUser.profile_picture_url || "https://placehold.co/40x40"}
            alt={otherUser.name || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <h2 className="font-semibold leading-tight">{otherUser.name}</h2>
            <div className="text-xs text-slate-500 min-h-[1.25em] flex flex-col">
              {otherUserStatus === "online" ? (
                <span className="text-green-500 font-medium">Online</span>
              ) : lastActive ? (
                <span>Last active <ClientTime timestamp={lastActive} /></span>
              ) : (
                <span>Offline</span>
              )}
              {isOtherTyping && (
                <span className="text-blue-500 animate-pulse mt-0.5">typing<span className="inline-block w-2">.</span><span className="inline-block w-2">.</span><span className="inline-block w-2">.</span></span>
              )}
            </div>
          </div>
        </header>

        {/* Product & WhatsApp Context Bar */}
        {connection.product && (
          <div className="bg-slate-50/90 border-b border-slate-200/80 px-3 py-2 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image
                  src={connection.product.image_urls?.[0] || "https://placehold.co/36x36"}
                  alt={connection.product.title || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {connection.product.title}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-medium text-blue-600">
                    {connection.product.price ? `₹${connection.product.price.toLocaleString('en-IN')}` : 'Free'}
                  </span>
                  {connection.product.is_negotiable && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1 rounded border border-blue-100 font-medium">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            {connection.product.whatsapp_number && (() => {
              const phone = connection.product.whatsapp_number.replace(/\D/g, '');
              if (!phone) return null;
              const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
              const msg = `Hi! I'm interested in your listing for "${connection.product.title}" on CampusOLX. Is it still available? Here is our chat link: https://www.campusolx.com/product/${connection.product.id}`;
              const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;

              return (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm transition-all hover:shadow shrink-0"
                  title="Chat directly on WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              );
            })()}
          </div>
        )}

        {/* Scrollable Messages */}
        <div ref={containerRef} className="space-y-4 overflow-y-auto p-4 pb-28 md:pb-24">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.sender_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender_id !== user.id && (
                <Image
                  src={
                    message.sender?.profile_picture_url ||
                    "https://placehold.co/32x32"
                  }
                  alt={message.sender?.name || "Sender"}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div
                className={`max-w-xs rounded-2xl p-3 md:max-w-md ${
                  message.sender_id === user.id
                    ? "rounded-br-none bg-blue-600 text-white"
                    : "rounded-bl-none bg-white text-slate-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Accept/Decline Dialogs for Seller (Mobile-friendly) */}
        <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Pro Tip</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm the details and agree on a safe, public meeting spot on campus.<br />
                Clear communication helps you sell faster!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {/* --- Updated onClick for Accept Dialog --- */}
              <AlertDialogAction
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  setShowAcceptDialog(false);
                  if (pendingAction === 'accept') {
                    setIsAccepting(true);
                    try {
                      await sendMessage(otherUser.id, new FormData()); // Optionally trigger accept action here
                    } finally {
                      setIsAccepting(false);
                    }
                  }
                }}
              >Ok, got it</AlertDialogAction>
              {/* ------------------------------------------ */}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to decline this request?</AlertDialogTitle>
              <AlertDialogDescription>
                If you decline, the buyer will be notified and this opportunity will be lost.<br />
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  setShowDeclineDialog(false);
                  if (pendingAction === 'decline') {
                    await sendMessage(otherUser.id, new FormData()); // Optionally trigger decline action here
                  }
                }}
              >Yes, Decline</AlertDialogAction>
              <AlertDialogCancel>No, Go Back</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Input Bar (not fixed) */}
        {/* Only show input if buyer and connection is accepted, or if seller */}
        {(!isBuyer || !isPending) && (
          <footer className="border-t bg-white p-3 shadow-sm">
            <form
              ref={formRef}
              action={async (formData: FormData) => {
                if (!otherUser?.id) return;
                formRef.current?.reset();
                try {
                  await sendMessage(otherUser.id, formData);
                } catch (err: any) {
                  setChatError("Failed to send message. Please try again later.");
                }
              }}
              className="flex items-center gap-2"
            >
              <Input
                name="content"
                placeholder="Type a message..."
                autoComplete="off"
                required
                onChange={handleInputChange}
              />
              <Input type="hidden" name="connectionId" value={connection.id} />
              <Button type="submit" size="icon">
                <Send />
              </Button>
            </form>
            {chatError && (
              <AlertDialog open={!!chatError} onOpenChange={() => setChatError(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Error</AlertDialogTitle>
                    <AlertDialogDescription>{chatError}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setChatError(null)}>OK</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}