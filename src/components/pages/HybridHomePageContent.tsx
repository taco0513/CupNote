/**
 * 하이브리드 홈페이지 - 미니멀 + 프리미엄 조합
 * Simple Elegance - 디자인팀 추천 MVP 버전
 */
'use client'

import { memo, lazy, Suspense, useState, useEffect } from 'react'

import Link from 'next/link'

import { Coffee, Star, Award, ChevronRight, Sparkles, Target, BarChart3, Trophy, Home } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import Navigation from '../Navigation'
import OnboardingFlow from '../onboarding/OnboardingFlow'
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
        
        {/* 데스크탑 히어로 섹션 - 시니어 디자인 개선 */}
        <div className="mb-12 md:mb-20">
          {/* 데스크탑용 히어로 레이아웃 */}
          <div className="hidden md:block">
            {/* 배경 그래디언트 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-coffee-50/50 via-transparent to-transparent h-[600px]"></div>
              
              <div className="relative max-w-6xl mx-auto px-4 pt-12">
                {/* 메인 히어로 */}
                <div className="text-center mb-20">
                  {/* NEW 배지 */}
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-coffee-100 text-coffee-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                    <Sparkles className="h-4 w-4" />
                    <span>커피 기록의 새로운 기준</span>
                  </div>
                  
                  {/* 타이틀 - Fluid Typography 적용 */}
                  <FluidText 
                    as="h1" 
                    size="hero" 
                    weight="bold" 
                    align="center"
                    className="mb-6" 
                    balance
                    data-testid="homepage-hero-title"
                  >
                    <span className="text-coffee-800">당신의 </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-amber-600">커피 이야기</span>
                    <span className="text-coffee-800">를</span>
                    <span className="block mt-2 text-coffee-800">
                      기록하고 <span className="text-coffee-600">성장</span>하세요
                    </span>
                  </FluidText>
                  
                  {/* 서브타이틀 - Fluid Typography 적용 */}
                  <FluidText 
                    as="p" 
                    size="xl"
                    color="secondary" 
                    align="center"
                    className="max-w-3xl mx-auto mb-10" 
                    lineHeight="relaxed"
                  >
                    하루 2분의 기록으로 시작하는 나만의 커피 여정.<br />
                    AI가 분석한 개인 맞춤 취향 리포트를 받아보세요.
                  </FluidText>
                  
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
                        ✨ 무료로 시작하기
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
                        🚀 먼저 둘러보기
                      </UnifiedButton>
                    </Link>
                  </div>
                  
                  {/* 개선된 신뢰 지표 - 더 시각적으로 */}
                  <div className="inline-flex items-center space-x-6 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-3">
                        {[...Array(4)].map((_, i) => (
                          <img 
                            key={i}
                            className="w-10 h-10 rounded-full border-2 border-white" 
                            src={`https://i.pravatar.cc/100?img=${i + 1}`}
                            alt="User"
                          />
                        ))}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-coffee-800">1,247</div>
                        <div className="text-xs text-coffee-600">활성 사용자</div>
                      </div>
                    </div>
                    
                    <div className="w-px h-10 bg-coffee-200"></div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-coffee-800">4.9/5.0</div>
                        <div className="text-xs text-coffee-600">사용자 평점</div>
                      </div>
                    </div>
                    
                    <div className="w-px h-10 bg-coffee-200"></div>
                    
                    <div className="flex items-center space-x-2">
                      <Award className="h-6 w-6 text-amber-500" />
                      <div className="text-left">
                        <div className="font-bold text-coffee-800">Editor's Choice</div>
                        <div className="text-xs text-coffee-600">2024 App Store</div>
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
          
          {/* 모바일용 개선된 레이아웃 */}
          <div className="md:hidden">
            <div className="max-w-md mx-auto space-y-3">
              {/* Secondary CTA - 먼저 구경하기 (비로그인 사용자용만) */}
              {!user && (
                <Link href="/demo">
                  <button className="w-full bg-white hover:bg-coffee-50 border-2 border-coffee-300 hover:border-coffee-400
                                   rounded-2xl shadow-sm hover:shadow-md text-coffee-700 hover:text-coffee-800 text-base font-medium
                                   transition-all duration-200 py-3.5">
                    <span>먼저 구경하기 →</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="md:max-w-6xl md:mx-auto md:px-4">

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
              <div className="mb-12 relative">
                {/* Coffee Tip at the top - 표준 coffee 테마 적용 */}
                <div className="mb-6 bg-coffee-50/50 border border-coffee-200/50 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-coffee-800 mb-1">커피 팁</h4>
                      <p className="text-coffee-700 text-sm">매일 같은 시간에 커피를 마시면 더 정확한 맛 평가를 할 수 있어요!</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-6 shadow-md text-center">
                  <div className="w-16 h-16 mx-auto bg-coffee-100 rounded-full flex items-center justify-center mb-4">
                    <Coffee className="h-8 w-8 text-coffee-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-coffee-800 mb-2">첫 번째 커피를 기록해보세요!</h3>
                  <p className="text-coffee-600 text-sm mb-6">
                    간단한 기록부터 시작해보세요. 전문 용어 없이도 충분합니다.
                  </p>
                  
                  {/* Simple CTA without floating elements */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-coffee-500 text-xs mb-4">
                      <Sparkles className="h-4 w-4" />
                      <span>첫 기록 작성 시 특별한 뱃지를 받을 수 있어요</span>
                    </div>
                    
                    <div className="bg-coffee-50/50 rounded-xl p-4 border border-coffee-200/30">
                      <p className="text-coffee-700 font-medium mb-2">하단의 ☕ 작성 버튼을 눌러보세요!</p>
                      <div className="text-coffee-500 text-2xl animate-bounce">
                        ↓
                      </div>
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