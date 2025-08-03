/**
 * Optimized Home Page Content with performance improvements
 */
'use client'

import { memo, lazy, Suspense, useState, useEffect } from 'react'

import Link from 'next/link'

import { Coffee, TrendingUp, Users, Target, Clock, Calendar, Award, ChevronRight } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { prefersReducedMotion } from '../../utils/accessibility'
import OnboardingFlow from '../onboarding/OnboardingFlow'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import FirstTimeGuide from '../ui/FirstTimeGuide'
import UnifiedButton from '../ui/UnifiedButton'

// Lazy load non-critical components
const CoffeeTip = lazy(() => import('../home/CoffeeTip'))
const RotatingCoffeeFact = lazy(() => import('../home/RotatingCoffeeFact'))
const CoffeeJourneyWidget = lazy(() => import('../home/CoffeeJourneyWidget'))

const HomePageContent = memo(function HomePageContent() {
  const reducedMotion = prefersReducedMotion()
  const { user } = useAuth()
  const [recentRecords, setRecentRecords] = useState([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, avgRating: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // 온보딩 상태 확인
    const hasCompletedOnboarding = localStorage.getItem('cupnote-onboarding-completed')
    if (!hasCompletedOnboarding && !user) {
      // 신규 방문자이고 비로그인 상태라면 온보딩 표시
      const timer = setTimeout(() => setShowOnboarding(true), 1000) // 1초 후 표시
      return () => clearTimeout(timer)
    }

    // 최근 기록 및 통계 로드 - 로그인된 사용자만
    if (user) {
      const loadData = () => {
        try {
          const stored = localStorage.getItem('coffeeRecords')
          if (stored) {
            const records = JSON.parse(stored)
            setRecentRecords(records.slice(0, 3))
            
            // 통계 계산
            const now = new Date()
            const thisMonth = records.filter(r => {
              const recordDate = new Date(r.date)
              return recordDate.getMonth() === now.getMonth() && 
                     recordDate.getFullYear() === now.getFullYear()
            }).length
            
            const avgRating = records.length > 0
              ? records.reduce((sum, r) => sum + (r.overall || 0), 0) / records.length
              : 0
            
            setStats({ total: records.length, thisMonth, avgRating })
          }
        } catch (error) {
          console.error('Failed to load data:', error)
        }
      }

      loadData()
    } else {
      // 비로그인 상태에서는 데이터 초기화
      setRecentRecords([])
      setStats({ total: 0, thisMonth: 0, avgRating: 0 })
    }
  }, [user])

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* 온보딩 플로우 */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome message for new users */}
        {!user && (
          <header className="text-center mb-8" role="banner">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">환영합니다!</h1>
            <p className="text-neutral-600">
              누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록해보세요
            </p>
          </header>
        )}

        {/* 커피 여정 위젯 - 실제 데이터가 있을 때만 표시 */}
        {user && stats.total > 0 && (
          <Suspense fallback={null}>
            <CoffeeJourneyWidget stats={stats} />
          </Suspense>
        )}

        {/* 첫 사용자 가이드 - 로그인했지만 기록이 없을 때 */}
        {user && stats.total === 0 && (
          <FirstTimeGuide />
        )}

        {/* Quick Actions - Critical interactive elements */}
        <nav className="max-w-md mx-auto space-y-4 mb-8" role="navigation" aria-label="주요 기능">
          <Link href="/mode-selection">
            <UnifiedButton
              variant="primary"
              size="large"
              fullWidth
              className="text-lg primary-cta button-ripple"
            >
              <Coffee className="h-5 w-5 mr-2" />
              새 커피 기록하기
            </UnifiedButton>
          </Link>
          
          <div className="grid grid-cols-3 gap-4" role="list">
            <Link href="/my-records">
              <Card variant="bordered" hover className="h-full">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2" aria-hidden="true">📋</div>
                  <div className="text-sm font-medium text-neutral-700">기록</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/my-records?tab=stats">
              <Card variant="bordered" hover className="h-full">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2" aria-hidden="true">📊</div>
                  <div className="text-sm font-medium text-neutral-700">통계</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/search">
              <Card variant="bordered" hover className="h-full">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2" aria-hidden="true">🔍</div>
                  <div className="text-sm font-medium text-neutral-700">검색</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </nav>

        {/* 통계 카드 */}
        {user && stats.total > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <Card variant="elevated">
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-accent-warm">{stats.total}</div>
                    <div className="text-sm text-neutral-600">총 기록</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-warm">{stats.thisMonth}</div>
                    <div className="text-sm text-neutral-600">이번 달</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-warm">{stats.avgRating.toFixed(1)}</div>
                    <div className="text-sm text-neutral-600">평균 평점</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 최근 기록 */}
        {user && recentRecords.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">최근 기록</h2>
            <div className="space-y-3">
              {recentRecords.map((record, index) => (
                <Link key={record.id || index} href={`/coffee/${record.id}`}>
                  <Card variant="bordered" hover>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-neutral-800">{record.coffeeName}</h3>
                          <p className="text-sm text-neutral-600">{record.roaster || record.location}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coffee Facts & Tips */}
        <div className="max-w-md mx-auto space-y-4">
          <Suspense fallback={
            <Card variant="default" className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-100 rounded w-full"></div>
              </CardContent>
            </Card>
          }>
            <RotatingCoffeeFact />
          </Suspense>

          <Suspense fallback={
            <Card variant="default" className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-100 rounded w-full"></div>
              </CardContent>
            </Card>
          }>
            <CoffeeTip />
          </Suspense>
        </div>

        {/* 디자인 샘플 링크 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-md mx-auto mt-8 mb-8">
            <Card variant="bordered" className="border-amber-200 bg-gradient-to-r from-amber-50 to-coffee-50">
              <CardContent className="text-center p-4">
                <h3 className="text-lg font-semibold text-coffee-800 mb-1 flex items-center justify-center space-x-2">
                  <span>🎨 디자인 샘플</span>
                  <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">NEW</span>
                </h3>
                <p className="text-coffee-600 text-sm mb-1">4가지 디자인 방향성을 체험해보세요</p>
                <p className="text-amber-600 text-xs font-medium mb-4">⭐ 하이브리드 버전 추가!</p>
                <Link href="/design-samples">
                  <UnifiedButton variant="secondary" size="medium" className="bg-coffee-500 hover:bg-coffee-600 text-white">
                    디자인 샘플 보기
                  </UnifiedButton>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CupNote 소개 */}
        <div className="max-w-md mx-auto mt-12 mb-8">
          <Card variant="default">
            <CardContent className="text-center p-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-3">CupNote는 이런 사람들을 위해 만들어졌어요</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-warm/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-warm text-xs">✓</span>
                  </div>
                  <p className="text-neutral-700 text-sm">커피를 좋아하지만 전문 용어가 어려운 분들</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-warm/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-warm text-xs">✓</span>
                  </div>
                  <p className="text-neutral-700 text-sm">나만의 커피 취향을 찾아가고 싶은 분들</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-warm/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-warm text-xs">✓</span>
                  </div>
                  <p className="text-neutral-700 text-sm">홈카페에서 레시피를 기록하고 싶은 분들</p>
                </div>
              </div>
              {!user && (
                <Link href="/auth">
                  <UnifiedButton variant="primary" size="medium" className="mt-6">
                    지금 시작하기
                  </UnifiedButton>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
})

export default HomePageContent