'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, ArrowRight, ArrowLeft, User, Coffee, Camera, Tag } from 'lucide-react'
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
  [key: string]: any
}

interface CafeStep6Data {
  personalNote?: string // 개인적인 느낌과 기록
  roasterNote?: string // 로스터의 설명과 비교
  recommendation?: string // 추천 대상
  repurchase?: boolean // 재구매 의향
  tags?: string[] // 개인 태그
  privateNote?: string // 나만 보는 메모
  publicReview?: string // 공유용 리뷰
  wouldRecommend?: boolean // 다른 사람에게 추천 여부
}

const RECOMMENDATION_OPTIONS = [
  '커피 입문자에게', '산미를 좋아하는 사람에게', '단맛을 좋아하는 사람에게',
  '진한 커피를 원하는 사람에게', '부드러운 커피를 원하는 사람에게', '특별한 경험을 원하는 사람에게'
]

const COMMON_TAGS = [
  '아침커피', '오후커피', '디저트커피', '업무용', '휴식용', '데이트용',
  '혼자마시기좋은', '친구와함께', '특별한날', '일상커피', '기념일', '선물용'
]

export default function CafeStep6Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<CafeStep2Data | null>(null)
  const [step4Data, setStep4Data] = useState<CafeStep4Data | null>(null)
  const [formData, setFormData] = useState<CafeStep6Data>({
    tags: [],
    repurchase: undefined,
    wouldRecommend: undefined,
  })

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordCafeStep2')
    const saved4 = sessionStorage.getItem('recordCafeStep4')
    
    if (saved1 && saved2 && saved4) {
      const data1 = JSON.parse(saved1)
      const data2 = JSON.parse(saved2)
      const data4 = JSON.parse(saved4)
      setStep1Data(data1)
      setStep2Data(data2)
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
    const savedCafeStep6 = sessionStorage.getItem('recordCafeStep6')
    if (savedCafeStep6) {
      setFormData(JSON.parse(savedCafeStep6))
    }
  }, [router])

  const handleNext = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep6', JSON.stringify(formData))
    
    // 마지막 단계로 이동
    router.push('/record/cafe/step7')
  }

  const handleBack = () => {
    // 데이터 저장
    sessionStorage.setItem('recordCafeStep6', JSON.stringify(formData))
    router.push('/record/cafe/step5')
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-800">노트 작성</h1>
            <div className="text-sm text-blue-600">6 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '85.7%' }}
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
              <Edit3 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">마지막으로 기록을 정리해보세요</h2>
            <p className="text-blue-600">개인적인 생각과 다른 사람들과 나눌 이야기를 남겨보세요</p>
          </div>

          {/* 메인 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* 개인 노트 */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-3">
                <User className="inline h-5 w-5 mr-2" />
                개인적인 느낌과 기록
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="이 커피에 대한 개인적인 생각, 느낌, 경험을 자유롭게 적어보세요...&#10;예: 생각보다 산미가 강해서 놀랐지만, 마실수록 매력적이었다. 다음에는 디저트와 함께 마셔보고 싶다."
                value={formData.personalNote || ''}
                onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
              />
            </div>

            {/* 로스터 노트와 비교 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Coffee className="inline h-4 w-4 mr-1" />
                로스터의 설명과 실제 느낌 비교 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="로스터가 설명한 맛과 실제로 느낀 맛을 비교해보세요...&#10;예: 로스터 노트에는 '체리와 초콜릿'이라고 했는데, 나는 오렌지 느낌이 더 강했다."
                value={formData.roasterNote || ''}
                onChange={(e) => setFormData({ ...formData, roasterNote: e.target.value })}
              />
            </div>

            {/* 추천 대상 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                누구에게 추천하고 싶나요?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RECOMMENDATION_OPTIONS.map((rec) => (
                  <button
                    key={rec}
                    onClick={() => setFormData({ 
                      ...formData, 
                      recommendation: formData.recommendation === rec ? '' : rec 
                    })}
                    className={`p-3 rounded-lg text-sm border-2 transition-all ${
                      formData.recommendation === rec
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            {/* 재구매 의향과 추천 의향 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 재구매 의향 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  다시 마시고 싶나요?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, repurchase: true })}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      formData.repurchase === true
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-green-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">👍</div>
                    <div className="text-sm">네, 또 마시고 싶어요</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, repurchase: false })}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      formData.repurchase === false
                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-gray-200 hover:border-orange-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">🤔</div>
                    <div className="text-sm">다른 걸 시도해보고 싶어요</div>
                  </button>
                </div>
              </div>

              {/* 추천 의향 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  다른 사람에게 추천하시겠어요?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, wouldRecommend: true })}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      formData.wouldRecommend === true
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">💝</div>
                    <div className="text-sm">추천하고 싶어요</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, wouldRecommend: false })}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      formData.wouldRecommend === false
                        ? 'border-gray-500 bg-gray-50 text-gray-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">🤷</div>
                    <div className="text-sm">글세요...</div>
                  </button>
                </div>
              </div>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Tag className="inline h-4 w-4 mr-1" />
                이 커피를 표현하는 태그 (복수 선택 가능)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`p-2 rounded-lg text-xs border-2 transition-all ${
                      formData.tags?.includes(tag)
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 공유용 리뷰 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                다른 사람들과 공유할 한 줄 리뷰 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="다른 CupNote 사용자들과 공유할 짧은 리뷰를 써보세요...&#10;예: 산미가 깔끔하고 여운이 좋은 커피. 오후 시간에 마시기 딱 좋아요!"
                value={formData.publicReview || ''}
                onChange={(e) => setFormData({ ...formData, publicReview: e.target.value })}
              />
            </div>

            {/* 나만 보는 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔒 나만 보는 메모 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                rows={2}
                placeholder="개인적인 메모나 다음에 기억하고 싶은 것들...&#10;예: 다음에는 설탕 조금 넣어서 마셔보자"
                value={formData.privateNote || ''}
                onChange={(e) => setFormData({ ...formData, privateNote: e.target.value })}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 팁:</span> 모든 항목은 선택사항입니다. 
                지금 당장 생각이 안 나더라도 나중에 언제든 수정할 수 있어요!
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
              완료하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-blue-500">다음: 기록 완료 및 저장</p>
          </div>
        </div>
      </div>
    </div>
  )
}