import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || null)

  // Actions
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || null
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Create user profile
        await createUserProfile(data.user, displayName)
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign up'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign in'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      // Clear state
      user.value = null
      session.value = null
      userProfile.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign out'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signInWithGoogle = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (googleError) throw googleError

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign in with Google'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) throw resetError
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send reset email'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createUserProfile = async (authUser: User, displayName?: string) => {
    try {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_id: authUser.id,
          display_name: displayName || authUser.user_metadata?.display_name || null,
          username: null, // Can be set later
          level: 1,
          xp: 0
        })

      if (profileError) throw profileError
    } catch (err) {
      console.error('Failed to create user profile:', err)
      // Don't throw - profile creation is not critical for auth
    }
  }

  const fetchUserProfile = async () => {
    if (!user.value) return

    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.value.id)
        .single()

      if (profileError) {
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          await createUserProfile(user.value)
          // Try to fetch again
          const { data: newData, error: newError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.value.id)
            .single()
          
          if (newError) throw newError
          userProfile.value = newData
        } else {
          throw profileError
        }
      } else {
        userProfile.value = data
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      error.value = 'Failed to load user profile'
    }
  }

  const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'display_name' | 'username'>>) => {
    if (!user.value || !userProfile.value) return

    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      userProfile.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addXP = async (amount: number) => {
    if (!userProfile.value) return

    try {
      const newXP = userProfile.value.xp + amount
      const newLevel = Math.floor(newXP / 100) + 1 // Simple level calculation

      const { data, error: xpError } = await supabase
        .from('users')
        .update({ 
          xp: newXP,
          level: newLevel
        })
        .eq('id', userProfile.value.id)
        .select()
        .single()

      if (xpError) throw xpError

      const oldLevel = userProfile.value?.level || 1
      userProfile.value = data
      return { xpGained: amount, levelUp: newLevel > oldLevel }
    } catch (err) {
      console.error('Failed to add XP:', err)
    }
  }

  // Initialize auth state
  const initialize = async () => {
    try {
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      if (initialSession) {
        session.value = initialSession
        user.value = initialSession.user
        await fetchUserProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email)
        
        session.value = newSession
        user.value = newSession?.user || null

        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchUserProfile()
        } else if (event === 'SIGNED_OUT') {
          userProfile.value = null
        }
      })
    } catch (err) {
      console.error('Failed to initialize auth:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    session,
    userProfile,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    userId,

    // Actions
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    fetchUserProfile,
    updateUserProfile,
    addXP,
    initialize,
    clearError
  }
})