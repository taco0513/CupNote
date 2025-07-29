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
      coffee_records: {
        Row: {
          id: string
          user_id: string
          coffee_name: string
          cafe_name: string
          location: string
          brewing_method: string
          selected_flavors: Json
          selected_sensory: Json
          personal_notes: string | null
          roaster_notes: string | null
          roaster_notes_level: number
          flavor_match_score: number | null
          sensory_match_score: number | null
          total_match_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coffee_name: string
          cafe_name: string
          location: string
          brewing_method: string
          selected_flavors?: Json
          selected_sensory?: Json
          personal_notes?: string | null
          roaster_notes?: string | null
          roaster_notes_level?: number
          flavor_match_score?: number | null
          sensory_match_score?: number | null
          total_match_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coffee_name?: string
          cafe_name?: string
          location?: string
          brewing_method?: string
          selected_flavors?: Json
          selected_sensory?: Json
          personal_notes?: string | null
          roaster_notes?: string | null
          roaster_notes_level?: number
          flavor_match_score?: number | null
          sensory_match_score?: number | null
          total_match_score?: number | null
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