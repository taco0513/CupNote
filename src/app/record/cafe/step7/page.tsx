'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowLeft, Star, Coffee, Heart, Share2, Edit, Home } from 'lucide-react'
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

interface CafeStep4Data {
  overallRating: number
  flavorNotes: string[]
  [key: string]: any
}

interface CafeStep5Data {
  mood?: string
  personalExpression?: string
  [key: string]: any
}

interface CafeStep6Data {
  personalNote?: string
  publicReview?: string
  tags?: string[]
  repurchase?: boolean
  wouldRecommend?: boolean
  [key: string]: any
}

export default function CafeStep7Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<CafeStep2Data | null>(null)
  const [step4Data, setStep4Data] = useState<CafeStep4Data | null>(null)
  const [step5Data, setStep5Data] = useState<CafeStep5Data | null>(null)
  const [step6Data, setStep6Data] = useState<CafeStep6Data | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // 모든 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordCafeStep2')
    const saved4 = sessionStorage.getItem('recordCafeStep4')
    const saved5 = sessionStorage.getItem('recordCafeStep5')
    const saved6 = sessionStorage.getItem('recordCafeStep6')
    
    if (saved1 && saved2 && saved4) {
      const data1 = JSON.parse(saved1)
      const data2 = JSON.parse(saved2)
      const data4 = JSON.parse(saved4)
      const data5 = saved5 ? JSON.parse(saved5) : {}
      const data6 = saved6 ? JSON.parse(saved6) : {}
      
      setStep1Data(data1)
      setStep2Data(data2)
      setStep4Data(data4)
      setStep5Data(data5)
      setStep6Data(data6)
      
      // Cafe 모드가 아니면 리디렉션
      if (data1.mode !== 'cafe') {
        router.push('/record/step2')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
  }, [router])

  const handleSubmit = async () => {
    if (!step1Data || !step2Data || !step4Data) return
    
    setIsSubmitting(true)
    
    try {
      // 모든 Cafe Mode 데이터를 통합
      const cafeRecord = {
        // 기본 정보
        coffeeName: step1Data.coffeeName,
        roastery: step1Data.roastery,
        date: step1Data.date,
        mode: step1Data.mode,
        
        // Cafe 정보
        cafeName: step2Data.cafeName,
        cafeLocation: step2Data.cafeLocation,
        menuName: step2Data.menuName,
        price: step2Data.price,
        atmosphere: step2Data.atmosphere,
        companion: step2Data.companion,
        visitTime: step2Data.visitTime,
        
        // 맛 평가
        rating: step4Data.overallRating,
        taste: step4Data.flavorNotes || [], 
        tasteMode: 'cafe',
        
        // 감각 표현
        mood: step5Data?.mood,
        personalExpression: step5Data?.personalExpression,
        
        // 노트
        memo: step6Data?.personalNote || '',
        roasterNote: step6Data?.roasterNote || '',
        publicReview: step6Data?.publicReview,
        tags: step6Data?.tags || [],
        repurchase: step6Data?.repurchase,
        wouldRecommend: step6Data?.wouldRecommend,
        
        // 추가 Cafe Mode 데이터
        ...step2Data,
        ...step4Data,
        ...step5Data,
        ...step6Data,
      }

      // 임시로 로컬 스토리지에 저장 (나중에 Supabase 연동)
      console.log('Cafe Mode Record:', cafeRecord)
      
      // 성공 처리
      setIsCompleted(true)
      
      // 세션 스토리지 정리
      sessionStorage.removeItem('recordStep1')
      sessionStorage.removeItem('recordCafeStep2')
      sessionStorage.removeItem('recordCafeStep3')
      sessionStorage.removeItem('recordCafeStep4')
      sessionStorage.removeItem('recordCafeStep5')
      sessionStorage.removeItem('recordCafeStep6')
      
    } catch (error) {
      console.error('Record submission error:', error)
      alert('기록 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push('/record/cafe/step6')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleNewRecord = () => {
    router.push('/mode-selection')
  }

  if (!step1Data || !step2Data || !step4Data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center space-y-8">
            {/* 성공 아이콘 */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            
            {/* 완료 메시지 */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                🎉 기록이 완료되었습니다!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                <span className="font-medium text-blue-600">{step1Data.coffeeName}</span>에 대한 
                상세한 카페 경험이 성공적으로 저장되었습니다.
              </p>
            </div>

            {/* 요약 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">기록 요약</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">커피</span>
                  <span className="font-medium">{step1Data.coffeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">카페</span>
                  <span className="font-medium">{step2Data.cafeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">만족도</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < step4Data.overallRating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({step4Data.overallRating}/5)
                    </span>
                  </div>
                </div>
                {step5Data?.personalExpression && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 text-sm">나만의 표현</span>
                    <p className="text-gray-800 italic">"{step5Data.personalExpression}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleNewRecord}
                className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium flex items-center justify-center"
              >
                <Coffee className="h-5 w-5 mr-2" />
                새로운 기록 작성
              </button>
              <button
                onClick={handleGoHome}
                className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
              >
                <Home className="h-5 w-5 mr-2" />
                홈으로 가기
              </button>
            </div>

            {/* 추가 기능 */}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                이 기록을 다른 사람들과 공유하거나 나중에 수정할 수 있습니다
              </p>
              <div className="flex justify-center space-x-4">
                <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  공유하기
                </button>
                <button className="text-gray-600 hover:text-gray-700 flex items-center text-sm">
                  <Edit className="h-4 w-4 mr-1" />
                  수정하기
                </button>
              </div>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-blue-800">완료</h1>
            <div className="text-sm text-blue-600">7 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
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
              <Check className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">거의 다 끝났어요!</h2>
            <p className="text-blue-600">지금까지 작성한 내용을 확인하고 저장해보세요</p>
          </div>

          {/* 기록 미리보기 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">기록 미리보기</h3>
            
            {/* 기본 정보 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">커피 정보</h4>
                <p className="text-gray-800 font-medium">{step1Data.coffeeName}</p>
                {step1Data.roastery && (
                  <p className="text-sm text-gray-600">{step1Data.roastery}</p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">카페 정보</h4>
                <p className="text-gray-800 font-medium">{step2Data.cafeName}</p>
                {step2Data.cafeLocation && (
                  <p className="text-sm text-gray-600">{step2Data.cafeLocation}</p>
                )}
              </div>
            </div>

            {/* 평가 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">전체 만족도</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < step4Data.overallRating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">({step4Data.overallRating}/5)</span>
              </div>
            </div>

            {/* 맛 표현 */}
            {step4Data.flavorNotes && step4Data.flavorNotes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">맛 표현</h4>
                <div className="flex flex-wrap gap-2">
                  {step4Data.flavorNotes.slice(0, 5).map((note: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {note}
                    </span>
                  ))}
                  {step4Data.flavorNotes.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      +{step4Data.flavorNotes.length - 5}개 더
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 개인적 표현 */}
            {step5Data?.personalExpression && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">나만의 표현</h4>
                <p className="text-gray-800 italic bg-gray-50 p-3 rounded-lg">
                  "{step5Data.personalExpression}"
                </p>
              </div>
            )}

            {/* 태그 */}
            {step6Data?.tags && step6Data.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">태그</h4>
                <div className="flex flex-wrap gap-2">
                  {step6Data.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 추천 정보 */}
            {(step6Data?.repurchase !== undefined || step6Data?.wouldRecommend !== undefined) && (
              <div className="flex gap-4 text-sm">
                {step6Data?.repurchase !== undefined && (
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">재구매:</span>
                    <span className={step6Data.repurchase ? 'text-green-600' : 'text-orange-600'}>
                      {step6Data.repurchase ? '👍 또 마시고 싶어요' : '🤔 다른 걸 시도해보고 싶어요'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-lg font-medium flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-2 py-4 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-lg font-medium flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  저장하고 완료
                </>
              )}
            </button>
          </div>

          {/* 안내 메시지 */}
          <div className="text-center">
            <p className="text-sm text-blue-500">
              저장 후에도 언제든 수정하거나 다른 사람들과 공유할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}