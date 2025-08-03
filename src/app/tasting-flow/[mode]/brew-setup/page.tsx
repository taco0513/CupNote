'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { 
  Coffee, 
  ArrowRight, 
  ArrowLeft, 
  Droplets, 
  Scale, 
  Thermometer, 
  Clock,
  Plus,
  Minus,
  Info,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Save,
  FileInput
} from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import { 
  getHomeCafeEquipment, 
  getBrewingMethodSuggestions,
  getGrinderSuggestions,
  getGrindSizeRecommendations,
  getBrewingRecommendations 
} from '../../../../utils/equipment-settings'

import type { TastingSession, BrewSetup } from '../../../../types/tasting-flow.types'
import '../../../../utils/demo-equipment' // 개발 모드에서 데모 함수 사용 가능

// 기본 드리퍼 옵션 (사용자 설정에 따라 동적으로 업데이트됨)
const getDefaultDripperOptions = () => {
  const userBrewingMethod = getHomeCafeEquipment().brewingMethod
  
  const baseOptions = [
    { id: 'v60', name: 'V60', icon: '☕', description: '깔끔하고 밝은 맛' },
    { id: 'kalita-wave', name: 'Kalita Wave', icon: '🌊', description: '균형 잡힌 바디감' },
    { id: 'origami', name: 'Origami', icon: '🏮', description: '다재다능한 추출' },
    { id: 'april', name: 'April', icon: '🌸', description: '균형 잡힌 맛' },
    { id: 'aeropress', name: 'AeroPress', icon: '🔧', description: '풍부하고 깔끔한 맛' },
    { id: 'french-press', name: 'French Press', icon: '🫖', description: '진하고 풀바디' },
    { id: 'other', name: '기타', icon: '⚙️', description: '직접 입력' }
  ]
  
  // 사용자 장비가 기본 옵션에 없으면 맨 앞에 추가
  if (userBrewingMethod && !baseOptions.some(option => 
    option.name.toLowerCase() === userBrewingMethod.toLowerCase() ||
    option.id === userBrewingMethod.toLowerCase().replace(/\s+/g, '-')
  )) {
    baseOptions.unshift({
      id: 'user-equipment',
      name: userBrewingMethod,
      icon: '⭐',
      description: '내 장비'
    })
  }
  
  return baseOptions
}

// 7개 세분화된 비율 프리셋
const RATIO_PRESETS = [
  { ratio: 15, label: '1:15', description: '진한 맛' },
  { ratio: 15.5, label: '1:15.5', description: '' },
  { ratio: 16, label: '1:16', description: '균형' },
  { ratio: 16.5, label: '1:16.5', description: '' },
  { ratio: 17, label: '1:17', description: '순한 맛' },
  { ratio: 17.5, label: '1:17.5', description: '' },
  { ratio: 18, label: '1:18', description: '가벼운 맛' },
]

export default function BrewSetupPage() {
  const router = useRouter()

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [dripperOptions, setDripperOptions] = useState(getDefaultDripperOptions())
  
  // 사용자 장비 설정 불러오기
  const userEquipment = getHomeCafeEquipment()
  const grindRecommendations = getGrindSizeRecommendations(userEquipment.grinder)
  const brewingRecommendations = getBrewingRecommendations(userEquipment)
  
  const [brewSetup, setBrewSetup] = useState<BrewSetup>({
    dripper: '',
    coffeeAmount: 20,
    waterAmount: 320, // 20g * 16 = 320ml (기본 비율 1:16)
    ratio: 16,
    grindSize: '',
    waterTemp: 92,
    brewTime: 0,
  })
  
  // 분쇄도 세팅 - 자유 형식 입력
  const [grindSetting, setGrindSetting] = useState('')
  
  // 키패드 모드
  const [showKeypad, setShowKeypad] = useState(false)
  const [keypadValue, setKeypadValue] = useState('20')
  
  // 타이머 관련
  const [timerRunning, setTimerRunning] = useState(false)
  const [bloomTime, setBloomTime] = useState(0) // 1차 추출(블룸) 시간
  const [totalTime, setTotalTime] = useState(0) // 총 시간
  const [lapTimes, setLapTimes] = useState<Array<{ time: number; note: string; timestamp: Date }>>([])
  const [lapNote, setLapNote] = useState('')
  
  // 간단 노트
  const [quickNote, setQuickNote] = useState('')
  
  // 레시피 저장
  const [showSaveRecipe, setShowSaveRecipe] = useState(false)
  const [savedRecipe, setSavedRecipe] = useState<any>(null)
  
  // 기타 상태
  const [customDripper, setCustomDripper] = useState('')
  
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
    if (parsedSession.mode !== 'homecafe') {
      router.push('/tasting-flow')
      return
    }

    setSession(parsedSession)
    
    // 세션에서 기존 brewSetup 데이터 복원
    if (parsedSession.brewSetup) {
      const existingBrewSetup = parsedSession.brewSetup
      
      // 기본 brewSetup 데이터 복원
      if (existingBrewSetup.dripper) {
        setBrewSetup(prev => ({
          ...prev,
          ...existingBrewSetup
        }))
      }
      
      // 타이머 데이터 안전하게 복원
      if (existingBrewSetup.timerData) {
        const timerData = existingBrewSetup.timerData
        if (typeof timerData.totalTime === 'number') {
          setTotalTime(timerData.totalTime)
        }
        if (Array.isArray(timerData.lapTimes)) {
          setLapTimes(timerData.lapTimes)
        }
        // lapTimes가 boolean이거나 잘못된 타입이면 빈 배열로 초기화
        if (timerData.lapTimes && !Array.isArray(timerData.lapTimes)) {
          console.warn('lapTimes가 배열이 아닙니다. 빈 배열로 초기화합니다:', timerData.lapTimes)
          setLapTimes([])
        }
      }
    } else {
      // 기존 데이터가 없으면 사용자 장비 설정을 기본값으로 사용
      if (userEquipment.brewingMethod) {
        const matchedOption = dripperOptions.find(option => 
          option.name.toLowerCase() === userEquipment.brewingMethod.toLowerCase() ||
          option.id === userEquipment.brewingMethod.toLowerCase().replace(/\s+/g, '-')
        )
        
        if (matchedOption) {
          setBrewSetup(prev => ({ ...prev, dripper: matchedOption.id }))
        } else if (userEquipment.brewingMethod) {
          setBrewSetup(prev => ({ ...prev, dripper: 'user-equipment' }))
          setCustomDripper(userEquipment.brewingMethod)
        }
      }
      
      // 추천 비율이 있으면 적용
      if (brewingRecommendations.ratio) {
        const ratio = parseFloat(brewingRecommendations.ratio.split(':')[1])
        if (!isNaN(ratio)) {
          setBrewSetup(prev => ({
            ...prev,
            ratio,
            waterAmount: Math.round(prev.coffeeAmount * ratio)
          }))
        }
      }
      
      // 그라인더 기반 분쇄도 추천이 있으면 첫 번째 추천값 설정
      if (grindRecommendations.length > 0 && userEquipment.grinder) {
        setGrindSetting(grindRecommendations[0])
      }
    }
  }, [router, userEquipment, dripperOptions, brewingRecommendations, grindRecommendations])

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning) {
      interval = setInterval(() => {
        setTotalTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  // 저장된 레시피 불러오기
  useEffect(() => {
    const loadSavedRecipe = async () => {
      try {
        const saved = localStorage.getItem('homecafe_my_coffee_recipe')
        if (saved) {
          setSavedRecipe(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Failed to load saved recipe:', error)
      }
    }
    loadSavedRecipe()
  }, [])

  // 키패드로 원두량 입력
  const handleKeypadConfirm = () => {
    const amount = parseInt(keypadValue)
    if (amount >= 10 && amount <= 50) {
      setBrewSetup(prev => ({
        ...prev,
        coffeeAmount: amount,
        waterAmount: Math.round(amount * prev.ratio)
      }))
      setShowKeypad(false)
    }
  }

  // 원두량 변경
  const handleCoffeeAmountChange = (amount: number) => {
    if (amount >= 10 && amount <= 50) {
      setBrewSetup(prev => ({
        ...prev,
        coffeeAmount: amount,
        waterAmount: Math.round(amount * prev.ratio)
      }))
    }
  }

  // 물량 변경
  const handleWaterAmountChange = (amount: number) => {
    if (amount >= 150 && amount <= 800) {
      setBrewSetup(prev => ({
        ...prev,
        waterAmount: amount,
        ratio: Math.round((amount / prev.coffeeAmount) * 10) / 10
      }))
    }
  }

  // 비율 프리셋 선택
  const handleRatioSelect = (ratio: number) => {
    setBrewSetup(prev => ({
      ...prev,
      ratio,
      waterAmount: Math.round(prev.coffeeAmount * ratio)
    }))
  }

  // 타이머 제어
  const handleTimerStart = () => {
    setTimerRunning(true)
  }

  const handleTimerPause = () => {
    setTimerRunning(false)
  }

  const handleTimerReset = () => {
    setTimerRunning(false)
    setTotalTime(0)
    setBloomTime(0)
    setLapTimes([])
  }

  const handleBloomRecord = () => {
    if (!bloomTime && timerRunning) {
      setBloomTime(totalTime)
    }
  }

  const handleLapTime = () => {
    if (lapNote.trim() && timerRunning) {
      setLapTimes(prev => {
        // 안전하게 배열 확인
        const currentTimes = Array.isArray(prev) ? prev : []
        return [...currentTimes, {
          time: totalTime,
          note: lapNote.trim(),
          timestamp: new Date()
        }]
      })
      setLapNote('')
    }
  }

  // 레시피 저장
  const handleSaveRecipe = () => {
    const recipe = {
      name: "나의 커피",
      coffee_amount: brewSetup.coffeeAmount,
      water_amount: brewSetup.waterAmount,
      ratio: brewSetup.ratio,
      grind_setting: grindSetting,
      saved_at: new Date().toISOString()
    }
    localStorage.setItem('homecafe_my_coffee_recipe', JSON.stringify(recipe))
    setSavedRecipe(recipe)
    setShowSaveRecipe(false)
  }

  // 저장된 레시피 불러오기
  const handleLoadRecipe = () => {
    if (savedRecipe) {
      setBrewSetup(prev => ({
        ...prev,
        coffeeAmount: savedRecipe.coffee_amount,
        waterAmount: savedRecipe.water_amount,
        ratio: savedRecipe.ratio
      }))
      setGrindSetting(savedRecipe.grind_setting || '')
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!brewSetup.dripper) {
      newErrors.dripper = '드리퍼를 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    const updatedBrewSetup: BrewSetup = {
      ...brewSetup,
      grindSize: grindSetting, // 자유 형식 분쇄도 세팅
      brewTime: totalTime,
      timerData: {
        totalTime,
        lapTimes,
        completed: totalTime > 0,
      },
    }

    const updatedSession = {
      ...session,
      brewSetup: {
        ...updatedBrewSetup,
        bloomTime, // 1차 추출(블룸) 시간
        quickNote, // 간단 메모
      },
      currentScreen: 'flavor-selection',
    }

    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))
    router.push('/tasting-flow/homecafe/flavor-selection')
  }

  const handleBack = () => {
    router.push('/tasting-flow/homecafe/coffee-info')
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
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-2xl pb-20 md:pb-8">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">추출 설정</h1>
            <div className="text-sm text-coffee-600">2 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '28.57%' }}
            />
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="space-y-6">
          {/* 레시피 저장/불러오기 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-coffee-800 mb-4">나의 레시피</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* 저장된 레시피 불러오기 */}
              {savedRecipe ? (
                <button
                  onClick={handleLoadRecipe}
                  className="flex items-center justify-center p-4 border-2 border-green-500 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <FileInput className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-green-800">저장된 레시피 불러오기</div>
                    <div className="text-sm text-green-600">
                      {savedRecipe.coffee_amount}g : {savedRecipe.water_amount}ml
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-center p-4 border-2 border-gray-200 bg-gray-50 rounded-xl">
                  <div className="text-center text-gray-500 text-sm">
                    저장된 레시피가 없습니다
                  </div>
                </div>
              )}
              
              {/* 현재 레시피 저장 */}
              <button
                onClick={() => setShowSaveRecipe(true)}
                disabled={!brewSetup.dripper || brewSetup.coffeeAmount === 0}
                className="flex items-center justify-center p-4 border-2 border-coffee-500 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5 text-coffee-600 mr-2" />
                <div className="text-left">
                  <div className="font-medium text-coffee-800">현재 설정 저장</div>
                  <div className="text-sm text-coffee-600">나만의 레시피로 저장</div>
                </div>
              </button>
            </div>
          </div>

          {/* 드리퍼 선택 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Coffee className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-800 mb-2">드리퍼 선택</h2>
              <p className="text-coffee-600">어떤 도구로 내리셨나요?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {dripperOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBrewSetup(prev => ({ ...prev, dripper: option.id }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    brewSetup.dripper === option.id
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </button>
              ))}
            </div>

            {brewSetup.dripper === 'other' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={customDripper}
                  onChange={(e) => setCustomDripper(e.target.value)}
                  placeholder="드리퍼 이름을 입력해주세요"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.customDripper ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customDripper && <p className="mt-1 text-sm text-red-600">{errors.customDripper}</p>}
              </div>
            )}

            {errors.dripper && <p className="mt-2 text-sm text-red-600">{errors.dripper}</p>}
          </div>

          {/* 원두량과 물량 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-coffee-800">추출 비율</h3>
              {brewingRecommendations.ratio && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  추천: {brewingRecommendations.ratio}
                </span>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 원두량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="inline h-4 w-4 mr-1" />
                  원두량 (g)
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCoffeeAmountChange(brewSetup.coffeeAmount - 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        setKeypadValue(brewSetup.coffeeAmount.toString())
                        setShowKeypad(true)
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-bold hover:bg-gray-50 transition-colors"
                    >
                      {brewSetup.coffeeAmount}
                    </button>
                  </div>
                  <button
                    onClick={() => handleCoffeeAmountChange(brewSetup.coffeeAmount + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 물량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="inline h-4 w-4 mr-1" />
                  물량 (ml)
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleWaterAmountChange(brewSetup.waterAmount - 10)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={brewSetup.waterAmount}
                      onChange={(e) => handleWaterAmountChange(parseInt(e.target.value) || 300)}
                      min="150"
                      max="800"
                      step="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => handleWaterAmountChange(brewSetup.waterAmount + 10)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 비율 프리셋 버튼 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                추천 비율 (탭하여 선택)
              </label>
              <div className="grid grid-cols-7 gap-2">
                {RATIO_PRESETS.map((preset) => (
                  <button
                    key={preset.ratio}
                    onClick={() => handleRatioSelect(preset.ratio)}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      brewSetup.ratio === preset.ratio
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-bold">{preset.label}</div>
                    {preset.description && (
                      <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 비율 표시 */}
            <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
              <p className="text-lg font-bold text-green-800">
                1 : {brewSetup.ratio} 비율
              </p>
              <p className="text-sm text-green-600">
                {brewSetup.coffeeAmount}g : {brewSetup.waterAmount}ml
              </p>
            </div>
          </div>

          {/* 분쇄도 설정 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-coffee-800">분쇄도 설정 (선택)</h3>
              {userEquipment.grinder && (
                <span className="text-xs bg-coffee-100 text-coffee-700 px-2 py-1 rounded-full">
                  내 그라인더: {userEquipment.grinder}
                </span>
              )}
            </div>
            
            {/* 추천 분쇄도 */}
            {grindRecommendations.length > 0 && userEquipment.grinder && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userEquipment.grinder} 추천 설정
                </label>
                <div className="flex flex-wrap gap-2">
                  {grindRecommendations.map((recommendation, index) => (
                    <button
                      key={index}
                      onClick={() => setGrindSetting(recommendation)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        grindSetting === recommendation
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {recommendation}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              분쇄도 정보를 자유롭게 입력하세요
            </label>
            <input
              type="text"
              value={grindSetting}
              onChange={(e) => setGrindSetting(e.target.value)}
              placeholder={userEquipment.grinder 
                ? `예: ${userEquipment.grinder} 설정값, 또는 입자 크기 설명`
                : "예: 바라짜 세테 30M - 5E, 커맨던트 12클릭, 중간 굵기"
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              그라인더 이름과 설정값, 또는 입자 크기를 설명해주세요
              {userEquipment.grinder && " (설정에서 변경 가능)"}
            </p>
          </div>

          {/* 추출 타이머 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-coffee-800 mb-4">
              <Clock className="inline h-5 w-5 mr-2" />
              추출 타이머 (선택)
            </h3>

            <div className="text-center mb-6">
              <div className="text-6xl font-mono font-bold text-coffee-800 mb-4">
                {formatTime(totalTime)}
              </div>

              <div className="flex justify-center space-x-3">
                {!timerRunning ? (
                  <button
                    onClick={handleTimerStart}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    시작
                  </button>
                ) : (
                  <button
                    onClick={handleTimerPause}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    일시정지
                  </button>
                )}
                
                <button
                  onClick={handleTimerReset}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  리셋
                </button>
              </div>
            </div>

            {/* 블루밍 타임 기록 */}
            {timerRunning && !bloomTime && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-yellow-700">
                    <span className="font-medium">블루밍 단계</span>
                    <p className="text-xs mt-1">뜸들이기가 끝나면 버튼을 눌러주세요</p>
                  </div>
                  <button
                    onClick={handleBloomRecord}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    블루밍 완료
                  </button>
                </div>
              </div>
            )}

            {/* 블루밍 타임 표시 */}
            {bloomTime > 0 && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">블루밍 시간</span>
                  <span className="font-mono font-bold text-green-800">{formatTime(bloomTime)}</span>
                </div>
              </div>
            )}

            {/* 랩타임 기록 */}
            {timerRunning && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={lapNote}
                    onChange={(e) => setLapNote(e.target.value)}
                    placeholder="단계 메모 (예: 2차 붓기, 3차 붓기)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleLapTime()}
                  />
                  <button
                    onClick={handleLapTime}
                    disabled={!lapNote.trim()}
                    className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    기록
                  </button>
                </div>
              </div>
            )}

            {/* 랩타임 리스트 */}
            {(bloomTime > 0 || (Array.isArray(lapTimes) && lapTimes.length > 0)) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">단계별 기록</h4>
                {bloomTime > 0 && (
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-sm">
                    <span className="text-green-700 font-medium">🌸 블루밍</span>
                    <span className="font-mono font-bold text-green-800">{formatTime(bloomTime)}</span>
                  </div>
                )}
                {Array.isArray(lapTimes) && lapTimes.map((lap, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-600">{lap.note}</span>
                    <span className="font-mono font-bold text-coffee-800">{formatTime(lap.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 물 온도 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Thermometer className="inline h-4 w-4 mr-1" />
              물 온도 (°C) - 선택
            </label>
            <input
              type="number"
              value={brewSetup.waterTemp}
              onChange={(e) => setBrewSetup(prev => ({ ...prev, waterTemp: parseInt(e.target.value) || 92 }))}
              min="80"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">일반적으로 90-96°C를 사용합니다</p>
          </div>

          {/* 안내 메시지 */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  타이머는 선택사항입니다. 추출하면서 실시간으로 기록하거나, 나중에 입력해도 됩니다.
                </p>
              </div>
            </div>

            {/* 설정 페이지 링크 */}
            {(!userEquipment.grinder || !userEquipment.brewingMethod) && (
              <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
                <div className="flex items-start space-x-2">
                  <Home className="h-5 w-5 text-coffee-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-coffee-700 mb-2">
                      홈카페 장비를 설정하면 더 편리하게 사용할 수 있어요.
                    </p>
                    <a 
                      href="/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-coffee-600 hover:text-coffee-800 underline font-medium"
                    >
                      설정에서 장비 등록하기 →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 추출 팁 표시 */}
            {brewingRecommendations.notes && brewingRecommendations.notes.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start space-x-2">
                  <Coffee className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 mb-2">
                      {userEquipment.brewingMethod || '선택한 도구'} 추출 팁
                    </p>
                    <ul className="text-sm text-green-600 space-y-1">
                      {brewingRecommendations.notes.map((note, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
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
          <p className="text-sm text-coffee-500">다음: 향미 선택</p>
        </div>
      </div>

      {/* 키패드 모달 */}
      {showKeypad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-coffee-800 mb-4 text-center">원두량 입력</h3>
            
            {/* 현재 입력값 표시 */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-coffee-800">{keypadValue}g</div>
              <p className="text-sm text-gray-500 mt-1">10g - 50g 범위</p>
            </div>
            
            {/* 키패드 버튼 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (keypadValue.length < 2 || (keypadValue.length === 2 && parseInt(keypadValue + num) <= 50)) {
                      setKeypadValue(prev => {
                        const newValue = prev === '0' ? num.toString() : prev + num
                        return parseInt(newValue) > 50 ? '50' : newValue
                      })
                    }
                  }}
                  className={`p-4 text-xl font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors ${
                    num === 0 ? 'col-start-2' : ''
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setKeypadValue(prev => prev.slice(0, -1) || '0')}
                className="p-4 text-xl font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                ⌫
              </button>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowKeypad(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleKeypadConfirm}
                disabled={parseInt(keypadValue) < 10 || parseInt(keypadValue) > 50}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 레시피 저장 모달 */}
      {showSaveRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-coffee-800 mb-4 text-center">레시피 저장</h3>
            
            {/* 현재 설정 요약 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">현재 설정</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>드리퍼:</span>
                  <span className="font-medium">
                    {dripperOptions.find(d => d.id === brewSetup.dripper)?.name || customDripper || '선택 안됨'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>원두량:</span>
                  <span className="font-medium">{brewSetup.coffeeAmount}g</span>
                </div>
                <div className="flex justify-between">
                  <span>물량:</span>
                  <span className="font-medium">{brewSetup.waterAmount}ml</span>
                </div>
                <div className="flex justify-between">
                  <span>비율:</span>
                  <span className="font-medium">1:{brewSetup.ratio}</span>
                </div>
                {grindSetting && (
                  <div className="flex justify-between">
                    <span>분쇄도:</span>
                    <span className="font-medium">{grindSetting}</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              이 설정을 "나의 커피" 레시피로 저장하시겠습니까?
              <br />
              <span className="text-xs text-gray-500">기존 레시피는 덮어씌워집니다</span>
            </p>
            
            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveRecipe(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSaveRecipe}
                className="flex-1 py-3 px-4 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}