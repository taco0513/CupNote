'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, ArrowLeft, Coffee, Star } from 'lucide-react'
import Navigation from '../../../components/Navigation'
import { TASTING_MODES_CONFIG, UI_LABELS } from '../../../config'

interface QuickModeData {
  coffeeName: string
  roastery: string
  date: string
}

interface QuickData {
  rating: number
  quickNote?: string
  location?: string
  companion?: string
}

export default function QuickModePage() {
  const router = useRouter()
  
  const [basicData, setBasicData] = useState<QuickModeData>({
    coffeeName: '',
    roastery: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [formData, setFormData] = useState<QuickData>({
    rating: 0,
  })
  const [currentStep, setCurrentStep] = useState<'basic' | 'rating'>('basic')

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating })
  }

  const handleBasicNext = () => {
    if (basicData.coffeeName.trim()) {
      setCurrentStep('rating')
    }
  }

  const handleComplete = async () => {
    // Quick Mode 전체 데이터 결합
    const completeData = {
      ...basicData,
      ...formData,
      mode: 'quick' as const
    }
    
    // 세션에 저장
    sessionStorage.setItem('recordQuick', JSON.stringify(completeData))
    
    // 기존 step3/step4와 호환을 위한 임시 데이터
    const step1Data = {
      coffeeName: basicData.coffeeName,
      roastery: basicData.roastery,
      date: basicData.date,
      mode: 'quick' as const
    }
    const step3Data = {
      rating: formData.rating,
      tasteMode: 'simple' as const,
      taste: formData.quickNote || '',
      roasterNote: '',
      memo: `위치: ${formData.location || '미기록'}, 동행: ${formData.companion || '미기록'}`,
      location: formData.location,
      companion: formData.companion
    }
    
    sessionStorage.setItem('recordStep1', JSON.stringify(step1Data))
    sessionStorage.setItem('recordStep3', JSON.stringify(step3Data))
    
    // 결과 페이지로 이동
    router.push('/record/step4')
  }

  const handleBack = () => {
    if (currentStep === 'rating') {
      setCurrentStep('basic')
    } else {
      router.push('/mode-selection')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-orange-800">빠른 기록</h1>
            <div className="text-sm text-orange-600">{currentStep === 'basic' ? '1' : '2'} / 2</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-orange-200 rounded-full h-2 mb-4">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: currentStep === 'basic' ? '50%' : '100%' }}
            ></div>
          </div>

          {/* 선택된 모드와 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                ⚡ {TASTING_MODES_CONFIG.quick.labelKr}
              </div>
            </div>
            {currentStep === 'rating' && (
              <div className="text-right">
                <p className="font-medium text-orange-800">{basicData.coffeeName}</p>
                {basicData.roastery && (
                  <p className="text-sm text-orange-600">{basicData.roastery}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {currentStep === 'basic' ? (
            <>
              {/* Step 1: 기본 정보 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Coffee className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-orange-800 mb-2">커피 정보</h2>
                <p className="text-orange-600">마신 커피의 기본 정보를 입력해주세요</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    커피 이름 *
                  </label>
                  <input
                    type="text"
                    value={basicData.coffeeName}
                    onChange={(e) => setBasicData({ ...basicData, coffeeName: e.target.value })}
                    placeholder="예: 에티오피아 예가체프"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카페/로스터리 (선택)
                  </label>
                  <input
                    type="text"
                    value={basicData.roastery}
                    onChange={(e) => setBasicData({ ...basicData, roastery: e.target.value })}
                    placeholder="예: 블루보틀"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={basicData.date}
                    onChange={(e) => setBasicData({ ...basicData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: 평가 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-orange-800 mb-2">어떠셨나요?</h2>
                <p className="text-orange-600">별점과 간단한 메모만으로 빠르게 기록해보세요</p>
              </div>

              {/* 메인 폼 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* 별점 평가 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4 text-center">
                <Coffee className="inline h-5 w-5 mr-2" />
                전체적인 만족도
              </label>
              <div className="flex justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    className={`p-2 transition-colors ${
                      star <= formData.rating
                        ? 'text-orange-500'
                        : 'text-gray-300 hover:text-orange-300'
                    }`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-center text-sm text-gray-600">
                  {formData.rating === 1 && '별로예요'}
                  {formData.rating === 2 && '그냥 그래요'}
                  {formData.rating === 3 && '괜찮아요'}
                  {formData.rating === 4 && '맛있어요'}
                  {formData.rating === 5 && '최고예요!'}
                </p>
              )}
            </div>

            {/* 간단 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                간단한 메모 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="이 커피에 대한 간단한 느낌을 적어보세요..."
                value={formData.quickNote || ''}
                onChange={(e) => setFormData({ ...formData, quickNote: e.target.value })}
              />
            </div>

            {/* 추가 정보 (선택) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  어디서 마셨나요? (선택)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="예: 스타벅스 강남점"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  누구와 함께? (선택)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="예: 친구, 동료"
                  value={formData.companion || ''}
                  onChange={(e) => setFormData({ ...formData, companion: e.target.value })}
                />
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-sm text-orange-700">
                <span className="font-medium">💡 팁:</span> 별점만 선택해도 기록이 완료됩니다. 
                나중에 상세 정보를 추가할 수도 있어요!
              </p>
            </div>
          </div>
            </>
          )}

          {/* 하단 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              이전
            </button>
            {currentStep === 'basic' ? (
              <button
                onClick={handleBasicNext}
                disabled={!basicData.coffeeName.trim()}
                className="flex-2 py-4 px-8 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium flex items-center justify-center"
              >
                다음
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={formData.rating === 0}
                className="flex-2 py-4 px-8 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium flex items-center justify-center"
              >
                기록 완료
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-orange-500">
              {currentStep === 'basic' ? '다음 단계에서 평가를 진행합니다' : '완료하면 커피 기록이 저장됩니다'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}