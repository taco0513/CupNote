/**
 * 홈페이지 컨트롤러 - 하이브리드 디자인 시스템
 * 기존 시스템 기반 로그인/비로그인 분기
 */
'use client'

import { memo, useState, useEffect } from 'react'

import { useAuth } from '../../contexts/AuthContext'
import OnboardingFlow from '../onboarding/OnboardingFlow'
import LandingPageContent from './LandingPageContent'
import UserDashboardContent from './UserDashboardContent'

interface HomeStats {
  total: number
  thisMonth: number
  avgRating: number
}

interface RecentRecord {
  id: string
  coffeeName: string
  roastery: string
  overall: number
  date: string
  mode: string
}

const HybridHomePageContent = memo(function HybridHomePageContent() {
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [stats, setStats] = useState<HomeStats>({ total: 0, thisMonth: 0, avgRating: 0 })
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 온보딩 상태 확인
    const hasCompletedOnboarding = localStorage.getItem('cupnote-onboarding-completed')
    if (!hasCompletedOnboarding && !user) {
      const timer = setTimeout(() => setShowOnboarding(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const { SupabaseStorage } = await import('../../lib/supabase-storage')
      const records = await SupabaseStorage.getRecords()
      
      if (records && records.length > 0) {
        // 최근 기록
        setRecentRecords(records.slice(0, 3))
        
        // 통계 계산
        const now = new Date()
        const thisMonth = records.filter(r => {
          const recordDate = new Date(r.date)
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear()
        }).length
        
        const avgRating = records.reduce((sum, r) => sum + (r.overall || 0), 0) / records.length
        setStats({ total: records.length, thisMonth, avgRating })
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 온보딩 플로우 */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
      
      {/* 콘텐츠 분기 */}
      {user ? (
        <UserDashboardContent 
          user={user}
          stats={stats}
          recentRecords={recentRecords}
        />
      ) : (
        <LandingPageContent />
      )}
    </>
  )
})

export default HybridHomePageContent