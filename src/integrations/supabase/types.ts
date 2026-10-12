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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      behaviour_notes: {
        Row: {
          adds_min: number
          context: string | null
          date: string | null
          note: string
          note_id: string
          pet_id: string
          source: string | null
        }
        Insert: {
          adds_min?: number
          context?: string | null
          date?: string | null
          note: string
          note_id: string
          pet_id: string
          source?: string | null
        }
        Update: {
          adds_min?: number
          context?: string | null
          date?: string | null
          note?: string
          note_id?: string
          pet_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behaviour_notes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      booking_events: {
        Row: {
          booking_id: string
          created_at: string
          event_type: string
          id: string
          note: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          event_type: string
          id?: string
          note?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          event_type?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          breed: string
          checked_in_at: string | null
          checked_out_at: string | null
          client_name: string
          created_at: string
          duration_minutes: number
          email: string
          id: string
          mobile: string
          notes: string
          pet_name: string
          service_id: string
          staff_id: string
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          booking_date: string
          breed: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          client_name: string
          created_at?: string
          duration_minutes: number
          email: string
          id?: string
          mobile: string
          notes?: string
          pet_name: string
          service_id: string
          staff_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          booking_date?: string
          breed?: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          client_name?: string
          created_at?: string
          duration_minutes?: number
          email?: string
          id?: string
          mobile?: string
          notes?: string
          pet_name?: string
          service_id?: string
          staff_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "legacy_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      breeds: {
        Row: {
          adj_S1: number | null
          adj_S2: number | null
          adj_S3: number | null
          adj_S4: number | null
          breed_id: string
          name: string
          prior_full_style_min: number
          prior_risk: string
          size: string
          species: string
        }
        Insert: {
          adj_S1?: number | null
          adj_S2?: number | null
          adj_S3?: number | null
          adj_S4?: number | null
          breed_id: string
          name: string
          prior_full_style_min: number
          prior_risk: string
          size: string
          species: string
        }
        Update: {
          adj_S1?: number | null
          adj_S2?: number | null
          adj_S3?: number | null
          adj_S4?: number | null
          breed_id?: string
          name?: string
          prior_full_style_min?: number
          prior_risk?: string
          size?: string
          species?: string
        }
        Relationships: []
      }
      capacity_rules: {
        Row: {
          id: string
          note: string
          rule_key: string
          updated_at: string
          value_minutes: number | null
          value_number: number | null
        }
        Insert: {
          id?: string
          note?: string
          rule_key: string
          updated_at?: string
          value_minutes?: number | null
          value_number?: number | null
        }
        Update: {
          id?: string
          note?: string
          rule_key?: string
          updated_at?: string
          value_minutes?: number | null
          value_number?: number | null
        }
        Relationships: []
      }
      client_pet_profiles: {
        Row: {
          behaviour: Json
          breed: string
          client_name: string
          extra_minutes: number
          id: string
          late_cancels: number
          no_shows: number
          on_time_percent: number
          pet_name: string
          reliability: string
          risk: string
          service_failures: Json
          visits: number
        }
        Insert: {
          behaviour?: Json
          breed: string
          client_name: string
          extra_minutes?: number
          id?: string
          late_cancels?: number
          no_shows?: number
          on_time_percent?: number
          pet_name: string
          reliability: string
          risk: string
          service_failures?: Json
          visits?: number
        }
        Update: {
          behaviour?: Json
          breed?: string
          client_name?: string
          extra_minutes?: number
          id?: string
          late_cancels?: number
          no_shows?: number
          on_time_percent?: number
          pet_name?: string
          reliability?: string
          risk?: string
          service_failures?: Json
          visits?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          client_id: string
          client_since: string | null
          email: string | null
          first_channel: string | null
          name: string
          named: string
          phone: string | null
          preferred_contact: string | null
        }
        Insert: {
          client_id: string
          client_since?: string | null
          email?: string | null
          first_channel?: string | null
          name: string
          named?: string
          phone?: string | null
          preferred_contact?: string | null
        }
        Update: {
          client_id?: string
          client_since?: string | null
          email?: string | null
          first_channel?: string | null
          name?: string
          named?: string
          phone?: string | null
          preferred_contact?: string | null
        }
        Relationships: []
      }
      legacy_staff: {
        Row: {
          active: boolean
          bay_label: string
          demo_key: string | null
          display_order: number
          id: string
          name: string
          role_title: string
          specialties: string[]
        }
        Insert: {
          active?: boolean
          bay_label: string
          demo_key?: string | null
          display_order?: number
          id?: string
          name: string
          role_title: string
          specialties?: string[]
        }
        Update: {
          active?: boolean
          bay_label?: string
          demo_key?: string | null
          display_order?: number
          id?: string
          name?: string
          role_title?: string
          specialties?: string[]
        }
        Relationships: []
      }
      pets: {
        Row: {
          born: string | null
          breed_id: string | null
          client_id: string
          name: string
          pet_id: string
          required_staff_id: string | null
          sex: string | null
          size: string | null
          special_guest: string
          species: string
        }
        Insert: {
          born?: string | null
          breed_id?: string | null
          client_id: string
          name: string
          pet_id: string
          required_staff_id?: string | null
          sex?: string | null
          size?: string | null
          special_guest?: string
          species: string
        }
        Update: {
          born?: string | null
          breed_id?: string | null
          client_id?: string
          name?: string
          pet_id?: string
          required_staff_id?: string | null
          sex?: string | null
          size?: string | null
          special_guest?: string
          species?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      rota: {
        Row: {
          break_min: number | null
          break_start: string | null
          end: string | null
          staff_id: string
          start: string | null
          weekday: string
          working: string
        }
        Insert: {
          break_min?: number | null
          break_start?: string | null
          end?: string | null
          staff_id: string
          start?: string | null
          weekday: string
          working: string
        }
        Update: {
          break_min?: number | null
          break_start?: string | null
          end?: string | null
          staff_id?: string
          start?: string | null
          weekday?: string
          working?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      rota_entries: {
        Row: {
          break_minutes: number
          break_starts_at: string | null
          ends_at: string
          id: string
          published: boolean
          staff_id: string
          starts_at: string
          weekday: number
        }
        Insert: {
          break_minutes?: number
          break_starts_at?: string | null
          ends_at: string
          id?: string
          published?: boolean
          staff_id: string
          starts_at: string
          weekday: number
        }
        Update: {
          break_minutes?: number
          break_starts_at?: string | null
          ends_at?: string
          id?: string
          published?: boolean
          staff_id?: string
          starts_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "rota_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "legacy_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_exceptions: {
        Row: {
          date: string
          end: string | null
          note: string | null
          staff_id: string
          start: string | null
          type: string
        }
        Insert: {
          date: string
          end?: string | null
          note?: string | null
          staff_id: string
          start?: string | null
          type: string
        }
        Update: {
          date?: string
          end?: string | null
          note?: string | null
          staff_id?: string
          start?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_exceptions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      service_inventory: {
        Row: {
          item: string
          qty_per_visit: string
          service_id: string
        }
        Insert: {
          item: string
          qty_per_visit: string
          service_id: string
        }
        Update: {
          item?: string
          qty_per_visit?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_inventory_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      service_sop: {
        Row: {
          instruction: string
          service_id: string
          step: number
        }
        Insert: {
          instruction: string
          service_id: string
          step: number
        }
        Update: {
          instruction?: string
          service_id?: string
          step?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_sop_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      service_staff: {
        Row: {
          qualified: string
          service_id: string
          staff_id: string
        }
        Insert: {
          qualified: string
          service_id: string
          staff_id: string
        }
        Update: {
          qualified?: string
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_staff_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          client_about: string | null
          demo_key: string | null
          display_order: number
          duration_minutes: number
          id: string
          name: string
          rule: string | null
          service_id: string | null
          species: string | null
          standard_min: number | null
          visit_count: number
        }
        Insert: {
          active?: boolean
          client_about?: string | null
          demo_key?: string | null
          display_order?: number
          duration_minutes: number
          id?: string
          name: string
          rule?: string | null
          service_id?: string | null
          species?: string | null
          standard_min?: number | null
          visit_count?: number
        }
        Update: {
          active?: boolean
          client_about?: string | null
          demo_key?: string | null
          display_order?: number
          duration_minutes?: number
          id?: string
          name?: string
          rule?: string | null
          service_id?: string | null
          species?: string | null
          standard_min?: number | null
          visit_count?: number
        }
        Relationships: []
      }
      staff: {
        Row: {
          collection_driver: string
          name: string
          role: string
          staff_id: string
          start_date: string | null
          styles_cats: string
          usual_bay: string | null
        }
        Insert: {
          collection_driver: string
          name: string
          role: string
          staff_id: string
          start_date?: string | null
          styles_cats: string
          usual_bay?: string | null
        }
        Update: {
          collection_driver?: string
          name?: string
          role?: string
          staff_id?: string
          start_date?: string | null
          styles_cats?: string
          usual_bay?: string | null
        }
        Relationships: []
      }
      staff_shifts: {
        Row: {
          clock_in: string | null
          date: string
          late_min: number | null
          reason: string | null
          rota_end: string | null
          rota_start: string | null
          staff_id: string
          status: string
        }
        Insert: {
          clock_in?: string | null
          date: string
          late_min?: number | null
          reason?: string | null
          rota_end?: string | null
          rota_start?: string | null
          staff_id: string
          status: string
        }
        Update: {
          clock_in?: string | null
          date?: string
          late_min?: number | null
          reason?: string | null
          rota_end?: string | null
          rota_start?: string | null
          staff_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          completed_at: string | null
          id: string
          minutes: number
          name: string
          note: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          id?: string
          minutes: number
          name: string
          note?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          id?: string
          minutes?: number
          name?: string
          note?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_public_booking: {
        Args: {
          _breed: string
          _client_name: string
          _date: string
          _email: string
          _mobile: string
          _notes?: string
          _pet_name: string
          _service: string
          _staff: string
          _starts: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_public_slots: {
        Args: {
          _days?: number
          _from: string
          _service?: string
          _stylist?: string
        }
        Returns: {
          slot_date: string
          staff_name: string
          starts_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "stylist" | "front_desk"
      booking_status:
        | "booked"
        | "checked_in"
        | "checked_out"
        | "cancelled"
        | "no_show"
        | "rescheduled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "stylist", "front_desk"],
      booking_status: [
        "booked",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
    },
  },
} as const
