/**
 * 하이브리드 홈페이지 - 미니멀 + 프리미엄 조합
 * Simple Elegance - 디자인팀 추천 MVP 버전
 */
'use client'

import { memo, lazy, Suspense, useState, useEffect } from 'react'

import Link from 'next/link'

import { Coffee, Star, Award, ChevronRight, Sparkles, Target, BarChart3, Trophy, Home, Plus } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import Navigation from '../Navigation'
import OnboardingFlow from '../onboarding/OnboardingFlow'
import { AppStatsService } from '../../lib/supabase-service'
import { Card, CardContent } from '../ui/Card'
import FluidText from '../ui/FluidText'
import FluidContainer from '../ui/FluidContainer'
import PageLayout from '../ui/PageLayout'
import UnifiedButton from '../ui/UnifiedButton'

// Lazy load non-critical components
const CoffeeTip = lazy(() => import('../home/CoffeeTip'))

const HybridHomePageContent = memo(function HybridHomePageContent() {
  const { user } = useAuth()
  const [recentRecords, setRecentRecords] = useState([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, avgRating: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [appStats, setAppStats] = useState({ totalUsers: 0, activeToday: 0, totalRecords: 0, isBeta: true })

  useEffect(() => {
    // 실제 앱 통계 가져오기
    const fetchAppStats = async () => {
      const stats = await AppStatsService.getRealStats()
      setAppStats(stats)
    }
    fetchAppStats()

    // 온보딩 상태 확인
    const hasCompletedOnboarding = localStorage.getItem('cupnote-onboarding-completed')
    if (!hasCompletedOnboarding) {
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
        
        {/* 데스크탑 히어로 섹션 - 시니어 디자인 개선 */}
        <div className="mb-12 md:mb-20">
          {/* 데스크탑용 히어로 레이아웃 (1024px+) */}
          <div className="hidden lg:block">
            {/* 배경 그래디언트 */}
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
                  
                  {/* 타이틀 - 더 감정적이고 구체적으로 개선 */}
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
                  
                  {/* 서브타이틀 - 구체적 가치 제안 */}
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
                  
                  {/* 베타 참여자 표시 - 실제 데이터 */}
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      BETA
                    </div>
                    <p className="text-sm text-coffee-600">
                      {appStats.totalUsers > 0 ? (
                        <>
                          <strong className="text-coffee-800">{appStats.totalUsers}명</strong>의 베타 테스터가 함께하고 있어요
                        </>
                      ) : (
                        '베타 테스트 참여자 모집 중'
                      )}
                    </p>
                  </div>
                  
                  {/* CTA 버튼 - 프리미엄 디자인 강화 */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link href="/mode-selection">
                      <UnifiedButton 
                        variant="hero"
                        size="xl"
                        icon={<Coffee className="h-5 w-5" />}
                        className="
                          bg-gradient-to-r from-coffee-600 to-coffee-700 
                          hover:from-coffee-700 hover:to-coffee-800
                          shadow-lg hover:shadow-xl
                          transform hover:scale-105
                          transition-all duration-300
                          px-8 py-4
                          text-lg font-semibold
                          border-0
                        "
                        data-testid="homepage-start-button"
                      >
                        무료로 시작하고 Premium 혜택 받기
                      </UnifiedButton>
                    </Link>
                    
                    <Link href="/demo">
                      <UnifiedButton 
                        variant="outline"
                        size="xl"
                        className="
                          border-2 border-coffee-300 
                          bg-white/80 backdrop-blur-sm
                          hover:bg-coffee-50 hover:border-coffee-400
                          shadow-md hover:shadow-lg
                          transform hover:scale-105
                          transition-all duration-300
                          px-8 py-4
                          text-lg font-medium
                          text-coffee-700 hover:text-coffee-800
                        "
                        data-testid="homepage-demo-button"
                      >
                        먼저 둘러보기
                      </UnifiedButton>
                    </Link>
                  </div>
                  
                  {/* 베타 버전 표시 - 실제 통계와 함께 */}
                  <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full px-6 py-3 shadow-md border border-purple-200/50">
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full">
                        BETA
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-coffee-800">얼리 액세스 진행 중</div>
                        <div className="text-xs text-coffee-600">
                          {appStats.totalRecords > 0 
                            ? `${appStats.totalRecords}개의 커피 기록`
                            : '함께 만들어가는 커피 기록 앱'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-purple-200"></div>
                    
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <div className="text-left">
                        <div className="font-medium text-coffee-700">무료 체험</div>
                        <div className="text-xs text-coffee-600">모든 기능 이용 가능</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 3가지 핵심 기능 - FluidContainer로 래핑 */}
                <FluidContainer maxWidth="full" className="mb-16">
                  <div className="fluid-grid">
                  {/* 카드 1 */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <Card className="relative bg-white hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0">
                      <CardContent className="p-6 sm:p-8">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Target className="h-10 w-10 text-white" />
                        </div>
                        <FluidText as="h3" size="xl" weight="bold" color="primary" className="mb-3">
                          초간단 기록
                        </FluidText>
                        <FluidText as="p" size="base" color="secondary" lineHeight="relaxed" className="mb-4">
                          단 2분! 복잡한 전문 용어 없이<br />
                          나만의 언어로 커피를 기록하세요
                        </FluidText>
                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                          <span className="text-3xl font-bold">120초</span>
                          <span className="text-sm">평균 소요 시간</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 카드 2 */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <Card className="relative bg-white hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0">
                      <CardContent className="p-6 sm:p-8">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <FluidText as="h3" size="xl" weight="bold" color="primary" className="mb-3">
                          AI 취향 분석
                        </FluidText>
                        <FluidText as="p" size="base" color="secondary" lineHeight="relaxed" className="mb-4">
                          기록이 쌓일수록 또렷해지는<br />
                          나만의 커피 취향 리포트
                        </FluidText>
                        <div className="flex items-center justify-center space-x-2 text-purple-600">
                          <span className="text-3xl font-bold">87%</span>
                          <span className="text-sm">취향 예측 정확도</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 카드 3 */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <Card className="relative bg-white hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0">
                      <CardContent className="p-6 sm:p-8">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Trophy className="h-10 w-10 text-white" />
                        </div>
                        <FluidText as="h3" size="xl" weight="bold" color="primary" className="mb-3">
                          성장 게임화
                        </FluidText>
                        <FluidText as="p" size="base" color="secondary" lineHeight="relaxed" className="mb-4">
                          30개 이상의 배지와 함께<br />
                          즐겁게 성장하는 커피 여정
                        </FluidText>
                        <div className="flex items-center justify-center space-x-2 text-amber-600">
                          <span className="text-3xl font-bold">30+</span>
                          <span className="text-sm">다양한 성취 배지</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  </div>
                </FluidContainer>
                
                {/* 새로운 섹션: 비포&애프터 */}
                <div className="max-w-4xl mx-auto mb-16">
                  <div className="bg-gradient-to-r from-coffee-100 to-amber-100 rounded-3xl p-12">
                    <FluidText as="h2" size="3xl" weight="bold" align="center" color="primary" className="mb-8">
                      CupNote로 달라지는 커피 라이프
                    </FluidText>
                    <div className="grid grid-cols-2 gap-12">
                      {/* Before */}
                      <div className="text-center">
                        <div className="text-lg font-medium text-coffee-600 mb-4">Before</div>
                        <div className="bg-white/80 rounded-2xl p-6 space-y-3">
                          <div className="text-coffee-500">😕 "이 커피 맛있네" 끝</div>
                          <div className="text-coffee-500">🤷 어떤 커피를 좋아하는지 모름</div>
                          <div className="text-coffee-500">📝 기록하기 귀찮고 복잡함</div>
                        </div>
                      </div>
                      
                      {/* After */}
                      <div className="text-center">
                        <div className="text-lg font-medium text-coffee-700 mb-4">After</div>
                        <div className="bg-white rounded-2xl p-6 space-y-3 shadow-lg">
                          <div className="text-coffee-700 font-medium">✨ "산미가 밝고 플로럴한.."</div>
                          <div className="text-coffee-700 font-medium">🎯 내 취향: 에티오피아 &gt; 콜롬비아</div>
                          <div className="text-coffee-700 font-medium">🏆 커피 여정 118일째 레벨 7</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 태블릿용 레이아웃 (768px - 1023px) */}
          <div className="hidden md:block lg:hidden">
            <div className="text-center px-6 py-12">
              {/* 태블릿 타이틀 - 데스크탑과 모바일 중간 */}
              <h1 className="text-4xl font-bold mb-4">
                <span className="block text-coffee-800">오늘 마신 커피,</span>
                <span className="block font-bold text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-amber-600 mt-2">
                  잊지 않고 기록하세요
                </span>
              </h1>
              
              {/* 태블릿 서브타이틀 */}
              <p className="text-lg text-coffee-600 mb-6 max-w-lg mx-auto">
                단 2분! 나만의 커피 취향을 발견하는 가장 쉬운 방법
              </p>
              
              {/* 베타 버전 표시 */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  BETA
                </div>
                <p className="text-sm text-coffee-600">
                  {appStats.totalUsers > 0 
                    ? `${appStats.totalUsers}명 참여 중`
                    : '베타 테스트 참여자 모집 중'}
                </p>
              </div>
              
              {/* 태블릿 CTA 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link href="/mode-selection" className="flex-1">
                  <button className="w-full bg-gradient-to-r from-coffee-600 to-coffee-700 text-white font-semibold
                                   rounded-xl shadow-lg hover:shadow-xl text-base
                                   transition-all duration-200 py-3.5">
                    무료로 시작하기
                  </button>
                </Link>
                
                {!user && (
                  <Link href="/demo" className="flex-1">
                    <button className="w-full bg-white hover:bg-coffee-50 border-2 border-coffee-300 hover:border-coffee-400
                                     rounded-xl shadow-sm hover:shadow-md text-coffee-700 hover:text-coffee-800 text-base font-medium
                                     transition-all duration-200 py-3.5">
                      둘러보기
                    </button>
                  </Link>
                )}
              </div>
              
              {/* 태블릿용 3가지 핵심 기능 - 더 컴팩트하게 */}
              <div className="grid grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-coffee-800 text-sm mb-1">2분 기록</h3>
                  <p className="text-xs text-coffee-600">누구나 쉽게</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-coffee-800 text-sm mb-1">AI 분석</h3>
                  <p className="text-xs text-coffee-600">취향 리포트</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md mb-3">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-coffee-800 text-sm mb-1">30+ 뱃지</h3>
                  <p className="text-xs text-coffee-600">성장 기록</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 모바일용 개선된 레이아웃 (< 768px) */}
          <div className="md:hidden">
            <div className="text-center px-4 py-8">
              {/* 모바일 타이틀 - 더 짧고 임팩트 있게 */}
              <h1 className="text-3xl font-bold mb-3">
                <span className="text-coffee-800">커피 일기,</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-amber-600 block mt-1">
                  2분이면 충분해요
                </span>
              </h1>
              
              {/* 모바일 베타 표시 */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">BETA</span>
                <p className="text-sm text-coffee-600">무료 베타 테스트 중</p>
              </div>
              
              {/* 모바일 CTA 버튼들 */}
              <div className="space-y-3 max-w-xs mx-auto">
                <Link href="/mode-selection">
                  <button className="w-full bg-gradient-to-r from-coffee-600 to-coffee-700 text-white font-semibold
                                   rounded-2xl shadow-lg hover:shadow-xl text-base
                                   transition-all duration-200 py-4">
                    무료로 시작하기 →
                  </button>
                </Link>
                
                {!user && (
                  <Link href="/demo">
                    <button className="w-full bg-white hover:bg-coffee-50 border-2 border-coffee-300 hover:border-coffee-400
                                     rounded-2xl shadow-sm hover:shadow-md text-coffee-700 hover:text-coffee-800 text-base font-medium
                                     transition-all duration-200 py-3.5">
                      먼저 둘러보기
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:max-w-6xl md:mx-auto md:px-4">

        {/* 로그인 사용자 전용 섹션 */}
        {user && (
          <>
            {/* Enhanced Stats Widget */}
            {stats.total > 0 && (
              <div className="mb-12">
                <div className="bg-gradient-to-r from-coffee-50 to-amber-50 rounded-2xl p-6 border border-coffee-200/30 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-coffee-800">☕ 나의 커피 여정</h3>
                    <Link href="/my-records">
                      <button className="text-coffee-500 hover:text-coffee-700 text-sm font-medium flex items-center space-x-1 transition-colors">
                        <span>더보기</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-xl font-bold text-coffee-700">{stats.thisMonth}</div>
                      <div className="text-xs text-coffee-600">이번 달 기록</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-xl font-bold text-coffee-700">{stats.total}</div>
                      <div className="text-xs text-coffee-600">총 커피 기록</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                        <Star className="h-6 w-6 text-white fill-current" />
                      </div>
                      <div className="text-xl font-bold text-coffee-700">{stats.avgRating.toFixed(1)}</div>
                      <div className="text-xs text-coffee-600">평균 평점</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white/60 rounded-xl p-3 border border-coffee-200/30">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-coffee-600">월간 목표</span>
                      <span className="text-coffee-700 font-medium">{stats.thisMonth}/10</span>
                    </div>
                    <div className="w-full bg-coffee-200/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-coffee-500 to-coffee-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.thisMonth / 10) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-coffee-500 mt-1 text-center">
                      {stats.thisMonth >= 10 ? '🎉 월간 목표 달성!' : `${10 - stats.thisMonth}잔 더 마시면 목표 달성!`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Recent Record Widget */}
            {recentRecords.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-coffee-800">📋 최근 기록</h3>
                  <Link href="/my-records">
                    <button className="text-coffee-500 hover:text-coffee-700 text-sm font-medium flex items-center space-x-1 transition-colors">
                      <span>전체보기</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
                
                <Link href={`/coffee/${recentRecords[0].id}`}>
                  <div className="bg-gradient-to-r from-white to-coffee-50/30 border border-coffee-200/30 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]">
                    <div className="flex items-start space-x-4">
                      {/* Coffee Icon with mode indicator */}
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <Coffee className="h-7 w-7 text-white" />
                        </div>
                        {recentRecords[0].mode && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                            {recentRecords[0].mode === 'cafe' ? '☕' : recentRecords[0].mode === 'homecafe' ? '🏠' : '🧪'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-coffee-800 text-lg truncate">{recentRecords[0].coffeeName}</h4>
                            <p className="text-coffee-600 text-sm">
                              {recentRecords[0].roaster || recentRecords[0].location}
                            </p>
                          </div>
                          {recentRecords[0].overall && (
                            <div className="flex items-center space-x-1 bg-amber-50 rounded-full px-3 py-1 ml-2">
                              <Star className="h-4 w-4 text-amber-500 fill-current" />
                              <span className="text-sm font-bold text-amber-700">{recentRecords[0].overall}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Taste Notes Preview */}
                        <div className="bg-coffee-50/50 rounded-lg p-3 mb-3 border border-coffee-200/20">
                          <p className="text-coffee-700 text-sm leading-relaxed line-clamp-2">
                            {recentRecords[0].notes || '맛 노트가 기록되지 않았어요'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-coffee-500">
                            {new Date(recentRecords[0].date).toLocaleDateString('ko-KR', { 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="flex items-center space-x-1 text-coffee-400">
                            <span className="text-xs">자세히 보기</span>
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Enhanced Achievement Widget */}
            {stats.total > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-coffee-800">🏆 최근 성취</h3>
                  <Link href="/achievements">
                    <button className="text-coffee-500 hover:text-coffee-700 text-sm font-medium flex items-center space-x-1 transition-colors">
                      <span>모든 뱃지</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-3">
                        <h4 className="font-bold text-amber-800 text-lg">커피 애호가 Level {Math.floor(stats.total / 5) + 1}</h4>
                        <p className="text-amber-700 text-sm">
                          {stats.total}번의 커피 기록으로 성장 중이에요!
                        </p>
                      </div>
                      
                      {/* Level Progress */}
                      <div className="bg-white/60 rounded-lg p-3 mb-3 border border-amber-200/30">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-amber-700">다음 레벨까지</span>
                          <span className="text-amber-800 font-bold">
                            {stats.total % 5}/{5}
                          </span>
                        </div>
                        <div className="w-full bg-amber-200/50 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((stats.total % 5) / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Recent Badge */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-amber-800 font-medium text-sm">최근 획득한 뱃지</p>
                          <p className="text-amber-600 text-xs">
                            {stats.total >= 10 ? '🏆 열정적인 커핀러' : 
                             stats.total >= 5 ? '☕ 커피 탐험가' : 
                             '🌟 첫 걸음'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced First Time Guide for users with no records */}
            {stats.total === 0 && (
              <div className="mb-12 space-y-6">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-coffee-50 to-amber-50 border border-coffee-200/50 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center shadow-md mb-3">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-coffee-800 mb-2">CupNote에 오신 것을 환영합니다! ☕</h3>
                    <p className="text-coffee-600 text-sm">첫 번째 커피 기록으로 여정을 시작해보세요</p>
                  </div>
                </div>

                {/* 3-Step Guide */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-coffee-800 text-center mb-4">📝 3단계로 쉽게 시작하기</h4>
                  
                  {/* Step 1 */}
                  <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-coffee-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-coffee-800 mb-1">커피 정보 입력</h5>
                        <p className="text-coffee-600 text-sm mb-2">커피 이름과 어디서 마셨는지만 기록하세요</p>
                        <div className="text-xs text-coffee-500 bg-coffee-50/80 rounded-lg px-3 py-2">
                          💡 예: "아메리카노 • 스타벅스"
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-coffee-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-coffee-800 mb-1">맛 평가하기</h5>
                        <p className="text-coffee-600 text-sm mb-2">별점과 간단한 느낌을 적어보세요</p>
                        <div className="text-xs text-coffee-500 bg-coffee-50/80 rounded-lg px-3 py-2">
                          💡 예: "⭐⭐⭐⭐ • 고소하고 부드러웠어요"
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-coffee-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-coffee-800 mb-1">기록 완성</h5>
                        <p className="text-coffee-600 text-sm mb-2">저장하면 첫 번째 뱃지를 획득해요!</p>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 flex items-center space-x-1">
                            <Trophy className="h-3 w-3" />
                            <span>🏆 "첫 기록" 뱃지 획득</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-coffee-100 to-amber-100 rounded-2xl p-6 text-center shadow-md">
                  <div className="mb-4">
                    <h4 className="font-semibold text-coffee-800 mb-2">지금 바로 시작해보세요!</h4>
                    <p className="text-coffee-600 text-sm">전문 용어를 몰라도 괜찮아요. 솔직한 느낌이 가장 중요합니다.</p>
                  </div>
                  
                  {/* Visual Guide */}
                  <div className="bg-white/60 rounded-xl p-4 mb-4 border border-coffee-200/30">
                    <div className="flex items-center justify-center space-x-3 text-coffee-600">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-coffee-500 rounded-lg flex items-center justify-center mb-1">
                          <Coffee className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">하단 탭</span>
                      </div>
                      <div className="text-coffee-400">→</div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-coffee-500 to-coffee-600 rounded-lg flex items-center justify-center mb-1">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">작성 버튼</span>
                      </div>
                      <div className="text-coffee-400">→</div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mb-1">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">뱃지 획득!</span>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tip */}
                  <div className="bg-coffee-50/50 rounded-xl p-3 border border-coffee-200/30">
                    <div className="flex items-center justify-center space-x-2 text-coffee-600 text-xs">
                      <Sparkles className="h-4 w-4 text-coffee-500" />
                      <span><strong>꿀팁:</strong> 매일 같은 시간에 커피를 마시면 더 정확한 맛 평가를 할 수 있어요!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 비로그인 사용자용 Quick Actions - 간소화된 디자인 */}
        {!user && (
          <div className="mb-12">
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <Link href="/features">
                <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/40 rounded-xl p-4 text-center hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-200">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-sm font-medium text-coffee-700">주요 기능</div>
                  <div className="text-xs text-coffee-500 mt-1">무엇을 할 수 있나요?</div>
                </div>
              </Link>
              
              <Link href="/auth">
                <div className="bg-gradient-to-r from-coffee-100 to-amber-50 border border-coffee-300/40 rounded-xl p-4 text-center hover:shadow-md hover:scale-105 transition-all duration-200">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-sm font-medium text-coffee-700">시작하기</div>
                  <div className="text-xs text-coffee-600 mt-1">회원가입 / 로그인</div>
                </div>
              </Link>
            </div>
          </div>
        )}


        {/* CupNote 소개 - 프리미엄 디자인으로 개선 */}
        {!user && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-coffee-100/80 to-amber-100/80 rounded-3xl p-8 shadow-lg border border-coffee-200/30">
              <FluidText as="h2" size="2xl" weight="bold" align="center" color="primary" className="mb-8">
                CupNote는 이런 분들을 위해 ✨
              </FluidText>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 첫 번째 카드 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Coffee className="h-6 w-6 text-white" />
                  </div>
                  <FluidText as="h3" size="lg" weight="semibold" color="primary" className="mb-3">
                    커피 입문자
                  </FluidText>
                  <FluidText as="p" size="sm" color="secondary" lineHeight="relaxed">
                    커피를 좋아하지만<br />
                    전문 용어가 어려운 분들을<br />
                    위한 쉬운 기록 방식
                  </FluidText>
                </div>

                {/* 두 번째 카드 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <FluidText as="h3" size="lg" weight="semibold" color="primary" className="mb-3">
                    취향 탐험가
                  </FluidText>
                  <FluidText as="p" size="sm" color="secondary" lineHeight="relaxed">
                    나만의 커피 취향을<br />
                    체계적으로 찾아가고<br />
                    AI 분석을 받고 싶은 분들
                  </FluidText>
                </div>

                {/* 세 번째 카드 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <FluidText as="h3" size="lg" weight="semibold" color="primary" className="mb-3">
                    홈카페 마스터
                  </FluidText>
                  <FluidText as="p" size="sm" color="secondary" lineHeight="relaxed">
                    집에서 직접 내린<br />
                    커피 레시피를 정밀하게<br />
                    기록하고 관리하고 싶은 분들
                  </FluidText>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/auth">
                  <UnifiedButton 
                    variant="hero" 
                    size="xl"
                    icon={<Sparkles className="h-5 w-5" />}
                    className="
                      bg-gradient-to-r from-coffee-600 to-coffee-700 
                      hover:from-coffee-700 hover:to-coffee-800
                      shadow-lg hover:shadow-xl
                      transform hover:scale-105
                      transition-all duration-300
                      px-8 py-4
                      text-lg font-semibold
                    "
                  >
                    ✨ 지금 시작하기
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