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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adsense_settings: {
        Row: {
          created_at: string | null
          id: string
          publisher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          publisher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          publisher_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          published: boolean | null
          read_time: string | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          read_time?: string | null
          slug?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          read_time?: string | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_members: {
        Row: {
          chat_id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_url: string | null
          body: string | null
          chat_id: string
          created_at: string | null
          id: number
          sender_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          chat_id: string
          created_at?: string | null
          id?: number
          sender_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          chat_id?: string
          created_at?: string | null
          id?: number
          sender_id?: string | null
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string | null
          friend_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      live_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          last_online_at: string | null
          tracking_enabled: boolean
          updated_at: string | null
          visibility: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          last_online_at?: string | null
          tracking_enabled?: boolean
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          last_online_at?: string | null
          tracking_enabled?: boolean
          updated_at?: string | null
          visibility?: string
        }
        Relationships: []
      }
      location_history: {
        Row: {
          id: number
          lat: number
          lng: number
          recorded_at: string
          user_id: string | null
        }
        Insert: {
          id?: number
          lat: number
          lng: number
          recorded_at?: string
          user_id?: string | null
        }
        Update: {
          id?: number
          lat?: number
          lng?: number
          recorded_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          reactions: Json[] | null
          reply_to: Json | null
          user_email: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reactions?: Json[] | null
          reply_to?: Json | null
          user_email: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reactions?: Json[] | null
          reply_to?: Json | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      pdf_chats: {
        Row: {
          content: string
          id: string
          is_user: boolean | null
          pdf_id: string
          timestamp: string | null
        }
        Insert: {
          content: string
          id?: string
          is_user?: boolean | null
          pdf_id: string
          timestamp?: string | null
        }
        Update: {
          content?: string
          id?: string
          is_user?: boolean | null
          pdf_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_chats_pdf_id_fkey"
            columns: ["pdf_id"]
            isOneToOne: false
            referencedRelation: "pdfs"
            referencedColumns: ["id"]
          },
        ]
      }
      pdfs: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: string | null
          file_size_bytes: number | null
          id: string
          page_count: number | null
          summary: string | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size?: string | null
          file_size_bytes?: number | null
          id?: string
          page_count?: number | null
          summary?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: string | null
          file_size_bytes?: number | null
          id?: string
          page_count?: number | null
          summary?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          gemini_api_key: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gemini_api_key?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gemini_api_key?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_prediction: Json | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          issue_type: string
          latitude: number
          longitude: number
          reporter_email: string | null
          reporter_name: string | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_prediction?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          issue_type: string
          latitude: number
          longitude: number
          reporter_email?: string | null
          reporter_name?: string | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_prediction?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          issue_type?: string
          latitude?: number
          longitude?: number
          reporter_email?: string | null
          reporter_name?: string | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          id: string
          interval: string
          name: string
          paypal_plan_id: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          interval?: string
          name: string
          paypal_plan_id: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          interval?: string
          name?: string
          paypal_plan_id?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          heading: number | null
          lat: number
          lng: number
          speed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          heading?: number | null
          lat: number
          lng: number
          speed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          heading?: number | null
          lat?: number
          lng?: number
          speed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paypal_subscription_id: string
          plan_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paypal_subscription_id: string
          plan_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paypal_subscription_id?: string
          plan_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_pdf_limits: {
        Args: { user_id: string }
        Returns: Json
      }
      cleanup_excess_pdfs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_user_last_online: {
        Args: { user_id_param: string }
        Returns: undefined
      }
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
