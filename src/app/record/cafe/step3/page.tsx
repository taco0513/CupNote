'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  ArrowLeft, 
  Heart,
  Check
} from 'lucide-react'
import Navigation from '../../../../components/Navigation'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe'
}

interface CafeData {
  cafe_name: string
  coffee_name: string
}

interface FlavorChoice {
  level2: string  // Level 2 ID (필수)
  level3?: string[]  // Level 3 IDs (선택적)
}

interface FlavorSelection {
  selectedFlavors: FlavorChoice[]
  timestamp: Date
  selectionDuration: number
}

// Foundation 문서의 6개 카테고리 × 7개 표현 = 44개 한국어 감각 표현 시스템 (홈카페와 동일)
const KOREAN_SENSORY_EXPRESSIONS = {
  acidity: {
    name: '산미',
    icon: '🍋',
    color: 'blue',
    expressions: ['싱그러운', '발랄한', '톡 쏘는', '상큼한', '과일 같은', '와인 같은', '시트러스 같은']
  },
  sweetness: {
    name: '단맛',
    icon: '🍯',
    color: 'orange',
    expressions: ['농밀한', '달콤한', '꿀 같은', '캐러멜 같은', '설탕 같은', '당밀 같은', '메이플 시럽 같은']
  },
  bitterness: {
    name: '쓴맛',
    icon: '🌰',
    color: 'amber',
    expressions: ['스모키한', '카카오 같은', '허브 느낌의', '고소한', '견과류 같은', '다크 초콜릿 같은', '로스티한']
  },
  body: {
    name: '바디',
    icon: '💧',
    color: 'blue',
    expressions: ['크리미한', '벨벳 같은', '묵직한', '가벼운', '실키한', '오일리한', '물 같은']
  },
  aftertaste: {
    name: '애프터',
    icon: '🌬️',
    color: 'purple',
    expressions: ['깔끔한', '길게 남는', '산뜻한', '여운이 좋은', '드라이한', '달콤한 여운의', '복합적인']
  },
  balance: {
    name: '밸런스',
    icon: '⚖️',
    color: 'yellow',
    expressions: ['조화로운', '부드러운', '자연스러운', '복잡한', '단순한', '안정된', '역동적인']
  }
}

export default function CafeStep3Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [cafeData, setCafeData] = useState<CafeData | null>(null)
  const [flavorSelection, setFlavorSelection] = useState<FlavorSelection | null>(null)
  const [selectedExpressions, setSelectedExpressions] = useState<{[category: string]: string[]}>({})
  const [activeCategory, setActiveCategory] = useState<string>('acidity')
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const savedCafe = sessionStorage.getItem('cafeStep1')
    const savedStep2 = sessionStorage.getItem('cafeStep2')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      if (data1.mode !== 'cafe') {
        router.push('/mode-selection')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
    
    if (savedCafe) {
      const cafeFullData = JSON.parse(savedCafe)
      setCafeData({
        cafe_name: cafeFullData.cafe_name,
        coffee_name: cafeFullData.coffee_name
      })
    } else {
      router.push('/record/cafe/step1')
      return
    }

    if (savedStep2) {
      setFlavorSelection(JSON.parse(savedStep2))
    } else {
      router.push('/record/cafe/step2')
      return
    }
  }, [router])

  const handleExpressionToggle = (category: string, expression: string) => {
    setSelectedExpressions(prev => {
      const categorySelections = prev[category] || []
      const isSelected = categorySelections.includes(expression)

      if (isSelected) {
        // 선택 해제
        return {
          ...prev,
          [category]: categorySelections.filter(expr => expr !== expression)
        }
      } else if (categorySelections.length < 3) {
        // 새로 선택 (Foundation 문서의 카테고리당 최대 3개 제한)
        return {
          ...prev,
          [category]: [...categorySelections, expression]
        }
      }

      return prev // 3개 초과 시 변경 없음
    })
  }

  const getTotalSelected = () => {
    return Object.values(selectedExpressions).reduce((total, expressions) => total + expressions.length, 0)
  }

  const getCategoryCount = (category: string) => {
    return selectedExpressions[category]?.length || 0
  }

  const handleNext = () => {
    // Foundation 문서의 출력 데이터 구조
    const sensoryExpressions = {
      expressions: selectedExpressions,
      total_selected: getTotalSelected(),
      categories_used: Object.keys(selectedExpressions).filter(cat => selectedExpressions[cat]?.length > 0).length,
      selection_distribution: Object.keys(selectedExpressions).reduce((dist, category) => {
        dist[category] = selectedExpressions[category]?.length || 0
        return dist
      }, {} as {[key: string]: number}),
      selection_time: Math.round((Date.now() - startTime) / 1000),
      selection_timestamp: new Date(),
      cata_method: 'korean_native'
    }
    
    sessionStorage.setItem('cafeStep3', JSON.stringify(sensoryExpressions))
    router.push('/record/cafe/step4')
  }

  const handleBack = () => {
    router.push('/record/cafe/step2')
  }

  if (!step1Data || !cafeData || !flavorSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const getColorClasses = (color: string, selected: boolean = false) => {
    const colors = {
      blue: selected ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-blue-200 hover:border-blue-400',
      orange: selected ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-orange-200 hover:border-orange-400',
      amber: selected ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-amber-200 hover:border-amber-400',
      purple: selected ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-purple-200 hover:border-purple-400',
      yellow: selected ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-yellow-200 hover:border-yellow-400'
    }
    return colors[color as keyof typeof colors] || 'border-gray-200 hover:border-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-800">감각 표현</h1>
            <div className="text-sm text-blue-600">3 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '75%' }}
            ></div>
          </div>

          {/* 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                ☕ 카페 모드
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-blue-800">{cafeData.coffee_name}</p>
              <p className="text-sm text-blue-600">{cafeData.cafe_name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Foundation 문서의 헤더 구조 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">느껴지는 감각을 자유롭게 선택해주세요</h2>
            <p className="text-blue-600 mb-4">각 카테고리에서 최대 3개까지 선택 가능</p>
            
            {/* Foundation 문서의 선택 카운터 */}
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              <span className="text-sm font-medium text-blue-600">
                총 {getTotalSelected()}개 선택됨
              </span>
            </div>
          </div>

          {/* 선택된 향미 표시 */}
          {flavorSelection.selectedFlavors.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-700 mb-2">선택한 향미</h4>
              <div className="flex flex-wrap gap-2">
                {flavorSelection.selectedFlavors.map((flavorChoice, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                  >
                    {/* Level 2 이름 표시 (실제로는 ID만 있으므로 임시로 ID 표시) */}
                    {flavorChoice.level2}
                    {flavorChoice.level3 && flavorChoice.level3.length > 0 && 
                      ` (${flavorChoice.level3.join(', ')})`
                    }
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Foundation 문서의 카테고리 탭 네비게이션 */}
          <div className="bg-white rounded-xl p-1 shadow-sm">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
              {Object.entries(KOREAN_SENSORY_EXPRESSIONS).map(([categoryId, category]) => {
                const isActive = activeCategory === categoryId
                const count = getCategoryCount(categoryId)
                
                return (
                  <button
                    key={categoryId}
                    onClick={() => setActiveCategory(categoryId)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      isActive 
                        ? `${getColorClasses(category.color, true)} shadow-sm` 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div className="text-xs font-medium">{category.name}</div>
                    {count > 0 && (
                      <div className="text-xs mt-1 opacity-75">{count}/3</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Foundation 문서의 감각 표현 선택 영역 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {Object.entries(KOREAN_SENSORY_EXPRESSIONS).map(([categoryId, category]) => {
              if (categoryId !== activeCategory) return null

              const categorySelections = selectedExpressions[categoryId] || []
              const isMaxReached = categorySelections.length >= 3

              return (
                <div key={categoryId}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    {category.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({categorySelections.length}/3)
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.expressions.map((expression) => {
                      const isSelected = categorySelections.includes(expression)
                      const isDisabled = !isSelected && isMaxReached
                      
                      return (
                        <button
                          key={expression}
                          onClick={() => handleExpressionToggle(categoryId, expression)}
                          disabled={isDisabled}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? getColorClasses(category.color, true)
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : `${getColorClasses(category.color)} text-gray-700 hover:bg-gray-50`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{expression}</span>
                            {isSelected && (
                              <Check className="h-5 w-5 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Foundation 문서의 선택된 감각 표현 요약 */}
          {getTotalSelected() > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-700 mb-3">카테고리별 선택된 표현</h4>
              <div className="space-y-2">
                {Object.entries(selectedExpressions).map(([categoryId, expressions]) => {
                  if (expressions.length === 0) return null
                  
                  const category = KOREAN_SENSORY_EXPRESSIONS[categoryId as keyof typeof KOREAN_SENSORY_EXPRESSIONS]
                  
                  return (
                    <div key={categoryId} className="flex items-start space-x-2">
                      <span className="text-lg">{category?.icon}</span>
                      <div>
                        <span className="text-sm font-medium text-blue-800">{category?.name}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {expressions.map((expr, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {expr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
            className="flex-2 py-4 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium flex items-center justify-center"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-500">다음: 개인 코멘트 및 완료</p>
        </div>
      </div>
    </div>
  )
}