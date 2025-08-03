'use client'

import { useState, useEffect, useRef } from 'react'

import { X, ArrowRight, ArrowLeft, Coffee, Target } from 'lucide-react'

interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'hover' | 'input'
  skipable?: boolean
}

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  steps: TutorialStep[]
  tutorialId: string
}

export default function TutorialOverlay({
  isOpen,
  onClose,
  onComplete,
  steps,
  tutorialId
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return

    const updateHighlight = () => {
      const targetElement = document.querySelector(steps[currentStep].target)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setHighlightRect(rect)
        
        // 스크롤 조정
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    }

    updateHighlight()
    window.addEventListener('resize', updateHighlight)
    return () => window.removeEventListener('resize', updateHighlight)
  }, [currentStep, isOpen, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    // 튜토리얼 완료 상태 저장
    localStorage.setItem(`tutorial-${tutorialId}-completed`, 'true')
    onComplete()
  }

  const handleSkip = () => {
    if (steps[currentStep].skipable !== false) {
      handleComplete()
    }
  }

  if (!isOpen || !steps[currentStep] || !highlightRect) {
    return null
  }

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  // 툴팁 위치 계산
  const getTooltipPosition = () => {
    const spacing = 16
    let top = 0
    let left = 0

    switch (step.placement) {
      case 'top':
        top = highlightRect.top - spacing
        left = highlightRect.left + (highlightRect.width / 2)
        break
      case 'bottom':
        top = highlightRect.bottom + spacing
        left = highlightRect.left + (highlightRect.width / 2)
        break
      case 'left':
        top = highlightRect.top + (highlightRect.height / 2)
        left = highlightRect.left - spacing
        break
      case 'right':
        top = highlightRect.top + (highlightRect.height / 2)
        left = highlightRect.right + spacing
        break
    }

    return { top, left }
  }

  const tooltipPosition = getTooltipPosition()

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* 하이라이트 영역 */}
      <div
        className="absolute border-4 border-primary rounded-lg shadow-lg transition-all duration-300"
        style={{
          top: highlightRect.top - 4,
          left: highlightRect.left - 4,
          width: highlightRect.width + 8,
          height: highlightRect.height + 8,
          boxShadow: '0 0 0 4px rgba(111, 78, 55, 0.3), 0 0 20px rgba(111, 78, 55, 0.5)'
        }}
      />

      {/* 툴팁 */}
      <div
        className={`absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm min-w-80 transform transition-all duration-300 ${
          step.placement === 'top' ? '-translate-y-full -translate-x-1/2' :
          step.placement === 'bottom' ? 'translate-y-0 -translate-x-1/2' :
          step.placement === 'left' ? '-translate-x-full -translate-y-1/2' :
          'translate-x-0 -translate-y-1/2'
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* 화살표 */}
        <div
          className={`absolute w-4 h-4 bg-white border transform rotate-45 ${
            step.placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0' :
            step.placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0' :
            step.placement === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0' :
            'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0'
          }`}
        />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500">
                {currentStep + 1} / {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="튜토리얼 닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 내용 */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{step.content}</p>
          
          {step.action && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-primary-700">
                <Target className="w-4 h-4" />
                <span>
                  {step.action === 'click' && '클릭해보세요'}
                  {step.action === 'hover' && '마우스를 올려보세요'}
                  {step.action === 'input' && '입력해보세요'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </button>
            )}
            
            {step.skipable !== false && (
              <button
                onClick={handleSkip}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                건너뛰기
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            {currentStep === steps.length - 1 ? '완료' : '다음'}
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}