'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/client'; // Correct, modern client
import Image from 'next/image';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendMessage } from './actions';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { Database } from '@/lib/database.types';

// =======================
// Types (Using generated types for safety)
// =======================
type Profile = Database['public']['Tables']['profiles']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

// Combined type for a message with sender's profile info
export type MessageWithSender = Message & {
  sender: Profile | null;
};

type Connection = {
  id: number;
  seller_id: string;
  requester_id: string;
  seller: Profile;
  requester: Profile;
};

interface ChatPaneProps {
  connection: Connection;
  initialMessages: MessageWithSender[];
  user: Profile | null;
  onBack: () => void;
}

// =======================
// ChatPane Component
// =======================
export default function ChatPane({ connection, initialMessages, user, onBack }: ChatPaneProps) {
  const [messages, setMessages] = useState(initialMessages);
  const supabase = useMemo(() => createClient(), []);
  const formRef = useRef<HTMLFormElement>(null);
  const { containerRef, scrollToBottom } = useChatScroll();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-chat:${connection.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `connection_id=eq.${connection.id}` 
        },
        async (payload) => {
          // When a new message arrives, fetch it with the sender's profile
          const { data: newMessageWithProfile } = await supabase
            .from('messages')
            .select(`*, sender:profiles!messages_sender_id_fkey(*)`)
            .eq('id', payload.new.id)
            .single();
          
          if (newMessageWithProfile) {
            // Add the new message to the state, but only if it's not already there
            setMessages((prev) => {
              if (prev.find(m => m.id === newMessageWithProfile.id)) {
                return prev;
              }
              return [...prev, newMessageWithProfile as MessageWithSender];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, connection.id]);

  if (!user) {
            const { containerRef, scrollToBottom } = useChatScroll();
  }

  const otherUser = user?.id === connection.seller_id ? connection.requester : connection.seller;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft />
        </Button>
        <Image
          src={otherUser.profile_picture_url || 'https://placehold.co/40x40'}
          alt={otherUser.name || 'User'}
          width={40}
          height={40}
          className="rounded-full"
        />
        <h2 className="ml-3 text-lg font-semibold">{otherUser.name}</h2>
      </div>

      {/* Messages Area */}
  <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
             className={`flex items-end gap-2 ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
             {message.sender_id !== user?.id && (
              <Image
                src={message.sender?.profile_picture_url || 'https://placehold.co/32x32'}
                alt={message.sender?.name || 'Sender'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div
               className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                 message.sender_id === user?.id
                   ? 'bg-blue-600 text-white rounded-br-none'
                   : 'bg-slate-200 text-slate-800 rounded-bl-none'
               }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Form */}
      <div className="p-4 border-t bg-white">
        <form
          ref={formRef}
          action={async (formData: FormData) => {
            formRef.current?.reset();
            await sendMessage(otherUser.id, formData);
          }}
          className="flex items-center gap-2"
        >
          <Input name="content" placeholder="Type a message..." autoComplete="off" required />
          <Input type="hidden" name="connectionId" value={connection.id} />
          <Button type="submit" size="icon">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
