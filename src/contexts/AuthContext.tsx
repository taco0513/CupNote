'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { log } from '../lib/logger'
import { AuthService } from '../lib/supabase-service'
import { UserProfileService } from '../lib/supabase-service'

interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  level: number
  total_points: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 프로필 정보 조회 또는 생성
  const fetchUserProfile = async (authUser: any): Promise<User | null> => {
    try {
      // 먼저 기존 프로필 조회 시도
      let profile
      try {
        profile = await UserProfileService.getProfile()
      } catch (error) {
        // 프로필이 없으면 생성
        log.info('Profile not found, creating new profile...', { userId: authUser.id })
        const username = authUser.user_metadata?.username || authUser.email.split('@')[0]
        profile = await UserProfileService.createProfile({
          username,
          email: authUser.email,
        })
      }

      return {
        id: authUser.id,
        email: authUser.email,
        username: profile.username,
        avatar_url: profile.avatar_url,
        level: profile.level,
        total_points: profile.total_points,
      }
    } catch (error) {
      log.error('Error fetching/creating user profile', error, { userId: authUser.id })
      return null
    }
  }

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authUser = await AuthService.getCurrentUser()
        if (authUser) {
          const userProfile = await fetchUserProfile(authUser)
          setUser(userProfile)
        }
      } catch (error) {
        log.error('Error initializing auth', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // 인증 상태 변화 구독
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(async authUser => {
      if (authUser) {
        const userProfile = await fetchUserProfile(authUser)
        setUser(userProfile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: authUser } = await AuthService.signIn(email, password)
      if (authUser) {
        const userProfile = await fetchUserProfile(authUser)
        setUser(userProfile)
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true)
    try {
      log.info('Starting signup process', { email, username })
      const result = await AuthService.signUp(email, password, username)
      log.info('Signup completed', { hasUser: !!result.user, needsConfirmation: !result.user })

      if (result.user) {
        log.info('User created, fetching profile...', { userId: result.user.id })
        const userProfile = await fetchUserProfile(result.user)
        log.info('Profile created/fetched', { username: userProfile?.username, level: userProfile?.level })
        setUser(userProfile)
      } else {
        log.info('No user in result, might need email confirmation')
      }
    } catch (error) {
      log.error('SignUp error in AuthContext', error, { email })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const authUser = await AuthService.getCurrentUser()
      if (authUser) {
        const userProfile = await fetchUserProfile(authUser)
        setUser(userProfile)
      }
    } catch (error) {
      log.error('Error refreshing profile', error, { userId: user?.id })
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
