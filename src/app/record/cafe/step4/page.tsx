'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, ArrowRight, ArrowLeft, Star, Droplets, Zap } from 'lucide-react'
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
  overallRating: number // 1-5 전체 만족도
  acidity: number // 1-5 산미
  sweetness: number // 1-5 단맛
  bitterness: number // 1-5 쓴맛
  body: number // 1-5 바디감
  aftertaste: number // 1-5 여운
  balance: number // 1-5 균형감
  flavorNotes: string[] // 맛 표현
  textureDescriptors: string[] // 질감 표현
  tastingNote?: string // 자유 텍스트
}

const FLAVOR_NOTES = [
  // 과일계
  { category: '과일맛', items: ['사과', '오렌지', '레몬', '자몽', '베리', '체리', '포도', '복숭아', '망고'] },
  // 달콤함
  { category: '달콤함', items: ['초콜릿', '카라멜', '바닐라', '꿀', '설탕', '메이플', '토피'] },
  // 견과류
  { category: '견과류', items: ['아몬드', '헤이즐넛', '호두', '피칸', '땅콩'] },
  // 향신료
  { category: '향신료', items: ['계피', '정향', '생강', '후추', '넛맥'] },
  // 기타
  { category: '기타', items: ['풀내음', '흙내음', '담배', '나무', '가죽', '버터'] },
]

const TEXTURE_DESCRIPTORS = [
  '부드러운', '크리미한', '가벼운', '묵직한', '매끄러운', '거친', '깔끔한', '기름진'
]

const TASTE_ATTRIBUTES = [
  { key: 'acidity', label: '산미', description: '상큼함, 밝기', icon: '🍋' },
  { key: 'sweetness', label: '단맛', description: '달콤함, 부드러움', icon: '🍯' },
  { key: 'bitterness', label: '쓴맛', description: '쓴맛, 진함', icon: '☕' },
  { key: 'body', label: '바디감', description: '묵직함, 질감', icon: '💪' },
  { key: 'aftertaste', label: '여운', description: '뒷맛, 지속성', icon: '🌊' },
  { key: 'balance', label: '균형감', description: '조화로움', icon: '⚖️' },
]

export default function CafeStep4Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<CafeStep2Data | null>(null)
  const [step3Data, setStep3Data] = useState<CafeStep3Data | null>(null)
  const [formData, setFormData] = useState<CafeStep4Data>({
    overallRating: 0,
    acidity: 3,
    sweetness: 3,
    bitterness: 3,
    body: 3,
    aftertaste: 3,
    balance: 3,
    flavorNotes: [],
    textureDescriptors: [],
  })

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordCafeStep2')
    const saved3 = sessionStorage.getItem('recordCafeStep3')
    
    if (saved1 && saved2 && saved3) {
      const data1 = JSON.parse(saved1)
      const data2 = JSON.parse(saved2)
      const data3 = JSON.parse(saved3)
      setStep1Data(data1)
      setStep2Data(data2)
      setStep3Data(data3)
      
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
    const savedCafeStep4 = sessionStorage.getItem('recordCafeStep4')
    if (savedCafeStep4) {
      setFormData(JSON.parse(savedCafeStep4))
    }
  }, [router])

  const handleNext = () => {
    if (formData.overallRating === 0) {
      alert('전체 만족도를 선택해주세요.')
      return
    }

    // 데이터 저장
    sessionStorage.setItem('recordCafeStep4', JSON.stringify(formData))
    
    // 다음 단계로 이동
    router.push('/record/cafe/step5')
  }

  const handleBack = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep4', JSON.stringify(formData))
    router.push('/record/cafe/step3')
  }

  const toggleFlavorNote = (note: string) => {
    setFormData(prev => ({
      ...prev,
      flavorNotes: prev.flavorNotes.includes(note)
        ? prev.flavorNotes.filter(n => n !== note)
        : [...prev.flavorNotes, note]
    }))
  }

  const toggleTextureDescriptor = (descriptor: string) => {
    setFormData(prev => ({
      ...prev,
      textureDescriptors: prev.textureDescriptors.includes(descriptor)
        ? prev.textureDescriptors.filter(d => d !== descriptor)
        : [...prev.textureDescriptors, descriptor]
    }))
  }

  const updateTasteAttribute = (key: keyof CafeStep4Data, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (!step1Data || !step2Data || !step3Data) {
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
            <h1 className="text-3xl font-bold text-blue-800">맛 평가</h1>
            <div className="text-sm text-blue-600">4 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '57.1%' }}
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
              <p className="text-sm text-blue-600">{step2Data.cafeName}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Coffee className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">맛은 어떠신가요?</h2>
            <p className="text-blue-600">커피의 다양한 맛과 특성을 평가해보세요</p>
          </div>

          {/* 메인 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* 전체 만족도 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4 text-center">
                <Star className="inline h-5 w-5 mr-2" />
                전체 만족도 <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, overallRating: star })}
                    className={`p-2 transition-colors ${
                      star <= formData.overallRating
                        ? 'text-blue-500'
                        : 'text-gray-300 hover:text-blue-300'
                    }`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
              {formData.overallRating > 0 && (
                <p className="text-center text-sm text-gray-600">
                  {formData.overallRating === 1 && '별로예요'}
                  {formData.overallRating === 2 && '그냥 그래요'}
                  {formData.overallRating === 3 && '괜찮아요'}
                  {formData.overallRating === 4 && '맛있어요'}
                  {formData.overallRating === 5 && '최고예요!'}
                </p>
              )}
            </div>

            {/* 맛 속성 평가 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-6">맛 특성 평가</h3>
              <div className="space-y-6">
                {TASTE_ATTRIBUTES.map((attr) => (
                  <div key={attr.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <span className="text-lg mr-2">{attr.icon}</span>
                        {attr.label}
                        <span className="text-xs text-gray-500 ml-2">({attr.description})</span>
                      </label>
                      <span className="text-sm text-blue-600 font-medium">
                        {formData[attr.key as keyof CafeStep4Data] as number}/5
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-400">약함</span>
                      <div className="flex space-x-1 flex-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateTasteAttribute(attr.key as keyof CafeStep4Data, level)}
                            className={`flex-1 h-8 rounded transition-all ${
                              level <= (formData[attr.key as keyof CafeStep4Data] as number)
                                ? 'bg-blue-500'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">강함</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 맛 표현 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                어떤 맛이 나나요? (복수 선택 가능)
              </label>
              <div className="space-y-4">
                {FLAVOR_NOTES.map((category) => (
                  <div key={category.category}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">{category.category}</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {category.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleFlavorNote(item)}
                          className={`p-2 rounded-lg text-sm border-2 transition-all ${
                            formData.flavorNotes.includes(item)
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 hover:border-blue-300 text-gray-600'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 질감 표현 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Droplets className="inline h-5 w-5 mr-2" />
                질감은 어떤가요? (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TEXTURE_DESCRIPTORS.map((descriptor) => (
                  <button
                    key={descriptor}
                    onClick={() => toggleTextureDescriptor(descriptor)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      formData.textureDescriptors.includes(descriptor)
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {descriptor}
                  </button>
                ))}
              </div>
            </div>

            {/* 자유 텍스트 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                맛에 대한 추가 설명 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="예: 첫 모금은 상큼하지만 마실수록 단맛이 올라와서 균형이 좋음"
                value={formData.tastingNote || ''}
                onChange={(e) => setFormData({ ...formData, tastingNote: e.target.value })}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 팁:</span> 커피를 조금씩 마시면서 시간에 따른 맛의 변화도 느껴보세요. 
                온도가 내려가면서 다른 맛이 나타날 수도 있어요!
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
              disabled={formData.overallRating === 0}
              className="flex-2 py-4 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium flex items-center justify-center"
            >
              감각 표현하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-blue-500">다음: 한국어로 감각 표현하기</p>
          </div>
        </div>
      </div>
    </div>
  )
}