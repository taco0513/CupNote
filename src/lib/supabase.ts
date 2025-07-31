import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase 프로젝트 URL과 API Key
// 실제 사용 시에는 환경변수로 관리해야 합니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Singleton pattern으로 Supabase 클라이언트 생성 (중복 인스턴스 방지)
let supabaseInstance: SupabaseClient | null = null

function createSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'cupnote-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  return supabaseInstance
}

// Supabase 클라이언트 내보내기
export const supabase = createSupabaseClient()

// Database Types (자동 생성될 예정)
export interface Database {
  public: {
    Tables: {
      coffee_records: {
        Row: {
          id: string
          user_id: string
          coffee_name: string
          roastery?: string
          origin?: string
          roasting_level?: string
          brewing_method?: string
          rating: number
          taste_notes: string
          roaster_notes?: string
          personal_notes?: string
          mode: 'cafe' | 'homecafe' | 'lab'
          match_score?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coffee_name: string
          roastery?: string
          origin?: string
          roasting_level?: string
          brewing_method?: string
          rating: number
          taste_notes: string
          roaster_notes?: string
          personal_notes?: string
          mode: 'cafe' | 'homecafe' | 'lab'
          match_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coffee_name?: string
          roastery?: string
          origin?: string
          roasting_level?: string
          brewing_method?: string
          rating?: number
          taste_notes?: string
          roaster_notes?: string
          personal_notes?: string
          mode?: 'cafe' | 'homecafe' | 'lab'
          match_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          email: string
          avatar_url?: string
          level: number
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          email: string
          avatar_url?: string
          level?: number
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          email?: string
          avatar_url?: string
          level?: number
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress_current: number
          progress_target: number
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress_current?: number
          progress_target: number
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress_current?: number
          progress_target?: number
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
