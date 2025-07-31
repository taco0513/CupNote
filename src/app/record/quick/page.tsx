'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, ArrowLeft, Coffee, Star } from 'lucide-react'
import Navigation from '../../../components/Navigation'
import { TASTING_MODES_CONFIG, UI_LABELS } from '../../../config'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'quick' | 'cafe' | 'homecafe' | 'pro'
}

interface QuickData {
  rating: number
  quickNote?: string
  location?: string
  companion?: string
}

export default function QuickModePage() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [formData, setFormData] = useState<QuickData>({
    rating: 0,
  })

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      // Quick 모드가 아니면 리디렉션
      if (data1.mode !== 'quick') {
        router.push('/record/step2')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
  }, [router])

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating })
  }

  const handleComplete = () => {
    // Quick 데이터 저장
    sessionStorage.setItem('recordQuick', JSON.stringify(formData))
    
    // Step4 완료 페이지로 이동
    router.push('/record/step4')
  }

  const handleBack = () => {
    router.push('/record/step1')
  }

  if (!step1Data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-orange-800">빠른 기록</h1>
            <div className="text-sm text-orange-600">2 / 2</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-orange-200 rounded-full h-2 mb-4">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            ></div>
          </div>

          {/* 선택된 모드와 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                ⚡ {TASTING_MODES_CONFIG.quick.labelKr}
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-orange-800">{step1Data.coffeeName}</p>
              {step1Data.roastery && (
                <p className="text-sm text-orange-600">{step1Data.roastery}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 헤더 */}
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
              onClick={handleComplete}
              disabled={formData.rating === 0}
              className="flex-2 py-4 px-8 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium flex items-center justify-center"
            >
              기록 완료
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-orange-500">완료하면 커피 기록이 저장됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}