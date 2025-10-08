"use client";
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
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/client";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { NotificationContext } from '../../context/NotificationContext';
import type { Profile, MessageWithSender } from "./page";
// --- Import AppLoader ---
import AppLoader from "@/components/shared/AppLoader"; 
// ------------------------

// --- Types ---
type ConnectionWithProfiles = {
  id: number;
  seller: Profile | null;
  requester: Profile | null;
  status?: string;
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
  const { containerRef, scrollToBottom } = useChatScroll();
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const otherUser = user?.id === connection.seller?.id ? connection.requester : connection.seller;

  // Helper: Is buyer and chat not accepted?
  const isBuyer = user?.id === connection.requester?.id;
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
  return (
    <div className="chat-page-container">
      {/* --- AppLoader component for loading state --- */}
      {isAccepting && (
        <AppLoader className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center" />
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
        <footer className="border-t bg-white p-3 shadow-sm">
          <form
            ref={formRef}
            action={async (formData: FormData) => {
              if (!otherUser?.id) return;
              formRef.current?.reset();
              await sendMessage(otherUser.id, formData);
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
        </footer>
      </div>
    </div>
  );
}