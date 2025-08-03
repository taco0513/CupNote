/**
 * 개발/테스트용 온보딩 트리거 컴포넌트
 */
'use client'

import { useState } from 'react'

import { RefreshCw } from 'lucide-react'

import OnboardingFlow from '../onboarding/OnboardingFlow'

export default function OnboardingTrigger() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  const resetOnboarding = () => {
    localStorage.removeItem('cupnote-onboarding-completed')
    setShowOnboarding(true)
  }

  // 개발 모드에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <button
        onClick={resetOnboarding}
        className="fixed bottom-4 left-4 z-40 bg-coffee-500 text-white p-2 rounded-full shadow-lg hover:bg-coffee-600 transition-colors"
        title="온보딩 다시 보기 (개발용)"
      >
        <RefreshCw className="h-4 w-4" />
      </button>

      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </>
  )
}