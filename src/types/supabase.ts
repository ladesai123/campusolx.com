// /types/supabase.ts
// ✅ This file contains your database types for Supabase
// Generated manually (you can also run `supabase gen types typescript ...` to auto-generate)
// Import these types anywhere in your app for full type-safety

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// 👇 Main Database type
export interface Database {
  public: {
    Tables: {
      // ----------------------
      // Messages Table
      // ----------------------
      messages: {
        Row: {
          id: number;
          content: string;
          created_at: string;
          sender_id: string;       // FK → profiles.id
          connection_id: string;   // FK → connections.id
        };
        Insert: {
          content: string;
          sender_id: string;
          connection_id: string;
          created_at?: string;     // optional, default = now()
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_connection_id_fkey";
            columns: ["connection_id"];
            referencedRelation: "connections";
            referencedColumns: ["id"];
          }
        ];
      };

      // ----------------------
      // Profiles Table
      // ----------------------
      profiles: {
        Row: {
          id: string;                       // same as auth.users.id
          name: string | null;
          profile_picture_url: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          profile_picture_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };

      // ----------------------
      // Connections Table
      // ----------------------
      connections: {
        Row: {
          id: string;
          seller_id: string;     // FK → profiles.id
          requester_id: string;  // FK → profiles.id
          created_at: string;
        };
        Insert: {
          seller_id: string;
          requester_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['connections']['Insert']>;
        Relationships: [
          {
            foreignKeyName: "connections_seller_id_fkey";
            columns: ["seller_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_requester_id_fkey";
            columns: ["requester_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ----------------------
      // Products Table
      // ----------------------
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          image_url: string | null;
          seller_id: string;     // FK → profiles.id
          created_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          seller_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey";
            columns: ["seller_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}
