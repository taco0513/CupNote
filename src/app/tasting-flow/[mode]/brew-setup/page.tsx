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
  CheckCircle
} from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, BrewSetup } from '../../../../types/tasting-flow.types'

const DRIPPER_OPTIONS = [
  { id: 'v60', name: 'V60', icon: '☕', description: '깔끔하고 밝은 맛' },
  { id: 'kalita', name: 'Kalita Wave', icon: '🌊', description: '균형 잡힌 바디감' },
  { id: 'chemex', name: 'Chemex', icon: '⏳', description: '부드럽고 클린한 맛' },
  { id: 'aeropress', name: 'AeroPress', icon: '🚀', description: '진한 바디감' },
  { id: 'french-press', name: 'French Press', icon: '🫖', description: '풍부한 바디감' },
  { id: 'other', name: '기타', icon: '❓', description: '직접 입력' },
]

const GRIND_SIZE_OPTIONS = [
  { id: 'coarse', name: '굵게', description: 'French Press용' },
  { id: 'medium-coarse', name: '중굵게', description: 'Chemex용' },
  { id: 'medium', name: '중간', description: 'V60, Kalita용' },
  { id: 'medium-fine', name: '중세세', description: 'AeroPress용' },
  { id: 'fine', name: '세게', description: 'Espresso용' },
  { id: 'custom', name: '직접 설정', description: '그라인더 설정' },
]

export default function BrewSetupPage() {
  const router = useRouter()

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [brewSetup, setBrewSetup] = useState<BrewSetup>({
    dripper: '',
    coffeeAmount: 20,
    waterAmount: 300,
    ratio: 15,
    grindSize: 'medium',
    waterTemp: 92,
    brewTime: 0,
  })
  
  const [customDripper, setCustomDripper] = useState('')
  const [customGrinder, setCustomGrinder] = useState({
    brand: '',
    model: '',
    setting: '',
  })
  
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [lapTimes, setLapTimes] = useState<Array<{ time: number; note: string; timestamp: Date }>>([])
  const [lapNote, setLapNote] = useState('')
  
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
  }, [router])

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  // 비율 계산
  useEffect(() => {
    const newRatio = Math.round((brewSetup.waterAmount / brewSetup.coffeeAmount) * 10) / 10
    setBrewSetup(prev => ({ ...prev, ratio: newRatio }))
  }, [brewSetup.coffeeAmount, brewSetup.waterAmount])

  const handleCoffeeAmountChange = (amount: number) => {
    const newAmount = Math.max(10, Math.min(50, amount))
    setBrewSetup(prev => ({ ...prev, coffeeAmount: newAmount }))
  }

  const handleWaterAmountChange = (amount: number) => {
    const newAmount = Math.max(150, Math.min(800, amount))
    setBrewSetup(prev => ({ ...prev, waterAmount: newAmount }))
  }

  const handleTimerStart = () => {
    setTimerRunning(true)
  }

  const handleTimerPause = () => {
    setTimerRunning(false)
  }

  const handleTimerReset = () => {
    setTimerRunning(false)
    setTimerSeconds(0)
    setLapTimes([])
  }

  const handleLapTime = () => {
    if (lapNote.trim()) {
      setLapTimes(prev => [...prev, {
        time: timerSeconds,
        note: lapNote.trim(),
        timestamp: new Date()
      }])
      setLapNote('')
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
    if (brewSetup.dripper === 'other' && !customDripper.trim()) {
      newErrors.customDripper = '드리퍼 이름을 입력해주세요'
    }
    if (brewSetup.grindSize === 'custom' && !customGrinder.brand.trim()) {
      newErrors.grinder = '그라인더 정보를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    const updatedBrewSetup: BrewSetup = {
      ...brewSetup,
      customDripper: brewSetup.dripper === 'other' ? customDripper : undefined,
      grinderBrand: brewSetup.grindSize === 'custom' ? customGrinder.brand : undefined,
      grinderModel: brewSetup.grindSize === 'custom' ? customGrinder.model : undefined,
      grinderSetting: brewSetup.grindSize === 'custom' ? customGrinder.setting : undefined,
      brewTime: timerSeconds,
      timerData: {
        totalTime: timerSeconds,
        lapTimes,
        completed: timerSeconds > 0,
      },
    }

    const updatedSession = {
      ...session,
      brewSetup: updatedBrewSetup,
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
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
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
          {/* 드리퍼 선택 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Coffee className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-800 mb-2">드리퍼 선택</h2>
              <p className="text-coffee-600">어떤 도구로 내리셨나요?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DRIPPER_OPTIONS.map((option) => (
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
            <h3 className="text-lg font-bold text-coffee-800 mb-4">추출 비율</h3>
            
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
                    <input
                      type="number"
                      value={brewSetup.coffeeAmount}
                      onChange={(e) => handleCoffeeAmountChange(parseInt(e.target.value) || 20)}
                      min="10"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
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
            <h3 className="text-lg font-bold text-coffee-800 mb-4">분쇄도</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {GRIND_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBrewSetup(prev => ({ ...prev, grindSize: option.id }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    brewSetup.grindSize === option.id
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>

            {brewSetup.grindSize === 'custom' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customGrinder.brand}
                  onChange={(e) => setCustomGrinder(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="그라인더 브랜드 (예: 바라짜)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.grinder ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  value={customGrinder.model}
                  onChange={(e) => setCustomGrinder(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="모델명 (선택)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={customGrinder.setting}
                  onChange={(e) => setCustomGrinder(prev => ({ ...prev, setting: e.target.value }))}
                  placeholder="설정값 (예: 12클릭)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.grinder && <p className="mt-1 text-sm text-red-600">{errors.grinder}</p>}
              </div>
            )}
          </div>

          {/* 추출 타이머 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-coffee-800 mb-4">
              <Clock className="inline h-5 w-5 mr-2" />
              추출 타이머 (선택)
            </h3>

            <div className="text-center mb-6">
              <div className="text-6xl font-mono font-bold text-coffee-800 mb-4">
                {formatTime(timerSeconds)}
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

            {/* 랩타임 기록 */}
            {timerRunning && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={lapNote}
                    onChange={(e) => setLapNote(e.target.value)}
                    placeholder="단계 메모 (예: 1차 붓기)"
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
            {lapTimes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">단계별 기록</h4>
                {lapTimes.map((lap, index) => (
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
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                타이머는 선택사항입니다. 추출하면서 실시간으로 기록하거나, 나중에 입력해도 됩니다.
              </p>
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
          <p className="text-sm text-coffee-500">다음: 향미 선택</p>
        </div>
      </div>
    </div>
  )
}