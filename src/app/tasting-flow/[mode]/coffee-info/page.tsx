'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Coffee, 
  Search, 
  X, 
  Info, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Thermometer,
  Snowflake,
  Mountain,
  Wheat,
  Factory
} from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, TastingMode, CoffeeInfo } from '../../../../types/tasting-flow.types'

// Sample coffee database (실제로는 Supabase에서 가져올 데이터)
const SAMPLE_CAFES = [
  { id: '1', name: '블루보틀 성수점', location: '성수동' },
  { id: '2', name: '앤썸 성수점', location: '성수동' },
  { id: '3', name: '테라로사 성수점', location: '성수동' },
  { id: '4', name: '프릳츠 성수점', location: '성수동' },
  { id: '5', name: '커피 컨티뉴엄', location: '홍대' },
]

const SAMPLE_ROASTERS = [
  { id: '1', name: '블루보틀', region: '미국' },
  { id: '2', name: '앤썸', region: '한국' },
  { id: '3', name: '테라로사', region: '한국' },
  { id: '4', name: '프릳츠', region: '독일' },
  { id: '5', name: '파이브브루잉', region: '한국' },
]

const SAMPLE_COFFEES = [
  { id: '1', name: '에티오피아 예가체프', roasterId: '1', cafeId: '1', origin: '에티오피아', variety: '헤어룸', processing: '워시드', roastLevel: '미디엄', altitude: 1800 },
  { id: '2', name: '과테말라 안티구아', roasterId: '5', cafeId: '2', origin: '과테말라', variety: '부르봉', processing: '내추럴', roastLevel: '미디엄 다크', altitude: 1600 },
  { id: '3', name: '콜롬비아 수프레모', roasterId: '2', cafeId: '2', origin: '콜롬비아', variety: '카투라', processing: '워시드', roastLevel: '미디엄', altitude: 1400 },
  { id: '4', name: '케냐 AA', roasterId: '3', cafeId: '3', origin: '케냐', variety: 'SL28', processing: '워시드', roastLevel: '미디엄 라이트', altitude: 1700 },
  { id: '5', name: '브라질 산토스', roasterId: '4', cafeId: '4', origin: '브라질', variety: '부르봉', processing: '펄프드 내추럴', roastLevel: '다크', altitude: 1200 },
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

  // Cascade 자동완성을 위한 상태
  const [cafeQuery, setCafeQuery] = useState('')
  const [roasterQuery, setRoasterQuery] = useState('')
  const [coffeeQuery, setCoffeeQuery] = useState('')
  
  const [selectedCafe, setSelectedCafe] = useState<typeof SAMPLE_CAFES[0] | null>(null)
  const [selectedRoaster, setSelectedRoaster] = useState<typeof SAMPLE_ROASTERS[0] | null>(null)
  const [selectedCoffee, setSelectedCoffee] = useState<typeof SAMPLE_COFFEES[0] | null>(null)
  
  const [showCafeResults, setShowCafeResults] = useState(false)
  const [showRoasterResults, setShowRoasterResults] = useState(false)
  const [showCoffeeResults, setShowCoffeeResults] = useState(false)
  
  // 온도 선택 (필수)
  const [temperature, setTemperature] = useState<'hot' | 'iced' | ''>('')
  
  // Progressive Disclosure - 추가 정보 섹션
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState({
    origin: '',
    variety: '',
    processing: '',
    roastLevel: '',
    altitude: '',
  })
  
  // 기본 정보 (직접 입력)
  const [manualInput, setManualInput] = useState({
    cafeName: '',
    roasterName: '',
    coffeeName: '',
  })
  
  const [tastingDate, setTastingDate] = useState(new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cascade 검색 결과 필터링
  const cafeResults = SAMPLE_CAFES.filter(cafe => 
    cafe.name.toLowerCase().includes(cafeQuery.toLowerCase())
  )

  const roasterResults = SAMPLE_ROASTERS.filter(roaster => 
    roaster.name.toLowerCase().includes(roasterQuery.toLowerCase())
  )

  const coffeeResults = SAMPLE_COFFEES.filter(coffee => {
    const matchesName = coffee.name.toLowerCase().includes(coffeeQuery.toLowerCase())
    const matchesRoaster = selectedRoaster ? coffee.roasterId === selectedRoaster.id : true
    const matchesCafe = selectedCafe ? coffee.cafeId === selectedCafe.id : true
    return matchesName && matchesRoaster && matchesCafe
  })

  // Cascade 핸들러 함수들
  const handleCafeSelect = (cafe: typeof SAMPLE_CAFES[0]) => {
    setSelectedCafe(cafe)
    setCafeQuery(cafe.name)
    setManualInput(prev => ({ ...prev, cafeName: cafe.name }))
    setShowCafeResults(false)
    
    // 로스터 필터링을 위해 리셋
    setSelectedRoaster(null)
    setRoasterQuery('')
    setSelectedCoffee(null)
    setCoffeeQuery('')
  }

  const handleRoasterSelect = (roaster: typeof SAMPLE_ROASTERS[0]) => {
    setSelectedRoaster(roaster)
    setRoasterQuery(roaster.name)
    setManualInput(prev => ({ ...prev, roasterName: roaster.name }))
    setShowRoasterResults(false)
    
    // 커피 필터링을 위해 리셋
    setSelectedCoffee(null)
    setCoffeeQuery('')
  }

  const handleCoffeeSelect = (coffee: typeof SAMPLE_COFFEES[0]) => {
    setSelectedCoffee(coffee)
    setCoffeeQuery(coffee.name)
    setManualInput(prev => ({ ...prev, coffeeName: coffee.name }))
    setShowCoffeeResults(false)
    
    // 선택정보 자동입력 (Smart Defaults)
    setAdditionalInfo({
      origin: coffee.origin,
      variety: coffee.variety,
      processing: coffee.processing,
      roastLevel: coffee.roastLevel,
      altitude: coffee.altitude.toString(),
    })
    
    // 추가 정보가 있으면 Progressive Disclosure 섹션 자동 펼치기
    if (coffee.origin || coffee.variety || coffee.processing || coffee.roastLevel || coffee.altitude) {
      setShowAdditionalInfo(true)
    }
  }

  const handleManualInput = (field: 'cafeName' | 'roasterName' | 'coffeeName', value: string) => {
    setManualInput(prev => ({ ...prev, [field]: value }))
    
    // 해당 선택 상태 리셋
    if (field === 'cafeName') {
      setSelectedCafe(null)
      setCafeQuery(value)
    } else if (field === 'roasterName') {
      setSelectedRoaster(null)
      setRoasterQuery(value)
    } else if (field === 'coffeeName') {
      setSelectedCoffee(null)
      setCoffeeQuery(value)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 모드별 필수 필드 검증
    if (mode === 'cafe' && !manualInput.cafeName.trim()) {
      newErrors.cafeName = '카페명을 입력해주세요'
    }
    if (!manualInput.roasterName.trim()) {
      newErrors.roasterName = '로스터명을 입력해주세요'
    }
    if (!manualInput.coffeeName.trim()) {
      newErrors.coffeeName = '커피명을 입력해주세요'
    }
    if (!temperature) {
      newErrors.temperature = '온도를 선택해주세요'
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
        // 모드별 필수 정보
        cafeName: mode === 'cafe' ? manualInput.cafeName : undefined,
        roasterName: manualInput.roasterName,
        coffeeName: manualInput.coffeeName,
        temperature,
        
        // 선택 정보 (Progressive Disclosure)
        origin: additionalInfo.origin || undefined,
        variety: additionalInfo.variety || undefined,
        processing: additionalInfo.processing || undefined,
        roastLevel: additionalInfo.roastLevel || undefined,
        altitude: additionalInfo.altitude ? parseInt(additionalInfo.altitude) : undefined,
        
        // 메타데이터
        isNewCoffee: !selectedCoffee,
        autoFilled: !!selectedCoffee,
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
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">커피 정보</h1>
              {/* 모드 표시 */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                mode === 'cafe' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {mode === 'cafe' ? '☕ 카페' : '🏠 홈카페'}
              </div>
            </div>
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

        <div className="space-y-6">
          {/* 필수 정보 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-100 rounded-full mb-4">
                <Coffee className="h-8 w-8 text-coffee-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
                어떤 커피를 {mode === 'cafe' ? '마셨나요' : '내리셨나요'}?
              </h2>
              <p className="text-coffee-600">필수 정보를 입력해주세요</p>
            </div>

            <div className="space-y-6">
              {/* Cafe 모드만: 카페명 Cascade 자동완성 */}
              {mode === 'cafe' && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    카페명 *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={cafeQuery}
                      onChange={(e) => {
                        setCafeQuery(e.target.value)
                        handleManualInput('cafeName', e.target.value)
                        setShowCafeResults(true)
                      }}
                      onFocus={() => setShowCafeResults(true)}
                      onBlur={() => setTimeout(() => setShowCafeResults(false), 200)}
                      placeholder="카페명을 검색하거나 입력해주세요"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                        errors.cafeName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  {/* 카페 검색 결과 */}
                  {showCafeResults && cafeQuery && cafeResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {cafeResults.map((cafe) => (
                        <button
                          key={cafe.id}
                          onClick={() => handleCafeSelect(cafe)}
                          className="w-full px-4 py-3 text-left hover:bg-coffee-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-coffee-800">{cafe.name}</div>
                          <div className="text-sm text-coffee-600">{cafe.location}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.cafeName && <p className="mt-1 text-sm text-red-600">{errors.cafeName}</p>}
                </div>
              )}

              {/* 로스터명 Cascade 자동완성 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Factory className="inline h-4 w-4 mr-1" />
                  로스터명 *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={roasterQuery}
                    onChange={(e) => {
                      setRoasterQuery(e.target.value)
                      handleManualInput('roasterName', e.target.value)
                      setShowRoasterResults(true)
                    }}
                    onFocus={() => setShowRoasterResults(true)}
                    onBlur={() => setTimeout(() => setShowRoasterResults(false), 200)}
                    placeholder="로스터명을 검색하거나 입력해주세요"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                      errors.roasterName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                
                {/* 로스터 검색 결과 */}
                {showRoasterResults && roasterQuery && roasterResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {roasterResults.map((roaster) => (
                      <button
                        key={roaster.id}
                        onClick={() => handleRoasterSelect(roaster)}
                        className="w-full px-4 py-3 text-left hover:bg-coffee-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-coffee-800">{roaster.name}</div>
                        <div className="text-sm text-coffee-600">{roaster.region}</div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.roasterName && <p className="mt-1 text-sm text-red-600">{errors.roasterName}</p>}
              </div>

              {/* 커피명 Cascade 자동완성 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Coffee className="inline h-4 w-4 mr-1" />
                  커피명 *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={coffeeQuery}
                    onChange={(e) => {
                      setCoffeeQuery(e.target.value)
                      handleManualInput('coffeeName', e.target.value)
                      setShowCoffeeResults(true)
                    }}
                    onFocus={() => setShowCoffeeResults(true)}
                    onBlur={() => setTimeout(() => setShowCoffeeResults(false), 200)}
                    placeholder="커피명을 검색하거나 입력해주세요"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                      errors.coffeeName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                
                {/* 커피 검색 결과 */}
                {showCoffeeResults && coffeeQuery && coffeeResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {coffeeResults.map((coffee) => (
                      <button
                        key={coffee.id}
                        onClick={() => handleCoffeeSelect(coffee)}
                        className="w-full px-4 py-3 text-left hover:bg-coffee-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-coffee-800">{coffee.name}</div>
                        <div className="text-sm text-coffee-600">{coffee.origin} • {coffee.roastLevel}</div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.coffeeName && <p className="mt-1 text-sm text-red-600">{errors.coffeeName}</p>}
              </div>

              {/* 온도 선택 (필수) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  온도 *
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTemperature('hot')}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                      temperature === 'hot'
                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Thermometer className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">뜨거움</div>
                    <div className="text-sm text-gray-500">Hot</div>
                  </button>
                  <button
                    onClick={() => setTemperature('iced')}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                      temperature === 'iced'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Snowflake className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">차가움</div>
                    <div className="text-sm text-gray-500">Iced</div>
                  </button>
                </div>
                {errors.temperature && <p className="mt-2 text-sm text-red-600">{errors.temperature}</p>}
              </div>

              {/* 날짜 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  테이스팅 날짜
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
          </div>

          {/* Progressive Disclosure - 추가 정보 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <button
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <h3 className="text-lg font-bold text-coffee-800">
                추가 정보 {additionalInfo.origin || additionalInfo.variety || additionalInfo.processing || additionalInfo.roastLevel || additionalInfo.altitude ? '(자동 입력됨)' : '(선택)'}
              </h3>
              {showAdditionalInfo ? (
                <ChevronUp className="h-5 w-5 text-coffee-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-coffee-600" />
              )}
            </button>

            {showAdditionalInfo && (
              <div className="mt-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      원산지
                    </label>
                    <input
                      type="text"
                      value={additionalInfo.origin}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, origin: e.target.value }))}
                      placeholder="예: 에티오피아"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Wheat className="inline h-4 w-4 mr-1" />
                      품종
                    </label>
                    <input
                      type="text"
                      value={additionalInfo.variety}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, variety: e.target.value }))}
                      placeholder="예: 헤어룸, 부르봉"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가공방식
                    </label>
                    <input
                      type="text"
                      value={additionalInfo.processing}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, processing: e.target.value }))}
                      placeholder="예: 워시드, 내추럴"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      로스팅 레벨
                    </label>
                    <input
                      type="text"
                      value={additionalInfo.roastLevel}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, roastLevel: e.target.value }))}
                      placeholder="예: 미디엄, 다크"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mountain className="inline h-4 w-4 mr-1" />
                      고도 (m)
                    </label>
                    <input
                      type="number"
                      value={additionalInfo.altitude}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, altitude: e.target.value }))}
                      placeholder="예: 1800"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Smart Defaults 안내 */}
                {selectedCoffee && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      💡 선택한 커피의 정보가 자동으로 입력되었습니다. 필요시 수정 가능합니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Cascade 자동완성 시스템</p>
                <p>
                  {mode === 'cafe' ? '카페 → 로스터 → 커피' : '로스터 → 커피'} 순서로 선택하면 
                  해당 조합의 커피만 필터링되어 정확한 정보를 찾을 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            className="w-full py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!temperature || !manualInput.roasterName || !manualInput.coffeeName || (mode === 'cafe' && !manualInput.cafeName)}
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          {/* 필수 입력 안내 */}
          {(!temperature || !manualInput.roasterName || !manualInput.coffeeName || (mode === 'cafe' && !manualInput.cafeName)) && (
            <p className="mt-2 text-sm text-red-600 text-center">
              필수 정보를 모두 입력해주세요
            </p>
          )}
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">
            다음: {mode === 'homecafe' ? '🏠 추출 설정' : '🎨 향미 선택'}
          </p>
        </div>
      </div>
    </div>
  )
}