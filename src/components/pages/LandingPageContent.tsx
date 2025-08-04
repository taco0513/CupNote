/**
 * 랜딩 페이지 - 비로그인 사용자용
 * Simple & Clean Landing Page
 */
'use client'

import { memo, useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Target, BarChart3 } from 'lucide-react'

// Lazy import for performance
const AppStatsService = () => import('../../lib/supabase-service').then(m => m.AppStatsService)
import { Card, CardContent } from '../ui/Card'
import FluidText from '../ui/FluidText'
import UnifiedButton from '../ui/UnifiedButton'

const LandingPageContent = memo(function LandingPageContent() {
  const [appStats, setAppStats] = useState({ totalUsers: 0, activeToday: 0, totalRecords: 0, isBeta: true })

  useEffect(() => {
    const fetchAppStats = async () => {
      try {
        const service = await AppStatsService()
        const stats = await service.getRealStats()
        setAppStats(stats)
      } catch (error) {
        console.warn('Failed to load app stats:', error)
        // Fallback to default values
      }
    }
    
    // Delay stats loading to prioritize UI rendering
    setTimeout(fetchAppStats, 100)
  }, [])

  return (
    <div className="mb-12 md:mb-20">
      {/* 데스크탑용 히어로 레이아웃 (1024px+) */}
      <div className="hidden lg:block">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-coffee-50/50 via-transparent to-transparent h-[600px]"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 pt-12">
            {/* 메인 히어로 */}
            <div className="text-center mb-20">
              {/* BETA 배지 */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                <span className="font-bold">BETA</span>
                <span className="text-purple-600">• 커피 기록의 새로운 시작</span>
              </div>
              
              {/* 타이틀 */}
              <FluidText 
                as="h1" 
                size="hero" 
                weight="bold" 
                align="center"
                className="mb-6" 
                balance
                data-testid="homepage-hero-title"
              >
                <span className="block text-5xl text-coffee-800">매일 마시는 커피,</span>
                <span className="block text-6xl font-bold bg-gradient-to-r from-coffee-600 to-amber-600 bg-clip-text text-transparent mt-2">
                  특별한 이야기가 되다
                </span>
              </FluidText>
              
              {/* 서브타이틀 */}
              <FluidText 
                as="p" 
                size="xl"
                color="secondary" 
                align="center"
                className="max-w-3xl mx-auto mb-6" 
                lineHeight="relaxed"
              >
                2분 기록, 30초 분석, 평생 남는 나만의 커피 데이터베이스
              </FluidText>
              
              {/* 베타 참여자 표시 */}
              <div className="flex items-center justify-center gap-3 mb-10">
                <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  BETA
                </div>
                <p className="text-sm text-coffee-600">
                  {appStats.totalUsers > 0 ? (
                    <><strong className="text-coffee-800">{appStats.totalUsers}명</strong>의 베타 테스터가 함께하고 있어요</>
                  ) : (
                    '베타 테스트 참여자 모집 중'
                  )}
                </p>
              </div>

              {/* CTA 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <UnifiedButton 
                    size="lg" 
                    className="w-full sm:w-auto min-w-[200px]"
                    data-testid="homepage-cta-primary"
                  >
                    무료로 시작하기 →
                  </UnifiedButton>
                </Link>
                <Link href="/demo">
                  <UnifiedButton 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto min-w-[200px]"
                    data-testid="homepage-cta-secondary"
                  >
                    먼저 둘러보기
                  </UnifiedButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 태블릿용 히어로 (768px-1023px) */}
      <div className="hidden md:block lg:hidden">
        <div className="max-w-4xl mx-auto px-6 pt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" />
            <span className="font-bold">BETA</span>
            <span>무료 베타 테스트 중</span>
          </div>
          
          <FluidText as="h1" size="hero" weight="bold" align="center" className="mb-4">
            <span className="block text-3xl text-coffee-800">오늘 마신 커피,</span>
            <span className="block text-4xl font-bold bg-gradient-to-r from-coffee-600 to-amber-600 bg-clip-text text-transparent mt-1">
              잊지 않고 기록하세요
            </span>
          </FluidText>
          
          <p className="text-lg text-coffee-600 mb-6 max-w-2xl mx-auto">
            간단한 기록으로 시작하는 나만의 커피 데이터베이스
          </p>
          
          <div className="text-center mb-8">
            <p className="text-sm text-coffee-600">
              {appStats.totalUsers > 0 ? (
                <><strong>{appStats.totalUsers}명</strong>의 베타 테스터가 함께하고 있어요</>
              ) : (
                '베타 테스트 참여자 모집 중'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <UnifiedButton size="md" className="w-full sm:w-auto min-w-[180px]">
                무료로 시작하기 →
              </UnifiedButton>
            </Link>
            <Link href="/demo">
              <UnifiedButton variant="outline" size="md" className="w-full sm:w-auto min-w-[180px]">
                먼저 둘러보기
              </UnifiedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 모바일용 히어로 (768px 미만) */}
      <div className="block md:hidden">
        <div className="px-4 pt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" />
            <span className="font-bold">BETA</span>
            <span>무료 베타 테스트 중</span>
          </div>
          
          <FluidText as="h1" size="hero" weight="bold" align="center" className="mb-4">
            <span className="block text-2xl text-coffee-800">커피 일기,</span>
            <span className="block text-3xl font-bold bg-gradient-to-r from-coffee-600 to-amber-600 bg-clip-text text-transparent mt-1">
              2분이면 충분해요
            </span>
          </FluidText>
          
          <p className="text-base text-coffee-600 mb-6">
            쉽고 빠른 커피 경험 기록
          </p>
          
          <div className="text-center mb-6">
            <p className="text-sm text-coffee-600">
              {appStats.totalUsers > 0 ? (
                <><strong>{appStats.totalUsers}명</strong>의 베타 테스터가 함께하고 있어요</>
              ) : (
                '베타 테스트 참여자 모집 중'
              )}
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth" className="block">
              <UnifiedButton size="md" className="w-full">
                무료로 시작하기 →
              </UnifiedButton>
            </Link>
            <Link href="/demo" className="block">
              <UnifiedButton variant="outline" size="md" className="w-full">
                먼저 둘러보기
              </UnifiedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 주요 기능 카드들 */}
      <div className="mt-16 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Card className="bg-white/90 backdrop-blur-sm border-coffee-200/30 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">주요 기능</h3>
              <p className="text-sm text-coffee-600">무엇을 할 수 있나요?</p>
              <ul className="mt-3 text-xs text-coffee-600 space-y-1 text-left">
                <li>• 2-Mode 전문화된 기록 시스템</li>
                <li>• 나만의 언어로 맛 표현</li>
                <li>• 성장 과정 시각화</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-coffee-100 to-amber-50 border-coffee-300/40 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">시작하기</h3>
              <p className="text-sm text-coffee-600">회원가입 / 로그인</p>
              <div className="mt-3">
                <Link href="/auth">
                  <UnifiedButton size="sm" className="w-full">
                    시작하기
                  </UnifiedButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PWA 설치 안내 섹션 */}
        <Card className="bg-gradient-to-r from-amber-50 to-coffee-50 border-amber-200/40 mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-3">CupNote는 이런 분들을 위해</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-coffee-600 flex-shrink-0" />
                  <span className="text-coffee-700">커피 맛을 정확히 기억하고 싶은 분</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-coffee-600 flex-shrink-0" />
                  <span className="text-coffee-700">커피 취향 변화를 추적하고 싶은 분</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-coffee-600 flex-shrink-0" />
                  <span className="text-coffee-700">커피 여행을 기록하고 공유하고 싶은 분</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default LandingPageContent