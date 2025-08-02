/**
 * 온보딩 플로우 컴포넌트
 * 신규 사용자를 위한 3단계 가이드
 */
'use client'

import { useState, useEffect } from 'react'
import { Coffee, BookOpen, TrendingUp, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import UnifiedButton from '../ui/UnifiedButton'

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

const steps = [
  {
    id: 1,
    title: "환영합니다! ☕",
    subtitle: "나만의 커피 여정을 시작해보세요",
    description: "CupNote는 커피를 좋아하는 모든 분들을 위한 개인 기록 앱입니다. 전문 용어가 어려워도 괜찮아요!",
    icon: Coffee
  },
  {
    id: 2,
    title: "간단하게 기록하세요 📝",
    subtitle: "어려운 전문 용어는 필요 없어요",
    description: "오늘 마신 커피가 어땠는지, 나만의 언어로 자유롭게 기록해보세요. 맛, 느낌, 장소 등 무엇이든 좋아요.",
    icon: BookOpen
  },
  {
    id: 3,
    title: "성장을 확인하세요 📊",
    subtitle: "나만의 커피 취향을 발견해가요",
    description: "기록이 쌓일수록 내 커피 취향이 보여요. 레벨업하고, 성취를 달성하며 커피 여정을 즐겨보세요!",
    icon: TrendingUp
  }
]

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('cupnote-onboarding-completed', 'true')
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('cupnote-onboarding-completed', 'true')
    onSkip()
  }

  const currentStepData = steps[currentStep]
  const IconComponent = currentStepData.icon

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardContent className="p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-coffee-400' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="온보딩 건너뛰기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-coffee-400/10 rounded-full flex items-center justify-center mb-4">
              <IconComponent className="h-8 w-8 text-coffee-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 mb-2">
              {currentStepData.title}
            </h2>
            <h3 className="text-lg text-coffee-600 mb-3">
              {currentStepData.subtitle}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              className={`flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>이전</span>
            </button>

            <span className="text-sm text-neutral-500">
              {currentStep + 1} / {steps.length}
            </span>

            <UnifiedButton
              onClick={handleNext}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? '시작하기' : '다음'}</span>
              {currentStep === steps.length - 1 ? (
                <Coffee className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </UnifiedButton>
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              건너뛰고 바로 시작하기
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}