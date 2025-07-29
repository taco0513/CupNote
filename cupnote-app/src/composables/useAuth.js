import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref(null)
const session = ref(null)
const loading = ref(true)

// 인증 상태 초기화
supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
  session.value = currentSession
  user.value = currentSession?.user ?? null
  loading.value = false
})

// 인증 상태 변경 리스너
supabase.auth.onAuthStateChange((event, currentSession) => {
  session.value = currentSession
  user.value = currentSession?.user ?? null
  loading.value = false
})

export function useAuth() {
  // 계산된 속성
  const isAuthenticated = computed(() => !!user.value)
  const userProfile = computed(() => user.value?.user_metadata || {})

  // 로그인
  const signIn = async (email, password) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // 회원가입
  const signUp = async (email, password, options = {}) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options.metadata || {}
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      loading.value = true
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  // 소셜 로그인 (Google)
  const signInWithGoogle = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 프로필 업데이트
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  return {
    // 상태
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    isAuthenticated,
    userProfile,
    
    // 메서드
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateProfile
  }
}