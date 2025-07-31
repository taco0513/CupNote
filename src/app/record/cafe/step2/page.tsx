'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, ArrowRight, ArrowLeft, MapPin, DollarSign, Users, Clock } from 'lucide-react'
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
  cafeLocation?: string
  menuName?: string
  price?: number
  atmosphere?: string
  companion?: string
  visitTime?: string
  notes?: string
}

export default function CafeStep2Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [formData, setFormData] = useState<CafeStep2Data>({
    cafeName: '',
  })

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
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
    const savedCafeStep2 = sessionStorage.getItem('recordCafeStep2')
    if (savedCafeStep2) {
      setFormData(JSON.parse(savedCafeStep2))
    }
  }, [router])

  const handleNext = () => {
    if (!formData.cafeName.trim()) {
      alert('카페명을 입력해주세요.')
      return
    }

    // 데이터 저장
    sessionStorage.setItem('recordCafeStep2', JSON.stringify(formData))
    
    // 다음 단계로 이동
    router.push('/record/cafe/step3')
  }

  const handleBack = () => {
    router.push('/record/step1')
  }

  if (!step1Data) {
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
            <h1 className="text-3xl font-bold text-blue-800">카페 정보</h1>
            <div className="text-sm text-blue-600">2 / 7</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '28.5%' }}
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
              {step1Data.roastery && (
                <p className="text-sm text-blue-600">{step1Data.roastery}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Coffee className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">카페 정보를 알려주세요</h2>
            <p className="text-blue-600">어떤 카페에서 이 커피를 마셨나요?</p>
          </div>

          {/* 메인 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            
            {/* 카페명 (필수) */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-3">
                <MapPin className="inline h-5 w-5 mr-2" />
                카페명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="예: 블루보틀 청담점"
                value={formData.cafeName}
                onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
              />
            </div>

            {/* 위치 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                카페 위치 (선택)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 서울 강남구 청담동"
                value={formData.cafeLocation || ''}
                onChange={(e) => setFormData({ ...formData, cafeLocation: e.target.value })}
              />
            </div>

            {/* 메뉴명과 가격 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메뉴명 (선택)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 드립 커피"
                  value={formData.menuName || ''}
                  onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  가격 (선택)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 5500"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* 방문 시간과 동행자 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  방문 시간 (선택)
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.visitTime || ''}
                  onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                >
                  <option value="">선택해주세요</option>
                  <option value="morning">오전 (6-12시)</option>
                  <option value="afternoon">오후 (12-18시)</option>
                  <option value="evening">저녁 (18-22시)</option>
                  <option value="night">늦은 밤 (22시 이후)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  누구와 함께? (선택)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 친구, 동료, 혼자"
                  value={formData.companion || ''}
                  onChange={(e) => setFormData({ ...formData, companion: e.target.value })}
                />
              </div>
            </div>

            {/* 카페 분위기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카페 분위기 (선택)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['조용한', '활기찬', '아늑한', '모던한', '빈티지', '로맨틱한', '캐주얼한', '고급스러운'].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setFormData({ 
                      ...formData, 
                      atmosphere: formData.atmosphere === mood ? '' : mood 
                    })}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      formData.atmosphere === mood
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* 추가 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 메모 (선택)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="카페에 대한 추가 정보나 느낌을 자유롭게 적어보세요..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 팁:</span> 카페명만 입력해도 다음 단계로 넘어갈 수 있어요. 
                나중에 언제든 수정할 수 있습니다!
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
              첫인상 기록하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* 다음 단계 미리보기 */}
          <div className="text-center">
            <p className="text-sm text-blue-500">다음: 커피의 첫인상과 아로마</p>
          </div>
        </div>
      </div>
    </div>
  )
}