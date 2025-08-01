'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Coffee, ArrowRight, ArrowLeft, CheckCircle, Star, Trophy, Target } from 'lucide-react'

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
      icon: <Coffee className="h-12 w-12 text-coffee-600" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-coffee-100 rounded-full p-8 w-32 h-32 mx-auto flex items-center justify-center">
            <Coffee className="h-16 w-16 text-coffee-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-coffee-800 mb-4">반갑습니다!</h2>
            <p className="text-lg text-coffee-600 leading-relaxed">
              CupNote는 여러분의 커피 경험을 기록하고 분석하여
              <br />
              개인화된 커피 취향을 발견할 수 있도록 도와드립니다.
            </p>
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
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-coffee-800 text-center mb-8">상황별 기록 모드</h2>
          <div className="grid gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Coffee className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-800">☕ 카페 모드</h3>
                <p className="text-blue-600 text-sm">카페에서 간단히 기록 (3-5분)</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-4">
              <div className="bg-green-100 rounded-full p-3">
                <Coffee className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">🏠 홈카페 모드</h3>
                <p className="text-green-600 text-sm">집에서 내린 커피 + 레시피 (5-8분)</p>
              </div>
            </div>

          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Match Score 시스템',
      description: '커피 기록을 통해 개인화된 점수와 피드백을 받아보세요',
      icon: <Star className="h-12 w-12 text-yellow-600" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-coffee-800 text-center mb-8">개인화된 분석</h2>

          <div className="bg-white rounded-2xl border-2 border-coffee-200 p-6">
            <div className="text-center mb-6">
              <div className="relative mx-auto mb-4" style={{ width: '120px', height: '120px' }}>
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
                  <div className="text-lg font-bold text-green-600">A</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-coffee-800 mb-2">
                훌륭한 커피 경험이었습니다 ✨
              </h3>
              <p className="text-coffee-600 text-sm">평점, 모드, 상세도에 따른 개인화된 점수</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-coffee-50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-coffee-800">상세 분석</p>
            </div>
            <div className="bg-coffee-50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-sm font-medium text-coffee-800">개인 피드백</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: '성취 시스템',
      description: '커피 여정을 통해 배지를 모으고 레벨을 올려보세요',
      icon: <Trophy className="h-12 w-12 text-yellow-600" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-coffee-800 text-center mb-8">성취와 레벨업</h2>

          <div className="grid gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <h3 className="font-bold text-coffee-800">첫 기록</h3>
                  <p className="text-coffee-600 text-sm">첫 번째 커피를 기록했어요!</p>
                </div>
                <div className="ml-auto text-green-600 text-sm font-medium">+10P</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-2xl">🌍</div>
                <div>
                  <h3 className="font-bold text-coffee-800">세계 탐험가</h3>
                  <p className="text-coffee-600 text-sm">10개 이상의 다른 원산지 커피</p>
                </div>
                <div className="ml-auto text-green-600 text-sm font-medium">+100P</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-2xl">👑</div>
                <div>
                  <h3 className="font-bold text-coffee-800">커피 마스터</h3>
                  <p className="text-coffee-600 text-sm">100개의 커피를 기록했어요</p>
                </div>
                <div className="ml-auto text-green-600 text-sm font-medium">+500P</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-coffee-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-coffee-800">레벨 1 • 커피 입문자</p>
                  <p className="text-coffee-600 text-sm">0/50 P</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-coffee-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: '시작할 준비 완료!',
      description: '이제 첫 번째 커피를 기록해보세요',
      icon: <CheckCircle className="h-12 w-12 text-green-600" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-green-100 rounded-full p-8 w-32 h-32 mx-auto flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-coffee-800 mb-4">준비 완료!</h2>
            <p className="text-lg text-coffee-600 leading-relaxed mb-6">
              CupNote와 함께 특별한 커피 여정을 시작해보세요.
              <br />매 한 잔이 새로운 발견이 될 거예요.
            </p>

            <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
              <p className="text-sm text-coffee-700">
                <span className="font-medium">💡 시작 팁:</span>
                처음이시라면 카페 모드부터 시작해보세요!
                <br />
                간단하고 빠르게 기록할 수 있어요.
              </p>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-coffee-800">☕ CupNote</div>
          </div>
          <button
            onClick={handleSkip}
            className="text-coffee-500 hover:text-coffee-700 transition-colors text-sm"
          >
            건너뛰기
          </button>
        </div>

        {/* 진행 상태 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-coffee-700">
              {currentStep + 1} / {steps.length}
            </span>
            <span className="text-sm text-coffee-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-coffee-500 to-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="mb-4">{currentStepData.icon}</div>
            <h1 className="text-2xl font-bold text-coffee-800 mb-2">{currentStepData.title}</h1>
            <p className="text-coffee-600">{currentStepData.description}</p>
          </div>

          <div className="mb-8">{currentStepData.content}</div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            이전
          </button>

          <button
            onClick={handleNext}
            className="flex items-center px-8 py-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium"
          >
            {currentStep === steps.length - 1 ? '시작하기' : '다음'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>

        {/* 점 표시기 */}
        <div className="flex justify-center space-x-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-coffee-600'
                  : index < currentStep
                    ? 'bg-coffee-400'
                    : 'bg-coffee-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
