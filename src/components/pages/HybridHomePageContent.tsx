/**
 * 하이브리드 홈페이지 - 미니멀 + 프리미엄 조합
 * Simple Elegance - 디자인팀 추천 MVP 버전
 */
'use client'

import { memo, lazy, Suspense, useState, useEffect } from 'react'

import Link from 'next/link'

import { Coffee, Star, Award, ChevronRight, Sparkles } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import Navigation from '../Navigation'
import OnboardingFlow from '../onboarding/OnboardingFlow'
import { Card, CardContent } from '../ui/Card'
import PageLayout from '../ui/PageLayout'
import UnifiedButton from '../ui/UnifiedButton'

// Lazy load non-critical components
const CoffeeTip = lazy(() => import('../home/CoffeeTip'))

const HybridHomePageContent = memo(function HybridHomePageContent() {
  const { user } = useAuth()
  const [recentRecords, setRecentRecords] = useState([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, avgRating: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // 온보딩 상태 확인
    const hasCompletedOnboarding = localStorage.getItem('cupnote-onboarding-completed')
    if (!hasCompletedOnboarding && !user) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000)
      return () => clearTimeout(timer)
    }

    // 데이터 로드 - 로그인된 사용자만
    if (user) {
      const loadData = () => {
        try {
          const stored = localStorage.getItem('coffeeRecords')
          if (stored) {
            const records = JSON.parse(stored)
            setRecentRecords(records.slice(0, 1)) // 하나만 표시
            
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
        
        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:items-start">
        

        {/* Premium Main Action with Minimal Design */}
        <div className="mb-12 md:col-span-2 lg:col-span-3">
          <div className="max-w-md mx-auto">
            <Link href="/mode-selection">
              <button className="w-full h-18 bg-white/90 backdrop-blur-sm border border-coffee-200/50 
                               rounded-2xl shadow-lg hover:shadow-xl text-coffee-800 text-lg font-semibold
                               hover:scale-102 transition-all duration-200 group relative overflow-hidden">
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-coffee-400/5 to-coffee-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center space-x-3 py-4">
                <div className="w-10 h-10 bg-coffee-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Coffee className="h-5 w-5 text-white" />
                </div>
                <span>새 커피 기록하기</span>
              </div>
            </button>
          </Link>
          </div>
        </div>

        {/* 로그인 사용자 전용 섹션 */}
        {user && (
          <>
            {/* Clean Stats with Subtle Premium Touch */}
            {stats.total > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-coffee-100/50 shadow-sm">
                    <div className="text-2xl font-bold text-coffee-700 mb-1">{stats.thisMonth}</div>
                    <div className="text-xs text-coffee-600">이번 달</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-coffee-100/50 shadow-sm">
                    <div className="text-2xl font-bold text-coffee-700 mb-1">{stats.total}</div>
                    <div className="text-xs text-coffee-600">총 기록</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-coffee-100/50 shadow-sm">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span className="text-2xl font-bold text-coffee-700">{stats.avgRating.toFixed(1)}</span>
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                    </div>
                    <div className="text-xs text-coffee-600">평균 평점</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Record - Minimal with Premium Feel */}
            {recentRecords.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold text-coffee-800 mb-4">최근 기록</h3>
                <Link href={`/coffee/${recentRecords[0].id}`}>
                  <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-coffee-800">{recentRecords[0].coffeeName}</h4>
                          {recentRecords[0].overall && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-amber-400 fill-current" />
                              <span className="text-sm font-medium text-coffee-700">{recentRecords[0].overall}</span>
                            </div>
                          )}
                          <ChevronRight className="h-4 w-4 text-coffee-400" />
                        </div>
                        <p className="text-coffee-600 text-sm leading-relaxed mb-2">
                          {recentRecords[0].notes || '커피 기록을 확인해보세요'}
                        </p>
                        <div className="text-xs text-coffee-500">
                          {recentRecords[0].roaster || recentRecords[0].location} • {new Date(recentRecords[0].date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Achievement for users with records */}
            {stats.total > 0 && (
              <div className="mb-12">
                <div className="bg-gradient-to-r from-coffee-100/80 to-amber-50/80 backdrop-blur-sm rounded-2xl p-4 border border-coffee-200/30 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-coffee-800">커피 여정 {stats.total}일째!</h4>
                      <p className="text-coffee-600 text-sm">새로운 성취를 달성했어요 ✨</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* First Time Guide for users with no records */}
            {stats.total === 0 && (
              <div className="mb-12">
                <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-6 shadow-md text-center">
                  <div className="w-16 h-16 mx-auto bg-coffee-100 rounded-full flex items-center justify-center mb-4">
                    <Coffee className="h-8 w-8 text-coffee-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-coffee-800 mb-2">첫 번째 커피를 기록해보세요!</h3>
                  <p className="text-coffee-600 text-sm mb-4">
                    간단한 기록부터 시작해보세요. 전문 용어 없이도 충분합니다.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-coffee-500 text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>첫 기록 작성 시 특별한 뱃지를 받을 수 있어요</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 비로그인 사용자용 Quick Actions */}
        {!user && (
          <div className="grid grid-cols-2 gap-4 mb-12">
            <Link href="/my-records">
              <div className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-4 text-center hover:bg-white/90 hover:shadow-md transition-all duration-200">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium text-coffee-700">기록 보기</div>
              </div>
            </Link>
            
            <Link href="/search">
              <div className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-4 text-center hover:bg-white/90 hover:shadow-md transition-all duration-200">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-medium text-coffee-700">커피 탐색</div>
              </div>
            </Link>
          </div>
        )}

        {/* Coffee Tips - Lazy loaded */}
        <div className="mb-8">
          <Suspense fallback={
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-coffee-200/30 p-4 animate-pulse">
              <div className="h-4 bg-coffee-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-coffee-100 rounded w-full"></div>
            </div>
          }>
            <CoffeeTip />
          </Suspense>
        </div>

        {/* CupNote 소개 - 비로그인 사용자용 */}
        {!user && (
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-coffee-800 mb-4 text-center">CupNote는 이런 분들을 위해</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-coffee-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-coffee-600 text-xs">✓</span>
                  </div>
                  <p className="text-coffee-700 text-sm">커피를 좋아하지만 전문 용어가 어려운 분들</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-coffee-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-coffee-600 text-xs">✓</span>
                  </div>
                  <p className="text-coffee-700 text-sm">나만의 커피 취향을 찾아가고 싶은 분들</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-coffee-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-coffee-600 text-xs">✓</span>
                  </div>
                  <p className="text-coffee-700 text-sm">홈카페에서 레시피를 기록하고 싶은 분들</p>
                </div>
              </div>
              <div className="text-center mt-6">
                <Link href="/auth">
                  <UnifiedButton variant="primary" size="medium" className="bg-coffee-500 hover:bg-coffee-600">
                    지금 시작하기
                  </UnifiedButton>
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </PageLayout>
    </>
  )
})

export default HybridHomePageContent