/**
 * 홈페이지 컨트롤러 - Clean Architecture
 * 사용자 상태에 따른 적절한 컴포넌트 렌더링
 */
'use client'

import { memo, useState, useEffect } from 'react'

import { useAuth } from '../../contexts/AuthContext'
import Navigation from '../Navigation'
import OnboardingFlow from '../onboarding/OnboardingFlow'
import PageLayout from '../ui/PageLayout'
import LandingPageContent from './LandingPageContent'
import UserDashboardContent from './UserDashboardContent'

const HybridHomePageContent = memo(function HybridHomePageContent() {
  const { user } = useAuth()
  const [recentRecords, setRecentRecords] = useState([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, avgRating: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // 온보딩 상태 확인
    const hasCompletedOnboarding = localStorage.getItem('cupnote-onboarding-completed')
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000)
      return () => clearTimeout(timer)
    }

    // 사용자 데이터 로드 - Supabase에서만 가져오기
    if (user) {
      const loadData = async () => {
        try {
          const { SupabaseStorage } = await import('../../lib/supabase-storage')
          const records = await SupabaseStorage.getRecords()
          
          if (records && records.length > 0) {
            setRecentRecords(records.slice(0, 3)) // 최근 3개
            
            // 통계 계산
            const now = new Date()
            const thisMonth = records.filter(r => {
              const recordDate = new Date(r.date)
              return recordDate.getMonth() === now.getMonth() && 
                     recordDate.getFullYear() === now.getFullYear()
            }).length
            
            const avgRating = records.reduce((sum, r) => sum + (r.overall || 0), 0) / records.length
            
            setStats({ total: records.length, thisMonth, avgRating })
          } else {
            // 기록이 없으면 빈 상태로 설정
            setRecentRecords([])
            setStats({ total: 0, thisMonth: 0, avgRating: 0 })
          }
        } catch (error) {
          console.error('Failed to load data:', error)
          // 에러 시에도 빈 상태로 설정
          setRecentRecords([])
          setStats({ total: 0, thisMonth: 0, avgRating: 0 })
        }
      }

      loadData()
    } else {
      setRecentRecords([])
      setStats({ total: 0, thisMonth: 0, avgRating: 0 })
    }
  }, [user])

  return (
    <>
      <Navigation showBackButton={false} currentPage="home" />
      
      <PageLayout showHeader={false}>
        {/* 온보딩 플로우 */}
        {showOnboarding && (
          <OnboardingFlow
            onComplete={() => setShowOnboarding(false)}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
        
        {/* 사용자 상태에 따른 컴포넌트 렌더링 */}
        {user ? (
          <UserDashboardContent 
            user={user}
            stats={stats}
            recentRecords={recentRecords}
          />
        ) : (
          <LandingPageContent />
        )}
      </PageLayout>
    </>
  )
})

export default HybridHomePageContent