'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Heart, Smile, Info, Lightbulb } from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, TastingMode, SensoryExpression } from '../../../../types/tasting-flow.types'

// 한국어 감각 표현 예시들
const SENSORY_EXPRESSIONS = {
  texture: {
    title: '질감 · 바디감',
    examples: [
      '부드러운', '실키한', '크리미한', '벨벳같은', '깔끔한',
      '가벼운', '묵직한', '진한', '농후한', '물같은',
      '거친', '떫은', '기름진', '끈적한', '바삭한'
    ]
  },
  temperature: {
    title: '온도감 · 느낌',
    examples: [
      '따뜻한', '뜨거운', '시원한', '차가운', '미지근한',
      '상쾌한', '청량한', '포근한', '후끈한', '쌀쌀한'
    ]
  },
  emotional: {
    title: '감정 · 기분',
    examples: [
      '행복한', '편안한', '기운나는', '상쾌한', '따뜻한',
      '그리운', '아늑한', '설레는', '진정되는', '깔끔한',
      '복잡한', '어려운', '아쉬운', '특별한', '새로운'
    ]
  },
  memory: {
    title: '기억 · 연상',
    examples: [
      '어린시절', '할머니집', '카페', '여행', '가을',
      '크리스마스', '생일', '데이트', '아침', '주말',
      '학교', '회사', '친구', '가족', '연인'
    ]
  },
  comparison: {
    title: '비유 · 연상',
    examples: [
      '사탕같은', '꿀같은', '우유같은', '와인같은', '차같은',
      '빵같은', '과일같은', '꽃같은', '향수같은', '약같은',
      '흙같은', '나무같은', '금속같은', '종이같은', '비누같은'
    ]
  }
}


export default function SensoryExpressionPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 세션 로드 및 검증
  useEffect(() => {
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

  const handleExpressionToggle = (expression: string) => {
    if (selectedExpressions.includes(expression)) {
      setSelectedExpressions(prev => prev.filter(e => e !== expression))
    } else {
      setSelectedExpressions(prev => [...prev, expression])
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (selectedExpressions.length === 0) {
      newErrors.expression = '최소 하나 이상의 감각 표현을 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    const sensoryExpression: SensoryExpression = {
      selectedExpressions,
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
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">감각 표현</h1>
            <div className="text-sm text-coffee-600">
              {mode === 'cafe' ? '4' : '4'} / {mode === 'cafe' ? '6' : '7'}
            </div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: mode === 'cafe' ? '66.67%' : '57.14%' }}
            />
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
                한국어 감각 표현 *
              </label>
              <p className="text-sm text-gray-500 mb-4">
                CATA 방식으로 여러 표현을 자유롭게 선택하세요. 카테고리별 최대 3개까지 가능합니다.
              </p>
              
              <div className="space-y-6">
                {Object.entries(SENSORY_EXPRESSIONS).map(([key, category]) => (
                  <div key={key}>
                    <h4 className="text-sm font-medium text-coffee-700 mb-3">{category.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.examples.map((expression) => (
                        <button
                          key={expression}
                          onClick={() => handleExpressionToggle(expression)}
                          className={`px-3 py-1 rounded-full text-sm border transition-all ${
                            selectedExpressions.includes(expression)
                              ? 'bg-coffee-600 text-white border-coffee-600'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {expression}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 선택된 표현들 */}
              {selectedExpressions.length > 0 && (
                <div className="mt-4 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
                  <h4 className="text-sm font-medium text-coffee-700 mb-2">선택된 표현</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpressions.map((expression) => (
                      <span
                        key={expression}
                        className="px-2 py-1 bg-coffee-600 text-white rounded-full text-sm"
                      >
                        {expression}
                      </span>
                    ))}
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
                  <li>• 전문 용어를 몰라도 괜찮아요. 일상 언어로 충분해요</li>
                  <li>• 첫인상, 중간 맛, 뒷맛을 각각 떠올려보세요</li>
                  <li>• 온도 변화에 따른 맛 변화도 기록해보세요</li>
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