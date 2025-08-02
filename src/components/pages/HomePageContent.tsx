/**
 * @document-ref NEXTJS_PATTERNS.md#client-server-boundary
 * @design-ref DESIGN_SYSTEM.md#component-patterns
 * @compliance-check 2025-08-02 - Client Component 분리 완료
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Coffee, TrendingUp, Award } from 'lucide-react'

import AuthModal from '../auth/AuthModal'
import Navigation from '../Navigation'
import RecentCoffeePreview from '../RecentCoffeePreview'
import SupabaseTest from '../SupabaseTest'
import { useAuth } from '../../contexts/AuthContext'
import { OptimizedLayout, OptimizedHero } from '../performance/OptimizedLayout'
import CoreWebVitalsOptimizer from '../performance/CoreWebVitalsOptimizer'
import { StatsGridSkeleton } from '../SkeletonLoader'
import GuestModeIndicator from '../GuestModeIndicator'
import FeedbackButton from '../FeedbackButton'
import CoffeeTip from '../CoffeeTip'
import CoffeeJourneyWidget from '../CoffeeJourneyWidget'

export default function HomePageContent() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [stats, setStats] = useState({ totalRecords: 0, averageRating: 0, achievements: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  // 온보딩 체크
  useEffect(() => {
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
        const { SupabaseStorage } = await import('../../lib/supabase-storage')
        const { offlineStorage } = await import('../../lib/offline-storage')
        
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
          console.error('Offline storage load failed:', error)
        }
        
        // 통계 계산
        if (allRecords.length > 0) {
          const totalRecords = allRecords.length
          const ratingsSum = allRecords.reduce((sum, record) => {
            if (record.overallRating && typeof record.overallRating === 'number') {
              return sum + record.overallRating
            }
            return sum
          }, 0)
          const ratingsCount = allRecords.filter(record => 
            record.overallRating && typeof record.overallRating === 'number'
          ).length
          
          const averageRating = ratingsCount > 0 ? 
            Number((ratingsSum / ratingsCount).toFixed(1)) : 0
          
          // 업적 수 계산 (임시)
          let achievements = 0
          if (totalRecords >= 1) achievements++
          if (totalRecords >= 5) achievements++
          if (totalRecords >= 10) achievements++
          if (averageRating >= 4.0) achievements++
          
          setStats({
            totalRecords,
            averageRating,
            achievements
          })
        } else {
          setStats({ totalRecords: 0, averageRating: 0, achievements: 0 })
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
        setStats({ totalRecords: 0, averageRating: 0, achievements: 0 })
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [user])

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleViewRecord = () => {
    router.push('/my-records')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
      </div>
    )
  }

  return (
    <OptimizedLayout>
      <CoreWebVitalsOptimizer />
      
      {/* Hero Section */}
      <OptimizedHero className="px-4 pt-8 pb-12 text-center">
        <div className="max-w-md mx-auto space-y-8">
          {/* 앱 로고 & 타이틀 */}
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent-warm to-neutral-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">CupNote</h1>
              <p className="text-neutral-600 text-lg leading-relaxed">
                누구나 전문가처럼,<br />
                그러나 자기만의 방식으로
              </p>
            </div>
          </div>

          {/* 상태별 콘텐츠 */}
          {user ? (
            // 로그인된 사용자
            <div className="space-y-6">
              {/* 사용자 인사 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-semibold text-neutral-800 mb-3">
                  안녕하세요, {user.username}님! ☕
                </h2>
                <CoffeeTip />
              </div>

              {/* 커피 여정 위젯 */}
              <CoffeeJourneyWidget />

              {/* 빠른 통계 */}
              {statsLoading ? (
                <StatsGridSkeleton />
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-100">
                    <div className="text-2xl font-bold text-neutral-800">{stats.totalRecords}</div>
                    <div className="text-sm text-neutral-600">기록</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-100">
                    <div className="text-2xl font-bold text-neutral-800">{stats.averageRating}</div>
                    <div className="text-sm text-neutral-600">평균 평점</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-100">
                    <div className="text-2xl font-bold text-neutral-800">{stats.achievements}</div>
                    <div className="text-sm text-neutral-600">업적</div>
                  </div>
                </div>
              )}

              {/* 최근 기록 미리보기 */}
              <RecentCoffeePreview onViewRecord={handleViewRecord} />

              {/* 빠른 액션 버튼들 */}
              <div className="space-y-3">
                <Link 
                  href="/record/mode-selection" 
                  className="w-full bg-accent-warm text-white py-4 rounded-xl font-semibold hover:bg-neutral-600 transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Coffee className="h-5 w-5" />
                  <span>새 커피 기록하기</span>
                </Link>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="/my-records" 
                    className="bg-white/80 backdrop-blur-sm text-neutral-700 py-3 rounded-xl font-medium hover:bg-white transition-colors border border-neutral-200 flex items-center justify-center space-x-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>내 기록</span>
                  </Link>
                  <Link 
                    href="/achievements" 
                    className="bg-white/80 backdrop-blur-sm text-neutral-700 py-3 rounded-xl font-medium hover:bg-white transition-colors border border-neutral-200 flex items-center justify-center space-x-2"
                  >
                    <Award className="h-4 w-4" />
                    <span>업적</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // 비로그인 사용자
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-neutral-600 leading-relaxed">
                  커피 경험을 기록하고, 나만의 맛 언어를 발견하세요
                </p>
                
                {/* CTA 버튼들 */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full bg-accent-warm text-white py-4 rounded-xl font-semibold hover:bg-neutral-600 transition-colors shadow-sm"
                  >
                    무료로 시작하기
                  </button>
                  
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="w-full bg-white/80 backdrop-blur-sm text-neutral-700 py-4 rounded-xl font-medium hover:bg-white transition-colors border border-neutral-200 flex items-center justify-center space-x-2"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>로그인</span>
                  </button>
                </div>
              </div>

              <GuestModeIndicator />
            </div>
          )}
        </div>
      </OptimizedHero>

      {/* 네비게이션 */}
      <Navigation />

      {/* 인증 모달 */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      {/* 베타 피드백 버튼 */}
      <FeedbackButton />

      {/* 개발용 컴포넌트 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <SupabaseTest />
        </div>
      )}
    </OptimizedLayout>
  )
}