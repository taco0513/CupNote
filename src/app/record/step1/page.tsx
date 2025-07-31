'use client'

import { useState, useEffect, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Coffee, ArrowRight, Calendar, MapPin, Store, ChevronDown, ChevronUp, Thermometer } from 'lucide-react'

import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import HelpTooltip from '../../../components/HelpTooltip'
import Navigation from '../../../components/Navigation'


interface Step1Data {
  coffeeName: string
  cafeName?: string // 카페 모드에서만 필수
  roastery: string
  date: string
  temperature: 'hot' | 'iced'
  mode: 'cafe' | 'homecafe' | 'pro'
  // 스페셜티 정보 (확장 패널)
  origin?: string
  variety?: string
  process?: string
  roastLevel?: string
  altitude?: number
  // 프로 모드 전용
  farmName?: string
  region?: string
  roastDate?: string
  lotNumber?: string
}

function RecordStep1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedMode = searchParams.get('mode') as 'cafe' | 'homecafe' | 'pro' | null

  const [formData, setFormData] = useState<Step1Data>({
    coffeeName: '',
    cafeName: '',
    roastery: '',
    date: new Date().toISOString().split('T')[0],
    temperature: 'hot',
    mode: selectedMode || 'cafe',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

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

    // 로스터리 필수 검증 (모든 모드)
    if (!formData.roastery.trim()) {
      newErrors.roastery = '로스터리를 입력해주세요'
    }

    // 모드별 필수 필드 검증
    if (formData.mode === 'cafe' && !formData.cafeName?.trim()) {
      newErrors.cafeName = '카페명을 입력해주세요'
    }

    if (formData.mode === 'pro') {
      if (!formData.cafeName?.trim()) {
        newErrors.cafeName = '카페명을 입력해주세요'
      }
      if (!formData.farmName?.trim()) {
        newErrors.farmName = '농장명을 입력해주세요'
      }
      if (!formData.region?.trim()) {
        newErrors.region = '지역을 입력해주세요'
      }
      if (!formData.variety?.trim()) {
        newErrors.variety = '품종을 입력해주세요'
      }
      if (!formData.process?.trim()) {
        newErrors.process = '가공방식을 선택해주세요'
      }
      if (!formData.roastDate) {
        newErrors.roastDate = '로스팅 날짜를 입력해주세요'
      }
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

            {/* 카페명 (카페/프로 모드에서만) */}
            {(formData.mode === 'cafe' || formData.mode === 'pro') && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Store className="h-4 w-4 mr-1" />
                  카페명 *
                  <HelpTooltip
                    title="카페 정보"
                    content="커피를 마신 카페나 장소를 적어주세요. 분위기와 경험이 커피 맛에 영향을 줄 수 있어요."
                    position="right"
                    className="ml-2"
                  />
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base md:text-lg transition-colors ${
                    errors.cafeName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="예: 블루보틀 청담점, 스타벅스 강남역점"
                  value={formData.cafeName || ''}
                  onChange={e => setFormData({ ...formData, cafeName: e.target.value })}
                />
                {errors.cafeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cafeName}</p>
                )}
              </div>
            )}

            {/* 로스터리 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                로스터리 *
                <HelpTooltip
                  title="로스터리란?"
                  content="커피를 로스팅한 곳이나 구매한 장소를 적어주세요. 카페 이름, 로스터리 브랜드, 온라인 쇼핑몰 등 어디서든 괜찮아요."
                  position="right"
                  className="ml-2"
                />
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base md:text-lg ${
                  errors.roastery ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="예: 블루보틀, 커피리브레, 로컬 로스터리..."
                value={formData.roastery}
                onChange={e => setFormData({ ...formData, roastery: e.target.value })}
              />
              {errors.roastery && (
                <p className="mt-1 text-sm text-red-600">{errors.roastery}</p>
              )}
            </div>

            {/* 온도 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Thermometer className="inline h-4 w-4 mr-1" />
                온도 *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, temperature: 'hot' })}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                    formData.temperature === 'hot'
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="font-medium">뜨거운 커피</div>
                  <div className="text-sm text-gray-600">HOT</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, temperature: 'iced' })}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                    formData.temperature === 'iced'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">🧊</div>
                  <div className="font-medium">차가운 커피</div>
                  <div className="text-sm text-gray-600">ICED</div>
                </button>
              </div>
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

          {/* Progressive Disclosure - 고급 옵션 */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-coffee-400 hover:bg-coffee-50 transition-all"
            >
              <span className="text-coffee-700 font-medium">
                {showAdvanced ? '스페셜티 정보 숨기기' : '더 자세한 정보 추가하기'}
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5 text-coffee-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-coffee-600" />
              )}
            </button>

            {/* 확장된 고급 옵션 */}
            {showAdvanced && (
              <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">스페셜티 커피 정보</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* 원산지 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      원산지 (Origin)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      placeholder="예: 에티오피아, 콜롬비아"
                      value={formData.origin || ''}
                      onChange={e => setFormData({ ...formData, origin: e.target.value })}
                    />
                  </div>

                  {/* 품종 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      품종 (Variety) {formData.mode === 'pro' && '*'}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                        errors.variety ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="예: 게이샤, 부르봉, 티피카"
                      value={formData.variety || ''}
                      onChange={e => setFormData({ ...formData, variety: e.target.value })}
                    />
                    {errors.variety && (
                      <p className="mt-1 text-sm text-red-600">{errors.variety}</p>
                    )}
                  </div>

                  {/* 가공방식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가공방식 (Process) {formData.mode === 'pro' && '*'}
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                        errors.process ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.process || ''}
                      onChange={e => setFormData({ ...formData, process: e.target.value })}
                    >
                      <option value="">선택해주세요</option>
                      <option value="washed">워시드 (Washed)</option>
                      <option value="natural">내추럴 (Natural)</option>
                      <option value="honey">허니 (Honey)</option>
                      <option value="anaerobic">아나에로빅 (Anaerobic)</option>
                      <option value="other">기타</option>
                    </select>
                    {errors.process && (
                      <p className="mt-1 text-sm text-red-600">{errors.process}</p>
                    )}
                  </div>

                  {/* 로스팅 레벨 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      로스팅 레벨
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      value={formData.roastLevel || ''}
                      onChange={e => setFormData({ ...formData, roastLevel: e.target.value })}
                    >
                      <option value="">선택해주세요</option>
                      <option value="light">라이트 로스트</option>
                      <option value="medium-light">미디엄 라이트</option>
                      <option value="medium">미디엄</option>
                      <option value="medium-dark">미디엄 다크</option>
                      <option value="dark">다크 로스트</option>
                    </select>
                  </div>

                  {/* 고도 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      고도 (Altitude)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                        placeholder="1500"
                        value={formData.altitude || ''}
                        onChange={e => setFormData({ ...formData, altitude: e.target.value ? Number(e.target.value) : undefined })}
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                        m
                      </span>
                    </div>
                  </div>
                </div>

                {/* 프로 모드 전용 필드 */}
                {formData.mode === 'pro' && (
                  <>
                    <hr className="my-6" />
                    <h4 className="text-md font-medium text-gray-800 mb-4">전문가 정보</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* 농장명 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          농장명 *
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                            errors.farmName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="예: 하라르 농장"
                          value={formData.farmName || ''}
                          onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                        />
                        {errors.farmName && (
                          <p className="mt-1 text-sm text-red-600">{errors.farmName}</p>
                        )}
                      </div>

                      {/* 지역 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          지역 *
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                            errors.region ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="예: 예가체프, 시다모"
                          value={formData.region || ''}
                          onChange={e => setFormData({ ...formData, region: e.target.value })}
                        />
                        {errors.region && (
                          <p className="mt-1 text-sm text-red-600">{errors.region}</p>
                        )}
                      </div>

                      {/* 로스팅 날짜 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          로스팅 날짜 *
                        </label>
                        <input
                          type="date"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent ${
                            errors.roastDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          value={formData.roastDate || ''}
                          onChange={e => setFormData({ ...formData, roastDate: e.target.value })}
                        />
                        {errors.roastDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.roastDate}</p>
                        )}
                      </div>

                      {/* 로트 번호 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          로트 번호
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                          placeholder="예: LOT-2023-001"
                          value={formData.lotNumber || ''}
                          onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
            <p className="text-sm text-coffee-700">
              <span className="font-medium">💡 팁:</span> 
              {formData.mode === 'pro' 
                ? ' 전문가 모드에서는 상세한 정보가 정확한 분석에 도움이 됩니다.'
                : ' 추가 정보는 선택사항이지만, 더 정확한 맛 분석에 도움이 돼요!'
              }
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
            {formData.mode === 'cafe'
              ? '카페 분위기 및 첫인상 평가'
              : formData.mode === 'homecafe'
                ? '홈카페 추출 레시피 설정'
                : formData.mode === 'pro'
                  ? 'SCA 표준 전문 분석'
                  : '맛 평가 및 기록'}
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
