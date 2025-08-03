/**
 * 온보딩 페이지 - 하이브리드 디자인 시스템
 * 사용자 첫 경험을 위한 5단계 온보딩 플로우
 */
'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Coffee, ArrowRight, ArrowLeft, CheckCircle, Star, Trophy, Target, Sparkles } from 'lucide-react'

import Navigation from '../../components/Navigation'
import { Card, CardContent } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import PageLayout from '../../components/ui/PageLayout'
import UnifiedButton from '../../components/ui/UnifiedButton'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'CupNote에 오신 것을 환영합니다!',
      description: '나만의 커피 여정을 기록하는 온라인 커피 일기',
      icon: <Coffee className="h-12 w-12 text-purple-600" />,
      content: (
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
              <Coffee className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-coffee-800 mb-4">반갑습니다!</h2>
            <p className="text-lg text-coffee-600 leading-relaxed max-w-md mx-auto">
              CupNote는 여러분의 커피 경험을 기록하고 분석하여 개인화된 커피 취향을 발견할 수 있도록 도와드립니다.
            </p>
          </div>
          
          {/* 하이브리드 특징 카드들 */}
          <div className="grid gap-4 mt-8">
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-coffee-800">개인화된 분석</p>
                  <p className="text-sm text-coffee-600">당신만의 커피 취향 발견</p>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-coffee-800">성취 시스템</p>
                  <p className="text-sm text-coffee-600">커피 여정을 재미있게</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: '3가지 기록 모드',
      description: '상황에 맞는 최적화된 기록 방식을 선택하세요',
      icon: <Target className="h-12 w-12 text-blue-600" />,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">상황별 기록 모드</h2>
            <p className="text-coffee-600">어떤 상황에서든 편리하게 기록하세요</p>
          </div>
          
          <div className="grid gap-6">
            {/* 카페 모드 */}
            <Card variant="default" className="bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm border border-blue-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-800 mb-1">☕ 카페 모드</h3>
                  <p className="text-blue-700 text-sm mb-2">카페에서 간단히 기록</p>
                  <div className="flex items-center space-x-2 text-xs text-blue-600">
                    <span className="bg-blue-200/50 px-2 py-1 rounded-full">3-5분</span>
                    <span className="bg-blue-200/50 px-2 py-1 rounded-full">7단계</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 홈카페 모드 */}
            <Card variant="default" className="bg-gradient-to-r from-green-50/80 to-green-100/80 backdrop-blur-sm border border-green-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-800 mb-1">🏠 홈카페 모드</h3>
                  <p className="text-green-700 text-sm mb-2">집에서 내린 커피 + 레시피</p>
                  <div className="flex items-center space-x-2 text-xs text-green-600">
                    <span className="bg-green-200/50 px-2 py-1 rounded-full">5-8분</span>
                    <span className="bg-green-200/50 px-2 py-1 rounded-full">상세 레시피</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lab 모드 */}
            <Card variant="default" className="bg-gradient-to-r from-purple-50/80 to-purple-100/80 backdrop-blur-sm border border-purple-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-purple-800 mb-1">🧪 Lab 모드</h3>
                  <p className="text-purple-700 text-sm mb-2">전문가 수준 커핑 평가</p>
                  <div className="flex items-center space-x-2 text-xs text-purple-600">
                    <span className="bg-purple-200/50 px-2 py-1 rounded-full">15-20분</span>
                    <span className="bg-purple-200/50 px-2 py-1 rounded-full">SCA 기준</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 추천 메시지 */}
          <Card variant="default" className="bg-coffee-50/80 backdrop-blur-sm border border-coffee-200/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-coffee-700">
                <span className="font-medium">💡 추천:</span> 처음이시라면 <span className="font-semibold text-blue-700">카페 모드</span>부터 시작해보세요!
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Match Score 시스템',
      description: '커피 기록을 통해 개인화된 점수와 피드백을 받아보세요',
      icon: <Star className="h-12 w-12 text-yellow-600" />,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">커뮤니티 기반 분석</h2>
            <p className="text-coffee-600">실제 사용자들과 비교한 개인화된 피드백</p>
          </div>

          {/* Match Score 데모 카드 */}
          <Card variant="elevated" className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="relative mx-auto mb-6" style={{ width: '120px', height: '120px' }}>
                <svg className="transform -rotate-90 w-full h-full">
                  <circle cx="60" cy="60" r="50" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50 * 0.85}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * 0.15}`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-green-500 bg-clip-text text-transparent">
                    85
                  </div>
                  <div className="text-sm font-medium text-coffee-600">점수</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-coffee-800 mb-2">
                훌륭한 커피 경험이었습니다 ✨
              </h3>
              <p className="text-coffee-600 text-sm mb-4">
                커뮤니티 평균보다 <span className="font-semibold text-green-600">25점 높은</span> 점수예요
              </p>
            </CardContent>
          </Card>

          {/* 분석 특징들 */}
          <div className="grid grid-cols-2 gap-4">
            <Card variant="default" className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm border border-blue-200/50 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-blue-800">개인화된 분석</p>
                <p className="text-xs text-blue-600 mt-1">취향 패턴 발견</p>
              </CardContent>
            </Card>
            
            <Card variant="default" className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm border border-green-200/50 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-green-800">커뮤니티 비교</p>
                <p className="text-xs text-green-600 mt-1">실시간 피드백</p>
              </CardContent>
            </Card>
          </div>

          {/* 설명 카드 */}
          <Card variant="default" className="bg-coffee-50/80 backdrop-blur-sm border border-coffee-200/30">
            <CardContent className="p-4">
              <p className="text-sm text-coffee-700 text-center">
                <span className="font-medium">💡 새로운 시스템:</span> 
                기존 등급제를 없애고 실제 커뮤니티 데이터를 바탕으로 한 개인화된 점수 시스템
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 4,
      title: '성취 시스템',
      description: '커피 여정을 통해 배지를 모으고 레벨을 올려보세요',
      icon: <Trophy className="h-12 w-12 text-yellow-600" />,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">성취와 레벨업</h2>
            <p className="text-coffee-600">커피 여정의 매 순간이 새로운 성취가 됩니다</p>
          </div>

          {/* 성취 배지 예시들 */}
          <div className="grid gap-4">
            <Card variant="default" className="bg-gradient-to-r from-blue-50/90 to-purple-50/90 backdrop-blur-sm border border-blue-200/30 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-coffee-800">첫 기록</h3>
                    <p className="text-coffee-600 text-sm">첫 번째 커피를 기록했어요!</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100/80 text-green-700 text-xs font-medium px-2 py-1 rounded-full">+10P</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" className="bg-gradient-to-r from-green-50/90 to-blue-50/90 backdrop-blur-sm border border-green-200/30 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-xl">🌍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-coffee-800">세계 탐험가</h3>
                    <p className="text-coffee-600 text-sm">10개 이상의 다른 원산지 커피</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100/80 text-green-700 text-xs font-medium px-2 py-1 rounded-full">+100P</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" className="bg-gradient-to-r from-amber-50/90 to-orange-50/90 backdrop-blur-sm border border-amber-200/30 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-xl">👑</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-coffee-800">커피 마스터</h3>
                    <p className="text-coffee-600 text-sm">100개의 커피를 기록했어요</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100/80 text-green-700 text-xs font-medium px-2 py-1 rounded-full">+500P</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 레벨 시스템 카드 */}
          <Card variant="elevated" className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-coffee-800">레벨 1 • 커피 입문자</p>
                  <p className="text-coffee-600 text-sm">다음 레벨까지 50P 필요</p>
                </div>
              </div>
              <div className="w-full bg-coffee-200/50 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: '0%' }}
                ></div>
              </div>
              <div className="text-right mt-2">
                <span className="text-sm font-medium text-coffee-600">0 / 50 P</span>
              </div>
            </CardContent>
          </Card>

          {/* 동기부여 메시지 */}
          <Card variant="default" className="bg-coffee-50/80 backdrop-blur-sm border border-coffee-200/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-coffee-700">
                <span className="font-medium">🏆 목표:</span> 
                30개 이상의 다양한 성취 배지를 모아보세요!
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 5,
      title: '시작할 준비 완료!',
      description: '이제 첫 번째 커피를 기록해보세요',
      icon: <CheckCircle className="h-12 w-12 text-green-600" />,
      content: (
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-coffee-800 mb-4">준비 완료!</h2>
            <p className="text-lg text-coffee-600 leading-relaxed mb-6 max-w-md mx-auto">
              CupNote와 함께 특별한 커피 여정을 시작해보세요. 매 한 잔이 새로운 발견이 될 거예요.
            </p>
          </div>

          {/* 시작 가이드 카드들 */}
          <div className="grid gap-4">
            <Card variant="default" className="bg-gradient-to-r from-blue-50/90 to-blue-100/90 backdrop-blur-sm border border-blue-200/30 shadow-md">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-blue-800">첫 기록 추천</p>
                  <p className="text-sm text-blue-600">카페 모드로 간단하게 시작해보세요</p>
                </div>
                <div className="text-blue-500 text-sm font-medium">3-5분</div>
              </CardContent>
            </Card>

            <Card variant="default" className="bg-gradient-to-r from-green-50/90 to-green-100/90 backdrop-blur-sm border border-green-200/30 shadow-md">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-green-800">첫 성취 획득</p>
                  <p className="text-sm text-green-600">기록 완료하면 첫 배지를 받아요</p>
                </div>
                <div className="text-green-500 text-sm font-medium">+10P</div>
              </CardContent>
            </Card>
          </div>

          {/* 시작 팁 카드 */}
          <Card variant="elevated" className="bg-coffee-50/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mt-1 shadow-md">
                  <span className="text-white text-sm">💡</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-coffee-800 mb-2">시작 팁</p>
                  <p className="text-sm text-coffee-700 leading-relaxed">
                    처음이시라면 <span className="font-semibold text-blue-700">카페 모드</span>부터 시작해보세요! 
                    간단하고 빠르게 기록할 수 있어서 부담 없이 시작하기 좋아요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 동기부여 메시지 */}
          <div className="bg-gradient-to-r from-coffee-500/10 to-coffee-600/10 rounded-xl p-4 border border-coffee-300/30">
            <p className="text-coffee-700 text-sm">
              🌟 <span className="font-medium">매일매일 새로운 커피 발견의 여정이 시작됩니다!</span>
            </p>
          </div>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 온보딩 완료 - 첫 기록으로 이동
      localStorage.setItem('cupnote-onboarding-completed', 'true')
      router.push('/mode-selection')
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('cupnote-onboarding-completed', 'true')
    router.push('/')
  }

  const currentStepData = steps[currentStep]

  return (
    <>
      <Navigation showBackButton currentPage="home" />
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="시작하기"
          description="CupNote 커피 기록 시스템을 소개합니다"
          icon={<Coffee className="h-6 w-6" />}
        />

        {/* 하이브리드 진행 상태 카드 */}
        <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-coffee-800">
                {currentStep + 1} / {steps.length}
              </span>
              <span className="text-sm font-medium text-coffee-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% 완료
              </span>
            </div>
            <div className="w-full bg-coffee-200/50 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-coffee-500 to-coffee-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* 하이브리드 메인 콘텐츠 카드 */}
        <Card variant="elevated" className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">{currentStepData.icon}</div>
              <h1 className="text-2xl font-bold text-coffee-800 mb-3">{currentStepData.title}</h1>
              <p className="text-coffee-600 max-w-md mx-auto">{currentStepData.description}</p>
            </div>

            <div>{currentStepData.content}</div>
          </CardContent>
        </Card>

        {/* 하이브리드 네비게이션 버튼들 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <UnifiedButton
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              size="large"
              className="bg-white/50 hover:bg-coffee-50/80 border-coffee-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              이전
            </UnifiedButton>
            
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="text-sm text-coffee-500 hover:text-coffee-700 transition-colors px-2"
              >
                건너뛰기
              </button>
            )}
          </div>

          <UnifiedButton
            onClick={handleNext}
            variant="primary"
            size="large"
            className="bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {currentStep === steps.length - 1 ? '시작하기' : '다음'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </UnifiedButton>
        </div>

        {/* 하이브리드 점 표시기 */}
        <Card variant="default" className="bg-white/60 backdrop-blur-sm border border-coffee-200/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center space-x-3">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-coffee-600 scale-125 shadow-md'
                      : index < currentStep
                        ? 'bg-coffee-400 hover:bg-coffee-500'
                        : 'bg-coffee-200 hover:bg-coffee-300'
                  }`}
                  aria-label={`단계 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    </>
  )
}
