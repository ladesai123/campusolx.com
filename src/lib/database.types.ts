export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          created_at: string | null
          id: number
          product_id: number
          requester_id: string
          seller_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id: number
          requester_id: string
          seller_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: number
          requester_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          consent: boolean
          created_at: string | null
          experience: string
          id: number
          name: string | null
          status: string
          user_id: string
          year: string
        }
        Insert: {
          consent?: boolean
          created_at?: string | null
          experience: string
          id?: number
          name?: string | null
          status?: string
          user_id: string
          year: string
        }
        Update: {
          consent?: boolean
          created_at?: string | null
          experience?: string
          id?: number
          name?: string | null
          status?: string
          user_id?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          connection_id: number
          content: string | null
          created_at: string | null
          id: number
          sender_id: string
        }
        Insert: {
          connection_id: number
          content?: string | null
          created_at?: string | null
          id?: number
          sender_id: string
        }
        Update: {
          connection_id?: number
          content?: string | null
          created_at?: string | null
          id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          connection_id: number | null
          created_at: string
          id: number
          is_read: boolean
          message_id: number | null
          receiver_id: string | null
        }
        Insert: {
          connection_id?: number | null
          created_at?: string
          id?: never
          is_read?: boolean
          message_id?: number | null
          receiver_id?: string | null
        }
        Update: {
          connection_id?: number | null
          created_at?: string
          id?: never
          is_read?: boolean
          message_id?: number | null
          receiver_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_from: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          image_urls: string[] | null
          is_hidden: boolean
          mrp: number | null
          price: number | null
          seller_id: string
          show_on_landing: boolean | null
          status: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          available_from?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_urls?: string[] | null
          is_hidden?: boolean
          mrp?: number | null
          price?: number | null
          seller_id: string
          show_on_landing?: boolean | null
          status?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          available_from?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_urls?: string[] | null
          is_hidden?: boolean
          mrp?: number | null
          price?: number | null
          seller_id?: string
          show_on_landing?: boolean | null
          status?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string | null
          last_active_at: string | null
          name: string | null
          display_name: string | null
          profile_picture_url: string | null
          university: string | null
          acquisition_source: string | null
          email: string | null
          year: string | null
          hostel_block: string | null
          phone_number: string | null
          room_no: string | null
        }
        Insert: {
          id: string
          created_at?: string | null
          last_active_at?: string | null
          name?: string | null
          display_name?: string | null
          profile_picture_url?: string | null
          university?: string | null
          acquisition_source?: string | null
          email?: string | null
          year?: string | null
          hostel_block?: string | null
          phone_number?: string | null
          room_no?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          last_active_at?: string | null
          name?: string | null
          display_name?: string | null
          profile_picture_url?: string | null
          university?: string | null
          acquisition_source?: string | null
          email?: string | null
          year?: string | null
          hostel_block?: string | null
          phone_number?: string | null
          room_no?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          id: number
          user_id: string
          title: string
          max_budget: number | null
          whatsapp_number: string | null
          status: string
          view_count: number
          expires_at: string | null
          created_at: string | null
          is_hidden: boolean
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          max_budget?: number | null
          whatsapp_number?: string | null
          status?: string
          view_count?: number
          expires_at?: string | null
          created_at?: string | null
          is_hidden?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          max_budget?: number | null
          whatsapp_number?: string | null
          status?: string
          view_count?: number
          expires_at?: string | null
          created_at?: string | null
          is_hidden?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_items: {
        Row: {
          created_at: string | null
          id: number
          product_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
