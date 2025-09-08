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
      cancellation_feedback: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string
          comment: string | null
          created_at: string
          id: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at: string
          comment?: string | null
          created_at?: string
          id?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string
          comment?: string | null
          created_at?: string
          id?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: []
      }
      client_invitations: {
        Row: {
          client_name: string
          created_at: string
          created_by_name: string | null
          email: string
          expires_at: string
          id: string
          invitation_version: number | null
          invite_token: string
          invited_by: string | null
          next_payment_amount: number | null
          next_payment_date: string | null
          plan_type: string
          site_id: string | null
          status: string | null
          superseded_at: string | null
          superseded_by: string | null
          used_at: string | null
          website_name: string
          website_url: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by_name?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_version?: number | null
          invite_token: string
          invited_by?: string | null
          next_payment_amount?: number | null
          next_payment_date?: string | null
          plan_type: string
          site_id?: string | null
          status?: string | null
          superseded_at?: string | null
          superseded_by?: string | null
          used_at?: string | null
          website_name: string
          website_url: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by_name?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_version?: number | null
          invite_token?: string
          invited_by?: string | null
          next_payment_amount?: number | null
          next_payment_date?: string | null
          plan_type?: string
          site_id?: string | null
          status?: string | null
          superseded_at?: string | null
          superseded_by?: string | null
          used_at?: string | null
          website_name?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          name: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          amount_due: number | null
          created_at: string | null
          email_status: string | null
          id: string
          reminder_type: string
          sent_at: string | null
          site_id: string | null
        }
        Insert: {
          amount_due?: number | null
          created_at?: string | null
          email_status?: string | null
          id?: string
          reminder_type: string
          sent_at?: string | null
          site_id?: string | null
        }
        Update: {
          amount_due?: number | null
          created_at?: string | null
          email_status?: string | null
          id?: string
          reminder_type?: string
          sent_at?: string | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          method: string | null
          payment_date: string | null
          plan_type: string
          site_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          method?: string | null
          payment_date?: string | null
          plan_type: string
          site_id?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          method?: string | null
          payment_date?: string | null
          plan_type?: string
          site_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          marketing_opt_in: boolean | null
          marketing_updated_at: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          marketing_opt_in?: boolean | null
          marketing_updated_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          marketing_opt_in?: boolean | null
          marketing_updated_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          current_website: string | null
          email: string
          id: string
          name: string
          phone: string | null
          project_description: string
          project_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          current_website?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          project_description: string
          project_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          current_website?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          project_description?: string
          project_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: unknown
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_type: string
          site_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_type: string
          site_id?: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type?: string
          site_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string
          site_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          site_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          site_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          last_sign_in: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_sign_in?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_sign_in?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      websites: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          grace_period_end_date: string | null
          id: string
          last_payment_reminder_sent: string | null
          name: string
          next_payment_amount: number | null
          next_payment_date: string | null
          payment_status: string | null
          plan_type: string
          suspension_date: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          grace_period_end_date?: string | null
          id?: string
          last_payment_reminder_sent?: string | null
          name: string
          next_payment_amount?: number | null
          next_payment_date?: string | null
          payment_status?: string | null
          plan_type: string
          suspension_date?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          grace_period_end_date?: string | null
          id?: string
          last_payment_reminder_sent?: string | null
          name?: string
          next_payment_amount?: number | null
          next_payment_date?: string | null
          payment_status?: string | null
          plan_type?: string
          suspension_date?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_websites_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_client_data: {
        Args: { client_email_param?: string; website_id_param?: string }
        Returns: Json
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_monthly_payment_totals: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          total: number
        }[]
      }
      get_user_invitation_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_active_invitation: boolean
          invitation_amount: number
          invitation_id: string
          invitation_plan: string
          site_id: string
        }[]
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      table_exists: {
        Args: { schema_name_param?: string; table_name_param: string }
        Returns: boolean
      }
      update_payment_statuses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      websites_table_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
