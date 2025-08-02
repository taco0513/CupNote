'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { LogIn, Coffee, TrendingUp, Award } from 'lucide-react'

import AuthModal from '../components/auth/AuthModal'
import Navigation from '../components/Navigation'
import RecentCoffeePreview from '../components/RecentCoffeePreview'
import SupabaseTest from '../components/SupabaseTest'
import { useAuth } from '../contexts/AuthContext'
import { OptimizedLayout, OptimizedHero } from '../components/performance/OptimizedLayout'
import CoreWebVitalsOptimizer from '../components/performance/CoreWebVitalsOptimizer'
import { StatsGridSkeleton } from '../components/SkeletonLoader'
import GuestModeIndicator from '../components/GuestModeIndicator'
import FeedbackButton from '../components/FeedbackButton'
import CoffeeTip from '../components/CoffeeTip'
import CoffeeJourneyWidget from '../components/CoffeeJourneyWidget'


export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [stats, setStats] = useState({ totalRecords: 0, averageRating: 0, achievements: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [hasGuestRecords, setHasGuestRecords] = useState(false)

  useEffect(() => {
    // 온보딩 완료 여부 체크
    const onboardingCompleted = localStorage.getItem('cupnote-onboarding-completed')

    if (!onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [router])

  // 통계 데이터 로드
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true)
        // 통합 저장소에서 데이터 로드
        const { SupabaseStorage } = await import('../lib/supabase-storage')
        const { offlineStorage } = await import('../lib/offline-storage')
        
        let allRecords: any[] = []
        
        // Supabase에서 로드 (로그인된 경우)
        try {
          const supabaseRecords = await SupabaseStorage.getRecords()
          if (supabaseRecords) {
            allRecords = [...allRecords, ...supabaseRecords]
          }
        } catch (error) {
          console.log('Supabase load failed (expected if not logged in)')
        }
        
        // IndexedDB에서 로드 (게스트 모드)
        try {
          const offlineRecords = await offlineStorage.getRecords(user?.id || 'guest')
          if (offlineRecords) {
            // 중복 제거
            const existingIds = new Set(allRecords.map(r => r.id))
            const uniqueOfflineRecords = offlineRecords.filter(r => !existingIds.has(r.id))
            allRecords = [...allRecords, ...uniqueOfflineRecords]
          }
        } catch (error) {
          console.log('IndexedDB load failed')
        }
        
        // 게스트 기록 확인
        if (!user) {
          const guestUserId = localStorage.getItem('cupnote-guest-id')
          if (guestUserId) {
            try {
              const guestRecords = await offlineStorage.getRecords(guestUserId)
              if (guestRecords && guestRecords.length > 0) {
                setHasGuestRecords(true)
              }
            } catch (error) {
              console.log('Failed to check guest records')
            }
          }
        }
        
        // 통계 계산
        const totalRecords = allRecords.length
        const averageRating = totalRecords > 0 
          ? allRecords.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRecords 
          : 0
        
        // 성취 개수 가져오기
        let achievementCount = 0
        if (user) {
          try {
            const { AchievementService } = await import('../lib/supabase-service')
            const userAchievements = await AchievementService.getUserAchievements()
            achievementCount = userAchievements?.length || 0
          } catch (error) {
            console.log('Failed to load achievements')
          }
        }
        
        setStats({
          totalRecords,
          averageRating: Math.round(averageRating * 10) / 10,
          achievements: achievementCount
        })
        
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [user]) // user가 변경될 때마다 다시 로드

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // 인증 성공 시 페이지 새로고침 또는 상태 업데이트
    window.location.reload()
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neutral-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">로딩 중...</p>
        </div>
      </div>
    )
  }
  return (
    <>
      <CoreWebVitalsOptimizer />
      <OptimizedLayout showNavigation={false} critical={true}>
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl pb-20 md:pb-8">
          <Navigation currentPage="home" />

        {user ? (
          // 로그인된 사용자를 위한 대시보드
          <>
            {/* 커피 팁 위젯 */}
            <div className="mb-6">
              <CoffeeTip />
            </div>

            {/* 사용자 환영 메시지 - 더 간결하게 */}
            <section className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
                안녕하세요, {user.username}님! ☕
              </h1>
              <p className="text-neutral-600">
                오늘은 어떤 커피를 마셨나요?
              </p>
            </section>

            {/* 커피 여정 위젯으로 대체 */}
            <div className="mb-8">
              <CoffeeJourneyWidget 
                stats={{
                  totalCoffees: stats.totalRecords,
                  averageRating: stats.averageRating,
                  currentStreak: 0, // TODO: 실제 연속 기록 계산
                  journeyDays: stats.totalRecords > 0 ? Math.max(1, Math.floor(stats.totalRecords / 2)) : 0 // 추정값 사용
                }}
              />
            </div>

            {/* 최근 기록 섹션 */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4 md:mb-6">
                최근 커피 기록
              </h2>
              <RecentCoffeePreview />
            </section>
          </>
        ) : (
          // 비로그인 사용자를 위한 랜딩 페이지
          <>
            {/* 게스트 모드 배너 - 게스트 기록이 있을 때만 표시 */}
            {hasGuestRecords && (
              <GuestModeIndicator 
                variant="banner" 
                onLoginClick={() => openAuthModal('login')}
                className="mb-6"
              />
            )}
            
            {/* 히어로 섹션 - 최적화됨 */}
            <OptimizedHero
              title="☕ CupNote"
              subtitle="누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간"
            >

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full sm:w-auto bg-neutral-600 text-white px-8 py-4 rounded-full hover:bg-neutral-700 transition-colors text-lg font-medium"
                >
                  지금 시작하기
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full sm:w-auto flex items-center justify-center border-2 border-neutral-600 text-neutral-600 px-8 py-4 rounded-full hover:bg-neutral-50 transition-colors text-lg font-medium"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  로그인
                </button>
              </div>
            </OptimizedHero>

            {/* 기능 소개 섹션 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-neutral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">쉬운 기록</h3>
                <p className="text-neutral-600">
                  직관적인 인터페이스로 누구나 쉽게 커피 경험을 기록할 수 있어요
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">성장 추적</h3>
                <p className="text-neutral-600">
                  Match Score로 커피 감각의 발달 과정을 시각적으로 확인하세요
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">성취 시스템</h3>
                <p className="text-neutral-600">
                  다양한 성취를 달성하며 커피 여정을 더욱 재미있게 만들어요
                </p>
              </div>
            </section>

            {/* 데모 섹션 */}
            <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
                무료로 시작해보세요
              </h2>
              <p className="text-neutral-600 mb-6">
                회원가입 후 바로 커피 기록을 시작할 수 있습니다
              </p>
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-neutral-600 text-white px-8 py-3 rounded-full hover:bg-neutral-700 transition-colors text-lg font-medium"
              >
                계정 만들기
              </button>
            </section>
          </>
        )}

        {/* Supabase 연결 테스트 (개발용) */}
        {process.env.NODE_ENV === 'development' && <SupabaseTest />}
        </div>
      </OptimizedLayout>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Beta Feedback Button - 모든 사용자에게 표시 */}
      <FeedbackButton />
    </>
  )
}
