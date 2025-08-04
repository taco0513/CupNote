/**
 * Dashboard Layout Content Component
 * Provides shared layout for authenticated dashboard pages
 */
'use client'

import { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface DashboardLayoutContentProps {
  children: React.ReactNode
}

export default function DashboardLayoutContent({ children }: DashboardLayoutContentProps) {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Prefetch critical dashboard data
    if (user && !loading) {
      // Prefetch user's recent records for better UX
      const prefetchUserData = async () => {
        try {
          // Prefetch recent records (could be done in parallel)
          const [recordsModule] = await Promise.all([
            import('../../lib/supabase-storage'),
          ])
          
          // Warm up the cache
          recordsModule.SupabaseStorage.getRecords()
        } catch (error) {
          console.warn('Failed to prefetch dashboard data:', error)
        }
      }

      prefetchUserData()
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}