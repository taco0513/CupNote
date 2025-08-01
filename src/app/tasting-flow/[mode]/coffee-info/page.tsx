'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Coffee, Search, X, Info, Calendar, MapPin, ArrowRight, ChevronDown } from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, TastingMode, CoffeeInfo } from '../../../../types/tasting-flow.types'

// Sample coffee database (실제로는 Supabase에서 가져올 데이터)
const POPULAR_COFFEES = [
  { id: '1', name: '에티오피아 예가체프', roastery: '블루보틀', origin: '에티오피아' },
  { id: '2', name: '과테말라 안티구아', roastery: '파이브브루잉', origin: '과테말라' },
  { id: '3', name: '콜롬비아 수프레모', roastery: '앤썸', origin: '콜롬비아' },
  { id: '4', name: '케냐 AA', roastery: '테라로사', origin: '케냐' },
  { id: '5', name: '브라질 산토스', roastery: '프릳츠', origin: '브라질' },
]

export default function CoffeeInfoPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  // Feature flag 체크
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_NEW_TASTING_FLOW')) {
      router.push('/mode-selection')
      return
    }

    // 유효한 모드 체크
    if (mode !== 'cafe' && mode !== 'homecafe') {
      router.push('/tasting-flow')
      return
    }

    // 세션 초기화
    const existingSession = sessionStorage.getItem('tf_session')
    if (!existingSession) {
      const newSession: Partial<TastingSession> = {
        mode,
        startedAt: new Date().toISOString(),
        currentScreen: 'coffee-info',
      }
      sessionStorage.setItem('tf_session', JSON.stringify(newSession))
    }
  }, [mode, router])

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeInfo | null>(null)
  const [customCoffee, setCustomCoffee] = useState({
    name: '',
    roastery: '',
    origin: '',
  })
  const [purchaseLocation, setPurchaseLocation] = useState('')
  const [tastingDate, setTastingDate] = useState(new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 검색 결과 필터링
  const searchResults = POPULAR_COFFEES.filter(coffee => 
    coffee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coffee.roastery.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coffee.origin.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCoffeeSelect = (coffee: typeof POPULAR_COFFEES[0]) => {
    setSelectedCoffee({
      name: coffee.name,
      roastery: coffee.roastery,
      origin: coffee.origin,
    })
    setCustomCoffee({
      name: coffee.name,
      roastery: coffee.roastery,
      origin: coffee.origin,
    })
    setSearchQuery(coffee.name)
    setShowSearchResults(false)
  }

  const handleCustomInput = () => {
    setSelectedCoffee(null)
    setShowSearchResults(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!customCoffee.name.trim()) {
      newErrors.name = '커피 이름을 입력해주세요'
    }
    if (!customCoffee.roastery.trim()) {
      newErrors.roastery = '로스터리를 입력해주세요'
    }
    if (mode === 'cafe' && !purchaseLocation.trim()) {
      newErrors.location = '구매/음용 장소를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    // 세션 업데이트
    const session = JSON.parse(sessionStorage.getItem('tf_session') || '{}')
    const updatedSession: Partial<TastingSession> = {
      ...session,
      coffeeInfo: {
        name: customCoffee.name,
        roastery: customCoffee.roastery,
        origin: customCoffee.origin,
        purchaseLocation: mode === 'cafe' ? purchaseLocation : undefined,
      },
      tastingDate,
    }
    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))

    // 다음 페이지로 이동
    if (mode === 'homecafe') {
      router.push('/tasting-flow/homecafe/brew-setup')
    } else {
      router.push(`/tasting-flow/${mode}/flavor-selection`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">커피 정보</h1>
            <div className="text-sm text-coffee-600">1 / {mode === 'cafe' ? '6' : '7'}</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: mode === 'cafe' ? '16.67%' : '14.29%' }}
            />
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-100 rounded-full mb-4">
              <Coffee className="h-8 w-8 text-coffee-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
              어떤 커피를 {mode === 'cafe' ? '마셨나요' : '내리셨나요'}?
            </h2>
            <p className="text-coffee-600">커피 정보를 검색하거나 직접 입력해주세요</p>
          </div>

          <div className="space-y-6">
            {/* 커피 검색/선택 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                커피 검색 *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(true)
                    handleCustomInput()
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="커피 이름, 로스터리, 원산지로 검색"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>

              {/* 검색 결과 드롭다운 */}
              {showSearchResults && searchQuery && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {searchResults.map((coffee) => (
                    <button
                      key={coffee.id}
                      onClick={() => handleCoffeeSelect(coffee)}
                      className="w-full px-4 py-3 text-left hover:bg-coffee-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-coffee-800">{coffee.name}</div>
                      <div className="text-sm text-coffee-600">{coffee.roastery} • {coffee.origin}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* 직접 입력 안내 */}
              {searchQuery && searchResults.length === 0 && showSearchResults && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">검색 결과가 없습니다. 아래에 직접 입력해주세요.</p>
                </div>
              )}
            </div>

            {/* 선택된 커피 표시 */}
            {selectedCoffee && (
              <div className="p-4 bg-coffee-50 rounded-xl border border-coffee-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-coffee-800">{selectedCoffee.name}</p>
                    <p className="text-sm text-coffee-600">{selectedCoffee.roastery} • {selectedCoffee.origin}</p>
                  </div>
                  <button
                    onClick={handleCustomInput}
                    className="p-2 hover:bg-coffee-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-coffee-600" />
                  </button>
                </div>
              </div>
            )}

            {/* 직접 입력 폼 */}
            {!selectedCoffee && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    커피 이름 *
                  </label>
                  <input
                    type="text"
                    value={customCoffee.name}
                    onChange={(e) => setCustomCoffee({ ...customCoffee, name: e.target.value })}
                    placeholder="예: 에티오피아 예가체프"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    로스터리 *
                  </label>
                  <input
                    type="text"
                    value={customCoffee.roastery}
                    onChange={(e) => setCustomCoffee({ ...customCoffee, roastery: e.target.value })}
                    placeholder="예: 블루보틀"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                      errors.roastery ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.roastery && <p className="mt-1 text-sm text-red-600">{errors.roastery}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    원산지 (선택)
                  </label>
                  <input
                    type="text"
                    value={customCoffee.origin}
                    onChange={(e) => setCustomCoffee({ ...customCoffee, origin: e.target.value })}
                    placeholder="예: 에티오피아"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* 카페 모드: 구매/음용 장소 */}
            {mode === 'cafe' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  구매/음용 장소 *
                </label>
                <input
                  type="text"
                  value={purchaseLocation}
                  onChange={(e) => setPurchaseLocation(e.target.value)}
                  placeholder="예: 스타벅스 강남점"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            )}

            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                날짜
              </label>
              <input
                type="date"
                value={tastingDate}
                onChange={(e) => setTastingDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                검색으로 찾을 수 없다면 직접 입력해주세요. 
                나중에 더 많은 정보를 추가할 수 있어요.
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            className="w-full py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">
            다음: {mode === 'homecafe' ? '추출 설정' : '향미 선택'}
          </p>
        </div>
      </div>
    </div>
  )
}