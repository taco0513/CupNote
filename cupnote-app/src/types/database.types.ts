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
      users: {
        Row: {
          id: string
          auth_id: string
          username: string | null
          display_name: string | null
          level: number
          xp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          username?: string | null
          display_name?: string | null
          level?: number
          xp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          username?: string | null
          display_name?: string | null
          level?: number
          xp?: number
          created_at?: string
          updated_at?: string
        }
      }
      tastings: {
        Row: {
          id: string
          user_id: string
          coffee_id: string | null
          mode: 'cafe' | 'homecafe' | 'pro'
          session_id: string | null
          coffee_info: Json
          brew_settings: Json | null
          experimental_data: Json | null
          selected_flavors: Json
          sensory_expressions: Json
          personal_comment: string | null
          roaster_notes: string | null
          match_score: Json | null
          total_duration: number | null
          sensory_skipped: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coffee_id?: string | null
          mode: 'cafe' | 'homecafe' | 'pro'
          session_id?: string | null
          coffee_info: Json
          brew_settings?: Json | null
          experimental_data?: Json | null
          selected_flavors?: Json
          sensory_expressions?: Json
          personal_comment?: string | null
          roaster_notes?: string | null
          match_score?: Json | null
          total_duration?: number | null
          sensory_skipped?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coffee_id?: string | null
          mode?: 'cafe' | 'homecafe' | 'pro'
          session_id?: string | null
          coffee_info?: Json
          brew_settings?: Json | null
          experimental_data?: Json | null
          selected_flavors?: Json
          sensory_expressions?: Json
          personal_comment?: string | null
          roaster_notes?: string | null
          match_score?: Json | null
          total_duration?: number | null
          sensory_skipped?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coffees: {
        Row: {
          id: string
          name: string
          roaster: string | null
          origin: string | null
          roast_level: string | null
          processing_method: string | null
          variety: string | null
          farm: string | null
          altitude: number | null
          notes: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          roaster?: string | null
          origin?: string | null
          roast_level?: string | null
          processing_method?: string | null
          variety?: string | null
          farm?: string | null
          altitude?: number | null
          notes?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          roaster?: string | null
          origin?: string | null
          roast_level?: string | null
          processing_method?: string | null
          variety?: string | null
          farm?: string | null
          altitude?: number | null
          notes?: string | null
          created_at?: string
          created_by?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          xp_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          xp_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          xp_reward?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      coffee_statistics: {
        Row: {
          coffee_name: string
          cafe_name: string | null
          total_records: number
          average_score: number
          common_flavors: Json
          updated_at: string
        }
        Insert: {
          coffee_name: string
          cafe_name?: string | null
          total_records?: number
          average_score?: number
          common_flavors?: Json
          updated_at?: string
        }
        Update: {
          coffee_name?: string
          cafe_name?: string | null
          total_records?: number
          average_score?: number
          common_flavors?: Json
          updated_at?: string
        }
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