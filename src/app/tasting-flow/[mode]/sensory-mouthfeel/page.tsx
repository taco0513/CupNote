'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { ArrowRight, ArrowLeft, BarChart3, FastForward, Info, CheckCircle, X } from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'

import type { TastingSession, TastingMode, SensoryMouthFeel } from '../../../../types/tasting-flow.types'

// 수치 평가 항목들
const EVALUATION_ITEMS = [
  {
    id: 'body',
    name: 'Body (바디감)',
    description: '커피의 무게감과 질감',
    scale: {
      1: '물 같이 가벼움',
      2: '가벼운 바디감',
      3: '적당한 바디감',
      4: '묵직한 바디감',
      5: '크리미하고 매우 묵직함'
    }
  },
  {
    id: 'acidity',
    name: 'Acidity (산미)',
    description: '밝고 상쾌한 산미의 강도',
    scale: {
      1: '산미 거의 없음',
      2: '약한 산미',
      3: '적당한 산미',
      4: '강한 산미',
      5: '강하고 복잡한 산미'
    }
  },
  {
    id: 'sweetness',
    name: 'Sweetness (단맛)',
    description: '자연스러운 단맛의 정도',
    scale: {
      1: '단맛 부족',
      2: '약한 단맛',
      3: '은은한 자연 단맛',
      4: '풍부한 단맛',
      5: '매우 풍부한 단맛'
    }
  },
  {
    id: 'finish',
    name: 'Finish (여운)',
    description: '맛이 지속되는 시간과 품질',
    scale: {
      1: '여운이 짧음',
      2: '짧은 여운',
      3: '적당한 길이의 여운',
      4: '긴 여운',
      5: '매우 길고 복합적인 여운'
    }
  },
  {
    id: 'bitterness',
    name: 'Bitterness (쓴맛)',
    description: '쓴맛의 강도와 품질',
    scale: {
      1: '쓴맛 거의 없음',
      2: '약한 쓴맛',
      3: '적당하고 균형잡힌 쓴맛',
      4: '강한 쓴맛',
      5: '강하지만 불쾌하지 않은 쓴맛'
    }
  },
  {
    id: 'balance',
    name: 'Balance (밸런스)',
    description: '전체적인 조화와 균형',
    scale: {
      1: '특정 요소가 과도함',
      2: '약간 불균형',
      3: '무난한 균형감',
      4: '좋은 균형감',
      5: '모든 요소가 완벽하게 조화'
    }
  }
]

export default function SensoryMouthFeelPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({
    body: 3,
    acidity: 3,
    sweetness: 3,
    finish: 3,
    bitterness: 3,
    balance: 3
  })

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

  const handleRatingChange = (itemId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating
    }))
  }

  const getTotalAndAverage = () => {
    const total = Object.values(ratings).reduce((sum, rating) => sum + rating, 0)
    const average = total / Object.keys(ratings).length
    return { total, average: Math.round(average * 10) / 10 }
  }

  const getStrengthsAndWeaknesses = () => {
    const items = Object.entries(ratings)
    const strengths = items.filter(([_, rating]) => rating >= 4).map(([id]) => 
      EVALUATION_ITEMS.find(item => item.id === id)?.name.split(' ')[0]
    ).filter((item): item is string => item !== undefined)
    const weaknesses = items.filter(([_, rating]) => rating <= 2).map(([id]) => 
      EVALUATION_ITEMS.find(item => item.id === id)?.name.split(' ')[0]
    ).filter((item): item is string => item !== undefined)
    return { strengths, weaknesses }
  }

  const getAutoComment = () => {
    const { average } = getTotalAndAverage()
    const { strengths, weaknesses } = getStrengthsAndWeaknesses()
    
    if (average >= 4.2) {
      return "🌟 매우 뛰어난 커피입니다!"
    } else if (average >= 3.5) {
      return "👍 균형잡힌 좋은 커피네요"
    } else if (average >= 2.8) {
      return "☕ 평범한 커피입니다"
    } else {
      return "🤔 아쉬운 부분이 있는 커피네요"
    }
  }

  const handleNext = () => {
    const sensoryMouthFeel: SensoryMouthFeel = {
      ratings,
      totalScore: getTotalAndAverage().total,
      averageScore: getTotalAndAverage().average,
      strengths: getStrengthsAndWeaknesses().strengths,
      weaknesses: getStrengthsAndWeaknesses().weaknesses,
      autoComment: getAutoComment(),
    }

    const updatedSession = {
      ...session,
      sensoryMouthFeel,
      currentScreen: 'personal-notes',
    }

    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))
    router.push(`/tasting-flow/${mode}/personal-notes`)
  }

  const handleSkip = () => {
    const updatedSession = {
      ...session,
      currentScreen: 'personal-notes',
    }

    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))
    router.push(`/tasting-flow/${mode}/personal-notes`)
  }

  const handleBack = () => {
    router.push(`/tasting-flow/${mode}/sensory-expression`)
  }

  const { total, average } = getTotalAndAverage()
  const { strengths, weaknesses } = getStrengthsAndWeaknesses()

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
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl pb-20 md:pb-8">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">수치 평가</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSkip}
                className="text-sm text-coffee-600 hover:text-coffee-800 transition-colors flex items-center"
              >
                <FastForward className="h-4 w-4 mr-1" />
                건너뛰기
              </button>
              <div className="text-sm text-coffee-600">
                {mode === 'cafe' ? '5' : '5'} / {mode === 'cafe' ? '6' : '7'}
              </div>
            </div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: mode === 'cafe' ? '83.33%' : '71.43%' }}
            />
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
              6개 감각을 점수로 평가해보세요
            </h2>
            <p className="text-coffee-600 mb-4">각 항목은 1-5점으로 평가합니다 (3점이 기본값)</p>
            
            {/* 건너뛰기 안내 */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
              <Info className="h-4 w-4" />
              <span>선택사항 - 언제든 건너뛸 수 있어요</span>
            </div>
          </div>

          {/* 실시간 요약 */}
          <div className="mb-8 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-coffee-800">{total}</div>
                <div className="text-sm text-coffee-600">총점</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-coffee-800">{average}</div>
                <div className="text-sm text-coffee-600">평균</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800">{strengths.length}</div>
                <div className="text-sm text-green-600">강점</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-800">{weaknesses.length}</div>
                <div className="text-sm text-red-600">약점</div>
              </div>
            </div>
            
            {/* 자동 코멘트 */}
            <div className="mt-4 text-center">
              <p className="text-lg font-medium text-coffee-800">{getAutoComment()}</p>
            </div>
          </div>

          {/* 평가 항목들 */}
          <div className="space-y-6">
            {EVALUATION_ITEMS.map((item) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-xl">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-coffee-800">{item.name}</h3>
                  <p className="text-sm text-coffee-600">{item.description}</p>
                </div>

                {/* 평점 슬라이더 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">1점</span>
                    <span className="text-lg font-bold text-coffee-800">{ratings[item.id]}점</span>
                    <span className="text-sm text-gray-500">5점</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(item.id, rating)}
                        className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                          ratings[item.id] === rating
                            ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-lg font-bold">{rating}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 현재 선택된 점수 설명 */}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {item.scale[ratings[item.id] as keyof typeof item.scale]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 강점/약점 표시 */}
          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {strengths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">강점</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strengths.map((strength, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {weaknesses.length > 0 && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center mb-2">
                    <X className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">개선점</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {weaknesses.map((weakness, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">수치 평가 팁</p>
                <ul className="space-y-1 text-xs">
                  <li>• 3점이 기본값입니다. 평범하다면 그대로 두세요</li>
                  <li>• 확실히 느껴진 부분만 4-5점이나 1-2점으로 조정하세요</li>
                  <li>• 애매하면 건너뛰기를 누르셔도 됩니다</li>
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
            onClick={handleSkip}
            className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
          >
            <FastForward className="h-5 w-5 mr-2" />
            건너뛰기
          </button>
          <button
            onClick={handleNext}
            className="flex-2 py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center"
          >
            평가 완료
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">다음: 개인 노트</p>
        </div>
      </div>
    </div>
  )
}