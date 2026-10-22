export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      memorial: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hebrew_name: string
          english_name: string
          hebrew_death_date_day: number | null
          hebrew_death_date_month: string | null
          hebrew_death_date_year: number | null
          gregorian_death_date: string
          death_date_verified: boolean
          death_time_relative_to_sunset: 'pending' | 'before_sunset' | 'after_sunset'
          hebrew_date_before_sunset_day: number | null
          hebrew_date_before_sunset_month: string | null
          hebrew_date_before_sunset_year: number | null
          hebrew_date_after_sunset_day: number | null
          hebrew_date_after_sunset_month: string | null
          hebrew_date_after_sunset_year: number | null
          death_date_verified_at: string | null
          death_date_verified_by: string | null
          portrait_url: string | null
          quote: string | null
          intro_text: string | null
        }
        Insert: Omit<Database['public']['Tables']['memorial']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['memorial']['Insert']>
      }
      timeline_event: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          memorial_id: string
          category: string
          title: string
          description: string | null
          date_hebrew: string | null
          date_gregorian: string | null
          sort_order: number
          is_published: boolean
        }
        Insert: Omit<Database['public']['Tables']['timeline_event']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['timeline_event']['Insert']>
      }
      story: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          memorial_id: string
          author_name: string
          author_relation: string
          title: string
          content: string
          approval_status: 'pending' | 'approved' | 'rejected'
          submitted_by: string | null
          approved_by: string | null
          approved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['story']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['story']['Insert']>
      }
      album: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          memorial_id: string
          title: string
          description: string | null
          category: string
          sort_order: number
          is_published: boolean
        }
        Insert: Omit<Database['public']['Tables']['album']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['album']['Insert']>
      }
      media_asset: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          memorial_id: string
          album_id: string | null
          story_id: string | null
          file_path: string
          file_type: 'image' | 'video' | 'audio'
          file_size: number
          caption: string | null
          date_taken: string | null
          people_tagged: string[] | null
          approval_status: 'pending' | 'approved' | 'rejected'
          uploaded_by: string | null
          approved_by: string | null
          approved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['media_asset']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['media_asset']['Insert']>
      }
      user_profile: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          display_name: string | null
          relation_to_deceased: string | null
          avatar_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_profile']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profile']['Insert']>
      }
      user_membership: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          memorial_id: string
          role: 'visitor' | 'registered' | 'content_manager' | 'super_admin'
          granted_by: string | null
          granted_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_membership']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_membership']['Insert']>
      }
      prayer_section: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          memorial_id: string
          section_order: number
          title: string
          hebrew_text: string
          notes: string | null
          is_verified: boolean
        }
        Insert: Omit<Database['public']['Tables']['prayer_section']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['prayer_section']['Insert']>
      }
      memorial_schedule: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          memorial_id: string
          year: number
          hebrew_date_day: number
          hebrew_date_month: string
          hebrew_date_year: number
          gregorian_date: string
          gathering_time: string | null
          prayers_time: string | null
          grave_visit_time: string | null
          meal_time: string | null
          location_notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['memorial_schedule']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['memorial_schedule']['Insert']>
      }
      approval_record: {
        Row: {
          id: string
          created_at: string
          content_type: 'story' | 'media_asset'
          content_id: string
          previous_status: string
          new_status: string
          approved_by: string
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['approval_record']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['approval_record']['Insert']>
      }
      audit_log: {
        Row: {
          id: string
          created_at: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          changes: Json | null
          ip_address: string | null
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>
      }
      consent_record: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          content_type: string
          content_id: string
          consent_given: boolean
          consent_details: Json | null
        }
        Insert: Omit<Database['public']['Tables']['consent_record']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['consent_record']['Insert']>
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
  }
}
