'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Nose, ArrowRight, ArrowLeft, Coffee, Heart, Smile } from 'lucide-react'
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
  firstImpression?: string
  aromaIntensity: number // 1-5
  aromaDescriptors: string[]
  aromaNote?: string
  visualAppearance?: string
  temperature?: 'hot' | 'warm' | 'iced'
}

const AROMA_DESCRIPTORS = [
  // 과일향
  { category: '과일향', items: ['사과', '오렌지', '레몬', '베리류', '체리', '포도', '복숭아'] },
  // 꽃향
  { category: '꽃향', items: ['자스민', '라벤더', '로즈', '허브'] },
  // 견과류
  { category: '견과류', items: ['아몬드', '헤이즐넛', '호두', '땅콩'] },
  // 달콤함
  { category: '달콤함', items: ['초콜릿', '카라멜', '바닐라', '꿀', '설탕'] },
  // 향신료
  { category: '향신료', items: ['계피', '정향', '생강', '후추'] },
  // 기타
  { category: '기타', items: ['토스트', '버터', '크림', '담배', '나무'] },
]

export default function CafeStep3Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<CafeStep2Data | null>(null)
  const [formData, setFormData] = useState<CafeStep3Data>({
    aromaIntensity: 3,
    aromaDescriptors: [],
    temperature: 'hot',
  })

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordCafeStep2')
    
    if (saved1 && saved2) {
      const data1 = JSON.parse(saved1)
      const data2 = JSON.parse(saved2)
      setStep1Data(data1)
      setStep2Data(data2)
      
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
    const savedCafeStep3 = sessionStorage.getItem('recordCafeStep3')
    if (savedCafeStep3) {
      setFormData(JSON.parse(savedCafeStep3))
    }
  }, [router])

  const handleNext = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep3', JSON.stringify(formData))
    
    // 다음 단계로 이동
    router.push('/record/cafe/step4')
  }

  const handleBack = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep3', JSON.stringify(formData))
    router.push('/record/cafe/step2')
  }

  const toggleAromaDescriptor = (descriptor: string) => {
    setFormData(prev => ({
      ...prev,
      aromaDescriptors: prev.aromaDescriptors.includes(descriptor)
        ? prev.aromaDescriptors.filter(d => d !== descriptor)
        : [...prev.aromaDescriptors, descriptor]
    }))
  }

  if (!step1Data || !step2Data) {
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
            <h1 className="text-3xl font-bold text-blue-800">첫인상 & 아로마</h1>
            <div className="text-sm text-blue-600">3 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '42.8%' }}
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
              <Nose className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">첫인상은 어떠신가요?</h2>
            <p className="text-blue-600">커피를 받았을 때의 첫인상과 향을 기록해보세요</p>
          </div>

          {/* 메인 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* 첫인상 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Heart className="inline h-5 w-5 mr-2" />
                첫인상 (선택)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['기대되는', '향긋한', '깔끔한', '진한', '부드러운', '특별한'].map((impression) => (
                  <button
                    key={impression}
                    onClick={() => setFormData({ 
                      ...formData, 
                      firstImpression: formData.firstImpression === impression ? '' : impression 
                    })}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      formData.firstImpression === impression
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {impression}
                  </button>
                ))}
              </div>
            </div>

            {/* 온도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                온도
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'hot', label: '뜨거운', icon: '🔥' },
                  { value: 'warm', label: '따뜻한', icon: '☀️' },
                  { value: 'iced', label: '차가운', icon: '🧊' },
                ].map((temp) => (
                  <button
                    key={temp.value}
                    onClick={() => setFormData({ ...formData, temperature: temp.value as any })}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      formData.temperature === temp.value
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{temp.icon}</div>
                    <div className="text-sm font-medium">{temp.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 향의 강도 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                <Nose className="inline h-5 w-5 mr-2" />
                향의 강도
              </label>
              <div className="flex items-center justify-center space-x-6 p-6 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">약함</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, aromaIntensity: level })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        level <= formData.aromaIntensity
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">강함</span>
              </div>
            </div>

            {/* 향 표현 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                어떤 향이 나나요? (복수 선택 가능)
              </label>
              <div className="space-y-4">
                {AROMA_DESCRIPTORS.map((category) => (
                  <div key={category.category}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">{category.category}</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {category.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleAromaDescriptor(item)}
                          className={`p-2 rounded-lg text-sm border-2 transition-all ${
                            formData.aromaDescriptors.includes(item)
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

            {/* 향에 대한 추가 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                향에 대한 추가 설명 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="예: 레몬 껍질 같은 상큼함과 함께 은은한 꽃향이 느껴짐"
                value={formData.aromaNote || ''}
                onChange={(e) => setFormData({ ...formData, aromaNote: e.target.value })}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 팁:</span> 향은 커피의 첫인상을 결정하는 중요한 요소입니다. 
                천천히 향을 맡아보세요!
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
              맛 평가하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-blue-500">다음: 상세한 맛 평가</p>
          </div>
        </div>
      </div>
    </div>
  )
}