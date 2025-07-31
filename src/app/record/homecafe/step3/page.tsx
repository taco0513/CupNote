'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Check,
  Coffee
} from 'lucide-react'
import Navigation from '../../../../components/Navigation'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'pro'
}

interface HomeCafeData {
  dripper: string
  coffeeAmount: number
  waterAmount: number
  ratio: number
  grindSize?: string
  grinderBrand?: string
  grinderModel?: string
  grinderSetting?: string
  waterTemp?: number
  brewTime?: number
  notes?: string
  timerData?: any
}

// Foundation 문서 기반 향미 데이터베이스
const FLAVOR_DATABASE = {
  Fruity: [
    'Strawberry', 'Apple', 'Orange', 'Cherry', 'Blueberry', 
    'Grape', 'Lemon', 'Peach', 'Pineapple', 'Blackberry'
  ],
  Nutty: [
    'Almond', 'Hazelnut', 'Walnut', 'Peanut', 
    'Pecan', 'Pistachio', 'Cashew', 'Brazil Nut'
  ],
  Chocolate: [
    'Dark Chocolate', 'Milk Chocolate', 'White Chocolate', 
    'Cocoa', 'Cacao', 'Chocolate Powder'
  ],
  Spicy: [
    'Cinnamon', 'Vanilla', 'Clove', 'Nutmeg', 
    'Cardamom', 'Ginger', 'Black Pepper', 'Star Anise'
  ],
  Floral: [
    'Jasmine', 'Rose', 'Lavender', 'Hibiscus', 
    'Bergamot', 'Orange Blossom', 'Elderflower'
  ],
  Other: [
    'Caramel', 'Honey', 'Maple Syrup', 'Brown Sugar', 
    'Tobacco', 'Earth', 'Wood', 'Wine', 'Tea'
  ]
}

export default function HomeCafeStep3Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [homeCafeData, setHomeCafeData] = useState<HomeCafeData | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const savedHomeCafe = sessionStorage.getItem('recordHomeCafe')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      if (data1.mode !== 'homecafe') {
        router.push('/mode-selection')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
    
    if (savedHomeCafe) {
      setHomeCafeData(JSON.parse(savedHomeCafe))
    } else {
      router.push('/record/homecafe')
      return
    }
  }, [router])

  const handleFlavorToggle = (flavor: string) => {
    setSelectedFlavors(prev => {
      if (prev.includes(flavor)) {
        return prev.filter(f => f !== flavor)
      }
      if (prev.length >= 5) {
        return prev // Foundation 문서의 최대 5개 제한
      }
      return [...prev, flavor]
    })
  }

  const handleNext = () => {
    // Foundation 문서의 출력 데이터 구조
    const flavorSelection = {
      selected_flavors: selectedFlavors.map(flavor => ({
        name: flavor,
        category: getCategoryForFlavor(flavor)
      })),
      selection_timestamp: new Date(),
      selection_duration: Math.round((Date.now() - startTime) / 1000)
    }
    
    sessionStorage.setItem('homecafeStep3', JSON.stringify(flavorSelection))
    router.push('/record/homecafe/step4')
  }

  const getCategoryForFlavor = (flavor: string): string => {
    for (const [category, flavors] of Object.entries(FLAVOR_DATABASE)) {
      if (flavors.includes(flavor)) {
        return category
      }
    }
    return 'Other'
  }

  const handleBack = () => {
    router.push('/record/homecafe')
  }

  if (!step1Data || !homeCafeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-800">향미 선택</h1>
            <div className="text-sm text-green-600">3 / 5</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-green-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '60%' }}
            ></div>
          </div>

          {/* 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🏠 홈카페 모드
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-green-800">{step1Data.coffeeName}</p>
              {step1Data.roastery && (
                <p className="text-sm text-green-600">{step1Data.roastery}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Foundation 문서의 헤더 구조 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">느껴지는 향미를 최대 5개까지 선택해주세요</h2>
            
            {/* Foundation 문서의 선택 카운터 */}
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              <span className="text-sm font-medium text-green-600">
                {selectedFlavors.length}/5 selected
              </span>
            </div>
          </div>

          {/* 추출 정보 요약 */}
          {homeCafeData.timerData && (
            <div className="bg-white rounded-xl p-4 border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center">
                <Coffee className="h-4 w-4 mr-2" />
                추출 정보
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <p className="text-green-600">{homeCafeData.dripper.toUpperCase()}</p>
                  <p className="font-medium text-green-800">드리퍼</p>
                </div>
                <div>
                  <p className="text-green-600">1:{homeCafeData.ratio}</p>
                  <p className="font-medium text-green-800">비율</p>
                </div>
                <div>
                  <p className="text-green-600">
                    {Math.floor(homeCafeData.timerData.totalTime / 60)}:
                    {(homeCafeData.timerData.totalTime % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="font-medium text-green-800">시간</p>
                </div>
              </div>
            </div>
          )}

          {/* Foundation 문서의 6개 카테고리 구조 */}
          <div className="space-y-4">
            {Object.entries(FLAVOR_DATABASE).map(([categoryName, flavors]) => {
              const icons = {
                'Fruity': '🍓',
                'Nutty': '🌰', 
                'Chocolate': '🍫',
                'Spicy': '🌿',
                'Floral': '🌸',
                'Other': '🌾'
              }
              
              return (
                <div key={categoryName} className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-3">{icons[categoryName as keyof typeof icons]}</span>
                    {categoryName === 'Fruity' ? '과일류' :
                     categoryName === 'Nutty' ? '견과류' :
                     categoryName === 'Chocolate' ? '초콜릿' :
                     categoryName === 'Spicy' ? '향신료' :
                     categoryName === 'Floral' ? '꽃향' : '기타'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {flavors.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => handleFlavorToggle(flavor)}
                        disabled={!selectedFlavors.includes(flavor) && selectedFlavors.length >= 5}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedFlavors.includes(flavor)
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : selectedFlavors.length >= 5
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-green-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{flavor}</span>
                          {selectedFlavors.includes(flavor) && (
                            <Check className="h-4 w-4 ml-1 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Foundation 문서의 선택된 향미 프리뷰 */}
          {selectedFlavors.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="text-sm font-medium text-green-700 mb-3">선택된 향미 프리뷰</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFlavors.map((flavor) => (
                  <span
                    key={flavor}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {flavor}
                  </span>
                ))}
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
            disabled={selectedFlavors.length === 0}
            className="flex-2 py-4 px-8 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-green-500">다음: 한국어 감각 표현</p>
        </div>
      </div>
    </div>
  )
}