/**
 * Authentication Store
 * 
 * Manages user authentication state, login/logout, and user profile data
 * using Supabase Auth with persistent session management.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const initialized = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => loading.value)
  const userEmail = computed(() => user.value?.email || null)
  const userId = computed(() => user.value?.id || null)
  const userMetadata = computed(() => user.value?.user_metadata || {})

  // Actions
  
  /**
   * Initialize auth state from existing session
   */
  const initializeAuth = async () => {
    try {
      loading.value = true
      
      // Get existing session
      const { data: { session: existingSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return false
      }
      
      if (existingSession) {
        session.value = existingSession
        user.value = existingSession.user
        
        // Set up user profile if needed
        await ensureUserProfile()
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          ensureUserProfile()
        } else if (event === 'SIGNED_OUT') {
          clearUserData()
        }
      })
      
      initialized.value = true
      return !!existingSession
      
    } catch (error) {
      console.error('Auth initialization error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign up new user with email and password
   */
  const signUp = async (email, password, userData = {}) => {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            coffee_experience: userData.coffeeExperience || 'beginner',
            preferred_mode: userData.preferredMode || 'cafe',
            ...userData
          }
        }
      })
      
      if (error) throw error
      
      return {
        success: true,
        user: data.user,
        message: 'Account created successfully! Please check your email for verification.'
      }
      
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign in user with email and password
   */
  const signIn = async (email, password) => {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      session.value = data.session
      user.value = data.user
      
      await ensureUserProfile()
      
      return {
        success: true,
        user: data.user
      }
      
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: error.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      clearUserData()
      
      return { success: true }
      
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: error.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset password for user
   */
  const resetPassword = async (email) => {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      }
      
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: error.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update user password
   */
  const updatePassword = async (newPassword) => {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Password updated successfully!'
      }
      
    } catch (error) {
      console.error('Password update error:', error)
      return {
        success: false,
        error: error.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update user profile data
   */
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw error
      
      // Update local user data
      if (user.value) {
        user.value.user_metadata = {
          ...user.value.user_metadata,
          ...updates
        }
      }
      
      return {
        success: true,
        message: 'Profile updated successfully!'
      }
      
    } catch (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        error: error.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ensure user profile exists in database
   */
  const ensureUserProfile = async () => {
    if (!user.value) return
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError)
        return
      }
      
      // Create profile if it doesn't exist
      if (!existingProfile) {
        const profileData = {
          id: user.value.id,
          email: user.value.email,
          full_name: user.value.user_metadata?.full_name || '',
          coffee_experience: user.value.user_metadata?.coffee_experience || 'beginner',
          preferred_mode: user.value.user_metadata?.preferred_mode || 'cafe',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(profileData)
        
        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
      }
      
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  /**
   * Clear user data on logout
   */
  const clearUserData = () => {
    user.value = null
    session.value = null
  }

  /**
   * Check if user has access to specific mode
   */
  const hasAccess = (mode) => {
    if (!isAuthenticated.value) return mode === 'cafe'
    
    const experience = userMetadata.value.coffee_experience || 'beginner'
    
    switch (mode) {
      case 'cafe':
        return true
      case 'homecafe':
        return ['intermediate', 'advanced', 'expert'].includes(experience)
      case 'pro':
        return ['advanced', 'expert'].includes(experience)
      default:
        return false
    }
  }

  /**
   * Get access token for API calls
   */
  const getAccessToken = () => {
    return session.value?.access_token || null
  }

  return {
    // State
    user,
    session,
    loading,
    initialized,
    
    // Computed
    isAuthenticated,
    isLoading,
    userEmail,
    userId,
    userMetadata,
    
    // Actions
    initializeAuth,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    hasAccess,
    getAccessToken
  }
})