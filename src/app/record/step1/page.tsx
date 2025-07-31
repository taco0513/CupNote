'use client'

import { useState, useEffect, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Coffee, ArrowRight, Calendar, MapPin } from 'lucide-react'

import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import HelpTooltip from '../../../components/HelpTooltip'
import Navigation from '../../../components/Navigation'


interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'pro'
}

function RecordStep1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedMode = searchParams.get('mode') as 'cafe' | 'homecafe' | 'pro' | null

  const [formData, setFormData] = useState<Step1Data>({
    coffeeName: '',
    roastery: '',
    date: new Date().toISOString().split('T')[0],
    mode: selectedMode || 'cafe',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (selectedMode) {
      setFormData(prev => ({ ...prev, mode: selectedMode }))
    }
  }, [selectedMode])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.coffeeName.trim()) {
      newErrors.coffeeName = '커피 이름을 입력해주세요'
    }

    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // 세션 스토리지에 데이터 저장
      sessionStorage.setItem('recordStep1', JSON.stringify(formData))

      // 모드에 따라 다른 경로로 이동
      if (formData.mode === 'quick') {
        router.push('/record/quick')
      } else if (formData.mode === 'cafe') {
        router.push('/record/cafe/step2')
      } else if (formData.mode === 'homecafe') {
        router.push('/record/homecafe')
      } else {
        router.push('/record/step2')
      }
    }
  }

  const handleBack = () => {
    router.push('/mode-selection')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">커피 기록하기</h1>
            <div className="text-sm text-coffee-600">1 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2 mb-4">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '25%' }}
            ></div>
          </div>

          {/* 선택된 모드 표시 */}
          <div className="flex items-center space-x-3">
            <div
              className={`
              flex items-center px-4 py-2 rounded-full text-sm font-medium
              ${
                formData.mode === 'cafe'
                  ? 'bg-blue-100 text-blue-800'
                  : formData.mode === 'homecafe'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
              }
            `}
            >
              {formData.mode === 'cafe' && '☕ 카페 모드'}
              {formData.mode === 'homecafe' && '🏠 홈카페 모드'}
              {formData.mode === 'pro' && '🔬 프로 모드'}
            </div>
            <span className="text-coffee-600 text-sm">
              {formData.mode === 'cafe' && '카페에서 간단히 기록'}
              {formData.mode === 'homecafe' && '집에서 내린 커피 + 레시피'}
              {formData.mode === 'pro' && '전문적인 분석과 평가'}
            </span>
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-100 rounded-full mb-4">
              <Coffee className="h-8 w-8 text-coffee-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">기본 정보</h2>
            <p className="text-coffee-600">어떤 커피를 마셨는지 알려주세요</p>
          </div>

          <div className="space-y-6">
            {/* 커피 이름 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                커피 이름 *
                <HelpTooltip
                  title="커피 이름 작성 팁"
                  content="원산지나 블렌드명을 포함해서 적으면 나중에 검색하기 쉬워요. 예: '에티오피아 예가체프', '하우스 블렌드', '콜드브루 원두' 등"
                  position="right"
                  className="ml-2"
                />
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base md:text-lg transition-colors ${
                  errors.coffeeName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="예: 에티오피아 예가체프"
                value={formData.coffeeName}
                onChange={e => setFormData({ ...formData, coffeeName: e.target.value })}
              />
              {errors.coffeeName && (
                <p className="mt-1 text-sm text-red-600">{errors.coffeeName}</p>
              )}
            </div>

            {/* 로스터리 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                로스터리 (선택)
                <HelpTooltip
                  title="로스터리란?"
                  content="커피를 로스팅한 곳이나 구매한 장소를 적어주세요. 카페 이름, 로스터리 브랜드, 온라인 쇼핑몰 등 어디서든 괜찮아요."
                  position="right"
                  className="ml-2"
                />
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base md:text-lg"
                placeholder="예: 블루보틀, 스타벅스, 로컬 카페..."
                value={formData.roastery}
                onChange={e => setFormData({ ...formData, roastery: e.target.value })}
              />
              <p className="mt-1 text-sm text-gray-500">어디서 구매했거나 마셨는지 적어주세요</p>
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                날짜 *
              </label>
              <input
                type="date"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base md:text-lg ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
            <p className="text-sm text-coffee-700">
              <span className="font-medium">💡 팁:</span> 커피 이름은 원산지나 블렌드명을 포함해서
              적으면 좋아요! 나중에 검색할 때 더 쉽게 찾을 수 있어요.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
          <button
            onClick={handleBack}
            className="flex-1 py-3 md:py-4 px-4 md:px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-base md:text-lg font-medium"
          >
            뒤로
          </button>
          <button
            onClick={handleNext}
            className="flex-2 py-3 md:py-4 px-6 md:px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-base md:text-lg font-medium flex items-center justify-center"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">
            다음:{' '}
            {formData.mode === 'quick'
              ? '빠른 평가 및 완료'
              : formData.mode === 'cafe'
                ? '카페 정보 입력'
                : formData.mode === 'homecafe'
                  ? '추출 방법 설정'
                  : '전문 분석 설정'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RecordStep1Page() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
              <p className="text-coffee-600">로딩 중...</p>
            </div>
          </div>
        }
      >
        <RecordStep1Content />
      </Suspense>
    </ProtectedRoute>
  )
}
