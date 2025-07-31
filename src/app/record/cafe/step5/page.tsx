'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ArrowRight, ArrowLeft, Smile, Sun, Cloud, Moon } from 'lucide-react'
import Navigation from '../../../../components/Navigation'
import { TASTING_MODES_CONFIG } from '../../../../config'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'quick' | 'cafe' | 'homecafe' | 'pro'
}

interface CafeStep2Data {
  cafeName: string
  [key: string]: any
}

interface CafeStep3Data {
  [key: string]: any
}

interface CafeStep4Data {
  overallRating: number
  [key: string]: any
}

interface CafeStep5Data {
  mood?: string // 이 커피를 마실 때 기분
  situation?: string // 어떤 상황에 어울리는지  
  personality?: string // 이 커피의 성격
  memory?: string // 떠오르는 기억이나 장면
  emotionalNote?: string // 감정적 느낌
  weatherAssociation?: string // 어떤 날씨에 어울리는지
  timeAssociation?: string // 어떤 시간에 어울리는지
  personalExpression?: string // 나만의 표현
}

const MOOD_OPTIONS = [
  { value: 'energetic', label: '활기찬', icon: '⚡', color: 'orange' },
  { value: 'calm', label: '차분한', icon: '🧘', color: 'blue' },
  { value: 'happy', label: '기분 좋은', icon: '😊', color: 'yellow' },
  { value: 'focused', label: '집중되는', icon: '🎯', color: 'purple' },
  { value: 'romantic', label: '로맨틱한', icon: '💕', color: 'pink' },
  { value: 'nostalgic', label: '그리운', icon: '🌅', color: 'amber' },
]

const SITUATION_OPTIONS = [
  '아침에 일어나서', '점심 후 나른할 때', '오후 간식 시간에', '저녁 여유시간에',
  '친구와 수다 떨 때', '혼자만의 시간에', '업무에 집중할 때', '책을 읽을 때',
  '산책 후에', '비 오는 날에', '햇살 좋은 날에', '스트레스 받을 때'
]

const PERSONALITY_OPTIONS = [
  '활발하고 외향적인', '조용하고 내성적인', '따뜻하고 다정한', '시크하고 세련된',
  '유쾌하고 재미있는', '신비롭고 매력적인', '편안하고 안정적인', '독특하고 개성적인'
]

const WEATHER_OPTIONS = [
  { value: 'sunny', label: '맑은 날', icon: <Sun className="h-4 w-4" /> },
  { value: 'cloudy', label: '흐린 날', icon: <Cloud className="h-4 w-4" /> },
  { value: 'rainy', label: '비 오는 날', icon: '🌧️' },
  { value: 'snowy', label: '눈 오는 날', icon: '❄️' },
  { value: 'windy', label: '바람 부는 날', icon: '💨' },
  { value: 'cozy', label: '포근한 날', icon: '🔥' },
]

const TIME_OPTIONS = [
  { value: 'morning', label: '아침 시간', icon: '🌅' },
  { value: 'afternoon', label: '오후 시간', icon: '☀️' },
  { value: 'evening', label: '저녁 시간', icon: '🌅' },
  { value: 'night', label: '밤 시간', icon: '🌙' },
]

export default function CafeStep5Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<CafeStep2Data | null>(null)
  const [step3Data, setStep3Data] = useState<CafeStep3Data | null>(null)
  const [step4Data, setStep4Data] = useState<CafeStep4Data | null>(null)
  const [formData, setFormData] = useState<CafeStep5Data>({})

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordCafeStep2')
    const saved3 = sessionStorage.getItem('recordCafeStep3')
    const saved4 = sessionStorage.getItem('recordCafeStep4')
    
    if (saved1 && saved2 && saved3 && saved4) {
      const data1 = JSON.parse(saved1)
      const data2 = JSON.parse(saved2)
      const data3 = JSON.parse(saved3)
      const data4 = JSON.parse(saved4)
      setStep1Data(data1)
      setStep2Data(data2)
      setStep3Data(data3)
      setStep4Data(data4)
      
      // Cafe 모드가 아니면 리디렉션
      if (data1.mode !== 'cafe') {
        router.push('/record/step2')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }

    // 기존 데이터 불러오기
    const savedCafeStep5 = sessionStorage.getItem('recordCafeStep5')
    if (savedCafeStep5) {
      setFormData(JSON.parse(savedCafeStep5))
    }
  }, [router])

  const handleNext = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep5', JSON.stringify(formData))
    
    // 다음 단계로 이동
    router.push('/record/cafe/step6')
  }

  const handleBack = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep5', JSON.stringify(formData))
    router.push('/record/cafe/step4')
  }

  if (!step1Data || !step2Data || !step3Data || !step4Data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-800">감각 표현</h1>
            <div className="text-sm text-blue-600">5 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '71.4%' }}
            ></div>
          </div>

          {/* 선택된 모드와 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                ☕ {TASTING_MODES_CONFIG.cafe.labelKr}
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-blue-800">{step1Data.coffeeName}</p>
              <p className="text-sm text-blue-600">
                ⭐ {step4Data.overallRating}/5 · {step2Data.cafeName}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">나만의 언어로 표현해보세요</h2>
            <p className="text-blue-600">이 커피가 주는 감각과 느낌을 자유롭게 표현해보세요</p>
          </div>

          {/* 메인 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* 기분 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Smile className="inline h-5 w-5 mr-2" />
                이 커피를 마시면 어떤 기분인가요?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setFormData({ 
                      ...formData, 
                      mood: formData.mood === mood.value ? '' : mood.value 
                    })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.mood === mood.value
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.icon}</div>
                    <div className="text-sm font-medium">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 어울리는 상황 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                어떤 상황에 어울릴까요?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SITUATION_OPTIONS.map((situation) => (
                  <button
                    key={situation}
                    onClick={() => setFormData({ 
                      ...formData, 
                      situation: formData.situation === situation ? '' : situation 
                    })}
                    className={`p-3 rounded-lg text-sm border-2 transition-all ${
                      formData.situation === situation
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {situation}
                  </button>
                ))}
              </div>
            </div>

            {/* 커피의 성격 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                이 커피의 성격은?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONALITY_OPTIONS.map((personality) => (
                  <button
                    key={personality}
                    onClick={() => setFormData({ 
                      ...formData, 
                      personality: formData.personality === personality ? '' : personality 
                    })}
                    className={`p-3 rounded-lg text-sm border-2 transition-all ${
                      formData.personality === personality
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {personality}
                  </button>
                ))}
              </div>
            </div>

            {/* 날씨와 시간 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 어울리는 날씨 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  어떤 날씨에 어울릴까요?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WEATHER_OPTIONS.map((weather) => (
                    <button
                      key={weather.value}
                      onClick={() => setFormData({ 
                        ...formData, 
                        weatherAssociation: formData.weatherAssociation === weather.value ? '' : weather.value 
                      })}
                      className={`p-3 rounded-lg text-sm border-2 transition-all flex items-center justify-center ${
                        formData.weatherAssociation === weather.value
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-200 hover:border-blue-300 text-gray-600'
                      }`}
                    >
                      {typeof weather.icon === 'string' ? (
                        <span className="mr-1">{weather.icon}</span>
                      ) : (
                        <span className="mr-1">{weather.icon}</span>
                      )}
                      {weather.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 어울리는 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  어떤 시간에 어울릴까요?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => setFormData({ 
                        ...formData, 
                        timeAssociation: formData.timeAssociation === time.value ? '' : time.value 
                      })}
                      className={`p-3 rounded-lg text-sm border-2 transition-all flex items-center justify-center ${
                        formData.timeAssociation === time.value
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-200 hover:border-blue-300 text-gray-600'
                      }`}
                    >
                      <span className="mr-1">{time.icon}</span>
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 떠오르는 기억/장면 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                떠오르는 기억이나 장면이 있나요? (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="예: 할머니 댁에서 마시던 따뜻한 차, 첫 데이트 때의 설렘..."
                value={formData.memory || ''}
                onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
              />
            </div>

            {/* 나만의 표현 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이 커피를 한 문장으로 표현한다면? (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="예: 봄날 오후 햇살처럼 따뜻하고 부드러운 커피"
                value={formData.personalExpression || ''}
                onChange={(e) => setFormData({ ...formData, personalExpression: e.target.value })}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 팁:</span> 정답은 없어요! 여러분만의 솔직한 느낌을 
                자유롭게 표현해보세요. 모든 항목은 선택사항입니다.
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
            <button
              onClick={handleNext}
              className="flex-2 py-4 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium flex items-center justify-center"
            >
              노트 작성하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-blue-500">다음: 개인 노트 & 로스터 노트</p>
          </div>
        </div>
      </div>
    </div>
  )
}