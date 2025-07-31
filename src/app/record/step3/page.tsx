'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import ImageUpload from '@/components/ImageUpload'
import { Star, ArrowRight, ArrowLeft, Heart, Smile, Coffee, Camera } from 'lucide-react'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'lab'
}

interface Step2Data {
  [key: string]: any
}

interface Step3Data {
  rating: number
  tasteMode: 'simple' | 'professional'
  taste: string
  roasterNote: string
  memo: string
  imageUrl?: string
  thumbnailUrl?: string
}

const RATING_LABELS = ['별로예요', '그냥 그래요', '괜찮아요', '맛있어요', '최고예요!']

export default function RecordStep3Page() {
  const router = useRouter()

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [formData, setFormData] = useState<Step3Data>({
    rating: 0,
    tasteMode: 'simple',
    taste: '',
    roasterNote: '',
    memo: '',
    imageUrl: undefined,
    thumbnailUrl: undefined,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordStep2')

    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)

      // Lab 모드는 기본적으로 professional 모드
      if (data1.mode === 'lab') {
        setFormData(prev => ({ ...prev, tasteMode: 'professional' }))
      }
    } else {
      router.push('/mode-selection')
      return
    }

    if (saved2) {
      setStep2Data(JSON.parse(saved2))
    }
  }, [router])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.rating === 0) {
      newErrors.rating = '평점을 선택해주세요'
    }

    if (!formData.taste.trim()) {
      newErrors.taste = '맛에 대한 설명을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // 세션 스토리지에 데이터 저장
      sessionStorage.setItem('recordStep3', JSON.stringify(formData))

      // Step 4로 이동
      router.push('/record/step4')
    }
  }

  const handleBack = () => {
    router.push('/record/step2')
  }

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating })
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
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-coffee-800">커피 기록하기</h1>
            <div className="text-sm text-coffee-600">3 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2 mb-4">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '75%' }}
            ></div>
          </div>

          {/* 선택된 모드와 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`
                flex items-center px-4 py-2 rounded-full text-sm font-medium
                ${
                  step1Data.mode === 'cafe'
                    ? 'bg-blue-100 text-blue-800'
                    : step1Data.mode === 'homecafe'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                }
              `}
              >
                {step1Data.mode === 'cafe' && '☕ 카페 모드'}
                {step1Data.mode === 'homecafe' && '🏠 홈카페 모드'}
                {step1Data.mode === 'lab' && '🔬 랩 모드'}
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-coffee-800">{step1Data.coffeeName}</p>
              {step1Data.roastery && (
                <p className="text-sm text-coffee-600">{step1Data.roastery}</p>
              )}
            </div>
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-coffee-800 mb-2">맛 평가</h2>
            <p className="text-coffee-600">이 커피는 어떤 맛이었나요?</p>
          </div>

          <div className="space-y-8">
            {/* 평점 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                전체적인 만족도 *
              </label>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || formData.rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center">
                <p
                  className={`text-lg font-medium ${
                    formData.rating > 0 ? 'text-coffee-800' : 'text-gray-400'
                  }`}
                >
                  {formData.rating > 0 ? RATING_LABELS[formData.rating - 1] : '평점을 선택해주세요'}
                </p>
              </div>
              {errors.rating && (
                <p className="mt-2 text-sm text-red-600 text-center">{errors.rating}</p>
              )}
            </div>

            {/* 맛 표현 모드 선택 (Lab 모드가 아닌 경우만) */}
            {step1Data.mode !== 'lab' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  어떻게 기록하시겠어요?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tasteMode: 'simple' })}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                      formData.tasteMode === 'simple'
                        ? 'border-coffee-600 bg-coffee-50 text-coffee-800 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌱</div>
                    <div className="font-medium">편하게 쓰기</div>
                    <div className="text-sm text-gray-600">내 언어로 자유롭게</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tasteMode: 'professional' })}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                      formData.tasteMode === 'professional'
                        ? 'border-coffee-600 bg-coffee-50 text-coffee-800 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="font-medium">전문가처럼</div>
                    <div className="text-sm text-gray-600">정확한 용어로</div>
                  </button>
                </div>
              </div>
            )}

            {/* 맛 기록 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.tasteMode === 'simple' ? '어떤 맛이었나요?' : '테이스팅 노트'} *
              </label>
              <textarea
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg transition-colors ${
                  errors.taste ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={5}
                placeholder={
                  formData.tasteMode === 'simple'
                    ? '예: 새콤달콤한 사탕 같았어요. 차가워지니까 더 달았어요.'
                    : '예: 자몽, 베르가못, 꿀, 밝은 산미'
                }
                value={formData.taste}
                onChange={e => setFormData({ ...formData, taste: e.target.value })}
              />
              {errors.taste && <p className="mt-1 text-sm text-red-600">{errors.taste}</p>}
            </div>

            {/* 로스터 노트와 비교 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                로스터는 뭐라고 했나요? (선택)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                placeholder="예: 블루베리, 다크초콜릿, 와인"
                value={formData.roasterNote}
                onChange={e => setFormData({ ...formData, roasterNote: e.target.value })}
              />
              <p className="mt-1 text-sm text-gray-500">
                패키지나 메뉴에 적힌 맛 설명이 있다면 적어주세요
              </p>
            </div>

            {/* 추가 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Smile className="inline h-4 w-4 mr-1" />
                메모 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                rows={3}
                placeholder="함께한 사람, 그날의 기분, 특별한 순간..."
                value={formData.memo}
                onChange={e => setFormData({ ...formData, memo: e.target.value })}
              />
            </div>

            {/* 사진 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="inline h-4 w-4 mr-1" />
                사진 추가 (선택)
              </label>
              <ImageUpload
                onImageUploaded={(imageUrl, thumbnailUrl) => {
                  setFormData({
                    ...formData,
                    imageUrl,
                    thumbnailUrl,
                  })
                }}
                onImageRemoved={() => {
                  setFormData({
                    ...formData,
                    imageUrl: undefined,
                    thumbnailUrl: undefined,
                  })
                }}
                existingImageUrl={formData.imageUrl}
                className="max-w-md mx-auto"
              />
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
            <p className="text-sm text-coffee-700">
              <span className="font-medium">💡 팁:</span>
              {formData.tasteMode === 'simple'
                ? ' 떠오르는 감정이나 기억을 자유롭게 적어보세요. 나만의 표현이 가장 좋아요!'
                : ' 향미 바퀴나 커핑 용어를 활용해서 구체적으로 표현해보세요!'}
            </p>
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
          <p className="text-sm text-coffee-500">다음: 최종 검토 및 저장</p>
        </div>
      </div>
    </div>
  )
}
