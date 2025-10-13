import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";
import { Database } from "@/lib/database.types";
import { NotificationProvider } from '@/app/(main)/context/NotificationContext';

// Re-exporting types for client components to use
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageWithSender = Message & { sender: Profile | null };

/**
 * This is the main server component for the chat page.
 * It fetches all necessary initial data securely on the server.
 */
export default async function ChatPage(context: { params: { connectionId: string } }) {
  const { params } = context;
  const connectionIdString = params.connectionId;
  const connectionId = parseInt(connectionIdString, 10);

  const supabase = await createClient();

  // 1. Get the current authenticated user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    // Preserve the chat URL for after login
    redirect(`/login?redirect=${encodeURIComponent(`/chat/${connectionId}`)}`);
  }

  // 2. Fetch the connection details, including the seller and requester profiles
  const { data: connection, error: connError } = await supabase
    .from("connections")
    .select(
      `
      *,
      seller:profiles!connections_seller_id_fkey(*),
      requester:profiles!connections_requester_id_fkey(*)
    `,
    )
    .eq("id", connectionId)
    .single();

  if (connError || !connection) {
    console.error("Error fetching connection:", connError);
    redirect("/home");
  }

  // 3. Security Check: Ensure the current user is part of this conversation
  if (
    authUser.id !== connection.seller_id &&
    authUser.id !== connection.requester_id
  ) {
    redirect("/home");
  }

  // 4. Fetch the initial batch of messages for this connection
  const { data: serverMessages, error: msgError } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(*)
    `,
    )
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("Error fetching messages:", msgError);
    // Continue with an empty message list if fetching fails
  }

  // 5. Fetch the current user's full profile
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // 6. Pass all fetched data as props to the client component
  // Wrap the ChatClient with the NotificationProvider here
  return (
    <NotificationProvider user={authUser}>
      <ChatClient
        connection={connection as any}
        initialMessages={(serverMessages as MessageWithSender[]) || []}
        user={userProfile}
      />
    </NotificationProvider>
  );
}