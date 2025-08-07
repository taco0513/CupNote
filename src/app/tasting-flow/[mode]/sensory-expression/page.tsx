'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { ArrowRight, ArrowLeft, Heart, Smile, Info, Lightbulb } from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'

import type { TastingSession, TastingMode, SensoryExpression } from '../../../../types/tasting-flow.types'

// 6 카테고리 x 7 표현 = 44개 한국어 감각 표현
const SENSORY_EXPRESSIONS = {
  acidity: {
    title: '산미',
    icon: '🍋',
    color: 'bg-green-100 border-green-300 text-green-800',
    expressions: [
      '싱그러운',
      '발랄한',
      '톡 쏘는',
      '상큼한',
      '과일 같은',
      '와인 같은',
      '시트러스 같은'
    ]
  },
  sweetness: {
    title: '단맛',
    icon: '🍯',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    expressions: [
      '농밀한',
      '달콤한',
      '꿀 같은',
      '캐러멜 같은',
      '설탕 같은',
      '당밀 같은',
      '메이플 시럽 같은'
    ]
  },
  bitterness: {
    title: '쓴맛',
    icon: '🍫',
    color: 'bg-stone-100 border-stone-300 text-stone-800',
    expressions: [
      '쌉싸름한',
      '진한',
      '다크초콜릿 같은',
      '카카오 같은',
      '허브 같은',
      '담배 같은',
      '나무 같은'
    ]
  },
  body: {
    title: '바디',
    icon: '💧',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    expressions: [
      '가벼운',
      '중간의',
      '묵직한',
      '크리미한',
      '실키한',
      '벨벳 같은',
      '물 같은'
    ]
  },
  aftertaste: {
    title: '애프터',
    icon: '✨',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    expressions: [
      '깔끔한',
      '여운이 긴',
      '드라이한',
      '달콤한 여운',
      '쓴 여운',
      '상쾌한 여운',
      '복잡한 여운'
    ]
  },
  balance: {
    title: '밸런스',
    icon: '⚖️',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    expressions: [
      '균형잡힌',
      '조화로운',
      '부드러운',
      '복잡한',
      '일관된',
      '다층적인',
      '우아한'
    ]
  }
}


export default function SensoryExpressionPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [selectedExpressions, setSelectedExpressions] = useState<Record<string, string[]>>({
    acidity: [],
    sweetness: [],
    bitterness: [],
    body: [],
    aftertaste: [],
    balance: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 세션 로드 및 검증
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    if (!isFeatureEnabled('ENABLE_NEW_TASTING_FLOW')) {
      router.push('/mode-selection')
      return
    }

    const sessionData = sessionStorage.getItem('tf_session')
    if (!sessionData) {
      router.push('/tasting-flow')
      return
    }

    const parsedSession = JSON.parse(sessionData)
    if (!parsedSession.mode || (parsedSession.mode !== 'cafe' && parsedSession.mode !== 'homecafe')) {
      router.push('/tasting-flow')
      return
    }

    setSession(parsedSession)
  }, [router])

  const handleExpressionToggle = (category: string, expression: string) => {
    setSelectedExpressions(prev => {
      const categoryExpressions = prev[category] || []
      
      if (categoryExpressions.includes(expression)) {
        // 선택 해제
        return {
          ...prev,
          [category]: categoryExpressions.filter(e => e !== expression)
        }
      } else {
        // 선택 추가 (카테고리당 최대 3개까지)
        if (categoryExpressions.length >= 3) {
          return prev
        }
        return {
          ...prev,
          [category]: [...categoryExpressions, expression]
        }
      }
    })
  }

  // 전체 선택된 표현 개수 계산
  const getTotalSelectedCount = () => {
    return Object.values(selectedExpressions).reduce((sum, expressions) => sum + expressions.length, 0)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (getTotalSelectedCount() === 0) {
      newErrors.expression = '최소 하나 이상의 감각 표현을 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    // 선택된 모든 표현을 플랫하게 변환
    const allSelectedExpressions: string[] = []
    Object.entries(selectedExpressions).forEach(([category, expressions]) => {
      expressions.forEach(expr => {
        allSelectedExpressions.push(`${expr}`)
      })
    })

    const sensoryExpression: SensoryExpression = {
      selectedExpressions: allSelectedExpressions,
    }

    const updatedSession = {
      ...session,
      sensoryExpression,
      currentScreen: 'sensory-mouthfeel', // 다음은 선택적 수치 평가
    }

    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))
    router.push(`/tasting-flow/${mode}/sensory-mouthfeel`)
  }

  const handleBack = () => {
    router.push(`/tasting-flow/${mode}/flavor-selection`)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      {/* 미니멀 프로그레스바 - sticky로 헤더에 붙이기 */}
      <div className="sticky top-[calc(64px+env(safe-area-inset-top))] z-30 bg-white">
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-coffee-400 to-coffee-500 transition-all duration-300"
            style={{ width: mode === 'cafe' ? '66.67%' : '57.14%' }}
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl pb-20 md:pb-8">
        <Navigation showBackButton currentPage="record" />

        {/* 페이지 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-coffee-800">감각 표현</h1>
            <span className="text-sm text-coffee-600">{mode === 'cafe' ? '4' : '4'} / {mode === 'cafe' ? '6' : '7'}</span>
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
              이 커피는 어떤 느낌이었나요?
            </h2>
            <p className="text-coffee-600">나만의 언어로 자유롭게 표현해보세요</p>
          </div>

          <div className="space-y-8">
            {/* 한국어 감각 표현 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <Smile className="inline h-4 w-4 mr-1" />
                6가지 카테고리별 감각 표현 *
              </label>
              <p className="text-sm text-gray-500 mb-4">
                CATA 방식으로 여러 표현을 자유롭게 선택하세요. 카테고리별 최대 3개까지 가능합니다.
              </p>
              
              <div className="space-y-6">
                {Object.entries(SENSORY_EXPRESSIONS).map(([key, category]) => (
                  <div key={key} className={`p-4 rounded-xl border-2 ${category.color.replace('text-', 'border-').replace('800', '200')}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-coffee-800 flex items-center">
                        <span className="text-2xl mr-2">{category.icon}</span>
                        {category.title}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {selectedExpressions[key]?.length || 0}/3 선택됨
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.expressions.map((expression) => {
                        const isSelected = selectedExpressions[key]?.includes(expression)
                        const isDisabled = !isSelected && selectedExpressions[key]?.length >= 3
                        
                        return (
                          <button
                            key={expression}
                            onClick={() => handleExpressionToggle(key, expression)}
                            disabled={isDisabled}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? category.color + ' border-2'
                                : isDisabled
                                ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {expression}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 선택된 표현 요약 */}
              {getTotalSelectedCount() > 0 && (
                <div className="mt-6 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
                  <h4 className="text-sm font-medium text-coffee-700 mb-3">
                    선택된 표현 ({getTotalSelectedCount()}개)
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedExpressions).map(([category, expressions]) => {
                      if (expressions.length === 0) return null
                      const categoryInfo = SENSORY_EXPRESSIONS[category as keyof typeof SENSORY_EXPRESSIONS]
                      
                      return (
                        <div key={category} className="flex items-start">
                          <span className="text-sm font-medium text-coffee-600 mr-2 min-w-[60px]">
                            {categoryInfo.icon} {categoryInfo.title}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {expressions.map((expr) => (
                              <span
                                key={expr}
                                className="px-2 py-0.5 bg-coffee-600 text-white rounded-full text-xs"
                              >
                                {expr}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {errors.expression && (
                <p className="mt-2 text-sm text-red-600">{errors.expression}</p>
              )}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">감각 표현 팁</p>
                <ul className="space-y-1 text-xs">
                  <li>• 정답은 없어요. 내가 느낀 그대로가 가장 좋은 표현입니다</li>
                  <li>• 6가지 카테고리별로 내가 느낀 감각을 선택해보세요</li>
                  <li>• 카테고리당 최대 3개까지 선택할 수 있어요</li>
                  <li>• 최소 1개 이상만 선택하면 됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            이전
          </button>
          <button
            onClick={handleNext}
            className="flex-2 py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">다음: 수치 평가 (선택적)</p>
        </div>
      </div>
    </div>
  )
}