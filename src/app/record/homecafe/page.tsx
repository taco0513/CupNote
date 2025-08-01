'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { 
  Coffee, 
  ArrowRight, 
  ArrowLeft, 
  Home,
  Minus,
  Plus,
  Settings,
  Droplets,
  Scale,
  Timer,
  Thermometer,
  BookOpen,
  Upload
} from 'lucide-react'

import Navigation from '../../../components/Navigation'
import BrewTimer from '../../../components/BrewTimer'
import RecipeLibrary from '../../../components/RecipeLibrary'
import { SavedRecipe } from '../../../types/recipe'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe'
}

interface Step2Data {
  origin?: string
  roastLevel?: string
  brewMethod?: string
  grindSize?: string
  waterTemp?: string
  brewTime?: string
  ratio?: string
}

interface TimerData {
  totalTime: number
  lapTimes: { time: number, note: string, timestamp: Date }[]
  completed: boolean
}

interface HomeCafeData {
  dripper: string
  coffeeAmount: number
  waterAmount: number
  ratio: number
  grindSize?: string // 분쇄도 레벨 (coarse, medium, fine 등)
  grindSetting?: string // 직접입력 그라인더 설정 (deprecated)
  grinderBrand?: string // 그라인더 브랜드
  grinderModel?: string // 그라인더 모델
  grinderSetting?: string // 클릭수/세팅값
  waterTemp?: number
  brewTime?: number
  notes?: string
  timerData?: TimerData // 타이머 데이터 추가
}

// 드리퍼 옵션
const DRIPPER_OPTIONS = [
  { id: 'v60', name: 'V60', icon: '☕', description: '원뿔형 드리퍼' },
  { id: 'kalita', name: 'Kalita Wave', icon: '🌊', description: '평평한 바닥' },
  { id: 'origami', name: 'Origami', icon: '📄', description: '접이식 드리퍼' },
  { id: 'april', name: 'April', icon: '🌸', description: '플랫 베드' },
]

// 비율 프리셋 (Foundation 문서 기준)
const RATIO_PRESETS = [
  { ratio: 15, label: '1:15', description: '진한 맛', color: 'bg-orange-100 text-orange-800' },
  { ratio: 15.5, label: '1:15.5', description: '', color: 'bg-orange-50 text-orange-700' },
  { ratio: 16, label: '1:16', description: '균형', color: 'bg-green-100 text-green-800' },
  { ratio: 16.5, label: '1:16.5', description: '', color: 'bg-green-50 text-green-700' },
  { ratio: 17, label: '1:17', description: '순한 맛', color: 'bg-blue-100 text-blue-800' },
  { ratio: 17.5, label: '1:17.5', description: '', color: 'bg-blue-50 text-blue-700' },
  { ratio: 18, label: '1:18', description: '가벼운 맛', color: 'bg-purple-100 text-purple-800' },
]

// 그라인더 브랜드별 모델 데이터
const GRINDER_DATA: Record<string, string[]> = {
  'Baratza': ['Encore', 'Virtuoso+', 'Vario', 'Forte BG', 'Sette 270', 'Preciso'],
  'Comandante': ['C40', 'C60', 'X25'],
  'Timemore': ['C2', 'C3', 'Sculptor 064', 'Sculptor 078', 'Nano'],
  'Hario': ['Mini Mill', 'Skerton Pro', 'Smart G', 'Switch'],
  'Porlex': ['Mini', 'Tall', 'JP-30'],
  'Kinu': ['M47', 'M38', 'Phoenix'],
  'Wilfa': ['Uniform', 'Svart Aroma', 'Svart Nymalt'],
  '1Zpresso': ['JX', 'JX-Pro', 'J-Max', 'K-Max', 'K-Plus', 'Q2'],
  'Fellow': ['Ode', 'Opus'],
  'Niche': ['Zero', 'Duo'],
  'Eureka': ['Mignon Specialita', 'Mignon Silenzio', 'Atom 75'],
}

export default function HomeCafePage() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [showRecipeLibrary, setShowRecipeLibrary] = useState(false)
  
  const [formData, setFormData] = useState<HomeCafeData>({
    dripper: 'v60',
    coffeeAmount: 20, // 기본값 20g
    waterAmount: 320, // 기본값 1:16 비율
    ratio: 16,
  })

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordStep2')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      // HomeCafe 모드가 아니면 리디렉션
      if (data1.mode !== 'homecafe') {
        router.push('/record/step2')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
    
    if (saved2) {
      setStep2Data(JSON.parse(saved2))
    }
  }, [router])

  // 원두량 변경시 물량 자동 계산
  const handleCoffeeAmountChange = (newAmount: number) => {
    const newWaterAmount = Math.round(newAmount * formData.ratio)
    setFormData({
      ...formData,
      coffeeAmount: newAmount,
      waterAmount: newWaterAmount,
    })
  }

  // 비율 프리셋 선택
  const handleRatioPresetSelect = (newRatio: number) => {
    const newWaterAmount = Math.round(formData.coffeeAmount * newRatio)
    setFormData({
      ...formData,
      ratio: newRatio,
      waterAmount: newWaterAmount,
    })
  }

  // 물량 직접 변경시 비율 재계산
  const handleWaterAmountChange = (newWaterAmount: number) => {
    const newRatio = Number((newWaterAmount / formData.coffeeAmount).toFixed(1))
    setFormData({
      ...formData,
      waterAmount: newWaterAmount,
      ratio: newRatio,
    })
  }

  // 레시피 선택 핸들러
  const handleRecipeSelect = (recipe: SavedRecipe) => {
    const updatedFormData: HomeCafeData = {
      dripper: recipe.dripper,
      coffeeAmount: recipe.coffeeAmount,
      waterAmount: recipe.waterAmount,
      ratio: recipe.ratio,
      grindSize: recipe.grindSize,
      grinderBrand: recipe.grinderBrand,
      grinderModel: recipe.grinderModel,
      grinderSetting: recipe.grinderSetting,
      waterTemp: recipe.waterTemp,
      brewTime: recipe.brewTime,
      notes: recipe.notes
    }
    
    setFormData(updatedFormData)
    setShowRecipeLibrary(false)
    
    // 알림 표시
    alert(`"${recipe.name}" 레시피를 불러왔습니다!`)
  }

  // 타이머 완료 핸들러
  const handleTimerComplete = (timerData: TimerData) => {
    const updatedFormData = { ...formData, timerData }
    setFormData(updatedFormData)
    
    // 타이머 데이터 포함해서 저장
    sessionStorage.setItem('recordHomeCafe', JSON.stringify(updatedFormData))
    setShowTimer(false)
    
    // HomeCafe Step 3으로 이동 (통합 향미 평가)
    router.push('/record/homecafe/step3')
  }

  const handleStartBrewing = () => {
    setShowTimer(true)
  }

  const handleNext = () => {
    // 타이머 없이 바로 다음 단계로
    sessionStorage.setItem('recordHomeCafe', JSON.stringify(formData))
    router.push('/record/homecafe/step3')
  }

  const handleBack = () => {
    router.push('/record/step2')
  }

  if (!step1Data) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-800">홈카페 레시피</h1>
            <div className="text-sm text-green-600">2 / 5</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-green-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '40%' }}
            ></div>
          </div>

          {/* 선택된 모드와 커피 정보 표시 */}
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
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Home className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">추출 설정</h2>
            <p className="text-green-600">정밀한 레시피로 완벽한 커피를 만들어보세요</p>
            
            {/* 레시피 불러오기 버튼 */}
            <div className="mt-4">
              <button
                onClick={() => setShowRecipeLibrary(true)}
                className="inline-flex items-center px-4 py-2 bg-white border border-green-300 rounded-xl text-green-700 hover:bg-green-50 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                저장된 레시피 불러오기
              </button>
            </div>
          </div>

          {/* 메인 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* 드리퍼 선택 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Coffee className="inline h-5 w-5 mr-2" />
                드리퍼 선택
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DRIPPER_OPTIONS.map((dripper) => (
                  <button
                    key={dripper.id}
                    onClick={() => setFormData({ ...formData, dripper: dripper.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.dripper === dripper.id
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-green-300 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{dripper.icon}</div>
                    <div className="text-sm font-medium">{dripper.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{dripper.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 다이얼 제어 - 원두량 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Scale className="inline h-5 w-5 mr-2" />
                원두량 (정밀 조정)
              </label>
              <div className="flex items-center justify-center space-x-6 p-6 bg-gray-50 rounded-xl">
                <button
                  onClick={() => formData.coffeeAmount > 15 && handleCoffeeAmountChange(formData.coffeeAmount - 1)}
                  disabled={formData.coffeeAmount <= 15}
                  className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="h-6 w-6" />
                </button>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formData.coffeeAmount}g
                  </div>
                  <div className="text-sm text-gray-500">15g ~ 30g</div>
                </div>
                
                <button
                  onClick={() => formData.coffeeAmount < 30 && handleCoffeeAmountChange(formData.coffeeAmount + 1)}
                  disabled={formData.coffeeAmount >= 30}
                  className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* 비율 프리셋 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Droplets className="inline h-5 w-5 mr-2" />
                비율 프리셋
              </label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {RATIO_PRESETS.map((preset) => (
                  <button
                    key={preset.ratio}
                    onClick={() => handleRatioPresetSelect(preset.ratio)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      Math.abs(formData.ratio - preset.ratio) < 0.1
                        ? `border-green-500 ${preset.color}`
                        : 'border-gray-200 hover:border-green-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="font-bold text-sm">{preset.label}</div>
                    {preset.description && (
                      <div className="text-xs mt-1">{preset.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 계산 결과 표시 */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-green-600 mb-1">원두량</div>
                <div className="text-2xl font-bold text-green-800">{formData.coffeeAmount}g</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-blue-600 mb-1">물량</div>
                <div className="text-2xl font-bold text-blue-800">{formData.waterAmount}ml</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-sm text-purple-600 mb-1">비율</div>
                <div className="text-2xl font-bold text-purple-800">1:{formData.ratio}</div>
              </div>
            </div>

            {/* 분쇄도 설정 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Settings className="inline h-5 w-5 mr-2" />
                분쇄도
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'coarse', label: '굵게', icon: '🌰', description: 'French Press' },
                  { value: 'medium-coarse', label: '중굵게', icon: '🥜', description: 'Chemex, April' },
                  { value: 'medium', label: '중간', icon: '🌾', description: 'V60, Origami' },
                  { value: 'medium-fine', label: '중세세', icon: '🧂', description: 'Kalita Wave' },
                  { value: 'fine', label: '세게', icon: '⚪', description: 'AeroPress' },
                  { value: 'custom', label: '직접입력', icon: '⚙️', description: '그라인더 설정' },
                ].map((grind) => (
                  <button
                    key={grind.value}
                    onClick={() => setFormData({ 
                      ...formData, 
                      grindSize: formData.grindSize === grind.value ? '' : grind.value 
                    })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.grindSize === grind.value
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-green-300 text-gray-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{grind.icon}</div>
                    <div className="text-sm font-medium">{grind.label}</div>
                    <div className="text-xs text-gray-500">{grind.description}</div>
                  </button>
                ))}
              </div>
              
              {/* 직접 입력 필드 */}
              {formData.grindSize === 'custom' && (
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.grinderBrand || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        grinderBrand: e.target.value,
                        grinderModel: '' // 브랜드 변경시 모델 초기화
                      })}
                    >
                      <option value="">브랜드 선택</option>
                      {Object.keys(GRINDER_DATA).map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      모델
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.grinderModel || ''}
                      onChange={(e) => setFormData({ ...formData, grinderModel: e.target.value })}
                      disabled={!formData.grinderBrand || formData.grinderBrand === '기타'}
                    >
                      <option value="">모델 선택</option>
                      {formData.grinderBrand && GRINDER_DATA[formData.grinderBrand]?.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      클릭수 / 세팅값
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="예: 25, 3번, 중간"
                      value={formData.grinderSetting || ''}
                      onChange={(e) => setFormData({ ...formData, grinderSetting: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 선택적 정보 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="inline h-4 w-4 mr-1" />
                  물 온도 (°C)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="예: 93"
                  value={formData.waterTemp || ''}
                  onChange={(e) => setFormData({ ...formData, waterTemp: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Timer className="inline h-4 w-4 mr-1" />
                  추출 시간 (분)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="예: 3.5"
                  value={formData.brewTime || ''}
                  onChange={(e) => setFormData({ ...formData, brewTime: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* 실험 노트 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Settings className="inline h-4 w-4 mr-1" />
                실험 노트 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="분쇄도, 푸어링 방법, 특이사항 등을 기록해보세요..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700">
                <span className="font-medium">💡 팁:</span> 원두량을 조정하면 물량이 자동으로 계산됩니다. 
                비율 프리셋을 사용하면 더 쉽게 설정할 수 있어요!
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              이전
            </button>
            
            {/* 타이머 시작 버튼 (메인) */}
            <button
              onClick={handleStartBrewing}
              className="flex-2 py-4 px-8 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium flex items-center justify-center"
            >
              <Timer className="h-5 w-5 mr-2" />
              추출 시작
            </button>
            
            {/* 타이머 없이 건너뛰기 */}
            <button
              onClick={handleNext}
              className="py-4 px-4 border border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors text-sm font-medium flex items-center justify-center"
              title="타이머 없이 바로 다음 단계"
            >
              건너뛰기
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-green-500">
              <Timer className="inline h-4 w-4 mr-1" />
              추출 타이머로 정확한 추출을 도와드려요!
            </p>
          </div>
        </div>
        
        {/* 타이머 모달 */}
        {showTimer && (
          <BrewTimer
            dripper={formData.dripper}
            totalWaterAmount={formData.waterAmount}
            onTimerComplete={handleTimerComplete}
            onClose={() => setShowTimer(false)}
          />
        )}

        {/* 레시피 라이브러리 모달 */}
        {showRecipeLibrary && (
          <RecipeLibrary
            onRecipeSelect={handleRecipeSelect}
            onClose={() => setShowRecipeLibrary(false)}
          />
        )}
      </div>
    </div>
  )
}