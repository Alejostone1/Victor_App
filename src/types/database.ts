// Generado desde Supabase (generate_typescript_types). No editar a mano:
// vuelve a generarlo después de cada migración.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          created_at: string
          error_tags: string[]
          exercise_id: string
          exercise_type: string
          id: number
          is_correct: boolean
          lesson_id: string
          score: number | null
          skill: string
          user_answer: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_tags?: string[]
          exercise_id: string
          exercise_type: string
          id?: never
          is_correct: boolean
          lesson_id: string
          score?: number | null
          skill: string
          user_answer?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_tags?: string[]
          exercise_id?: string
          exercise_type?: string
          id?: never
          is_correct?: boolean
          lesson_id?: string
          score?: number | null
          skill?: string
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string
          is_rest_day: boolean
          lessons_completed: number
          minutes_studied: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date: string
          is_rest_day?: boolean
          lessons_completed?: number
          minutes_studied?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          is_rest_day?: boolean
          lessons_completed?: number
          minutes_studied?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          best_score: number
          completed_at: string | null
          id: number
          lesson_id: string
          status: string
          times_completed: number
          unit_id: string
          user_id: string
        }
        Insert: {
          best_score?: number
          completed_at?: string | null
          id?: never
          lesson_id: string
          status?: string
          times_completed?: number
          unit_id: string
          user_id: string
        }
        Update: {
          best_score?: number
          completed_at?: string | null
          id?: never
          lesson_id?: string
          status?: string
          times_completed?: number
          unit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_level: string
          daily_goal_minutes: number
          display_name: string
          id: string
          onboarding_completed: boolean
          total_xp: number
          voice_rate: number
        }
        Insert: {
          created_at?: string
          current_level?: string
          daily_goal_minutes?: number
          display_name?: string
          id: string
          onboarding_completed?: boolean
          total_xp?: number
          voice_rate?: number
        }
        Update: {
          created_at?: string
          current_level?: string
          daily_goal_minutes?: number
          display_name?: string
          id?: string
          onboarding_completed?: boolean
          total_xp?: number
          voice_rate?: number
        }
        Relationships: []
      }
      review_items: {
        Row: {
          audio_text: string | null
          back: string
          ease_factor: number
          front: string
          id: number
          interval_days: number
          item_key: string
          last_reviewed_at: string | null
          next_review_at: string
          repetitions: number
          user_id: string
        }
        Insert: {
          audio_text?: string | null
          back: string
          ease_factor?: number
          front: string
          id?: never
          interval_days?: number
          item_key: string
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          user_id: string
        }
        Update: {
          audio_text?: string | null
          back?: string
          ease_factor?: number
          front?: string
          id?: never
          interval_days?: number
          item_key?: string
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
