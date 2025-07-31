'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import {
  Settings,
  ArrowRight,
  ArrowLeft,
  Coffee,
  Home,
  Beaker,
  Clock,
  Thermometer,
  Droplets,
} from 'lucide-react'

import Navigation from '../../../components/Navigation'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'pro'
}

interface Step2Data {
  // Cafe mode - 간단한 추가 정보
  origin?: string
  roastLevel?: string

  // HomeCafe mode - 추출 정보
  brewMethod?: string
  grindSize?: string
  waterTemp?: string
  brewTime?: string
  ratio?: string

  // Lab mode - 전문 정보
  variety?: string
  process?: string
  altitude?: string
  tds?: string
  extraction?: string
}

export default function RecordStep2Page() {
  const router = useRouter()

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [formData, setFormData] = useState<Step2Data>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Step 1 데이터 불러오기
    const saved = sessionStorage.getItem('recordStep1')
    if (saved) {
      setStep1Data(JSON.parse(saved))
    } else {
      // Step 1 데이터가 없으면 처음으로 돌아감
      router.push('/mode-selection')
    }
  }, [router])

  const handleNext = () => {
    // 세션 스토리지에 데이터 저장
    sessionStorage.setItem('recordStep2', JSON.stringify(formData))

    // Step 3으로 이동
    router.push('/record/step3')
  }

  const handleBack = () => {
    router.push('/record/step1')
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

  const renderCafeMode = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Coffee className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-coffee-800 mb-2">카페 정보</h2>
        <p className="text-coffee-600">추가 정보가 있다면 입력해주세요 (선택사항)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">원산지</label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
          placeholder="예: 콜롬비아, 에티오피아, 브라질..."
          value={formData.origin || ''}
          onChange={e => setFormData({ ...formData, origin: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">로스팅 정도</label>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
          value={formData.roastLevel || ''}
          onChange={e => setFormData({ ...formData, roastLevel: e.target.value })}
        >
          <option value="">선택하세요</option>
          <option value="light">라이트 로스트</option>
          <option value="medium-light">미디엄 라이트</option>
          <option value="medium">미디엄 로스트</option>
          <option value="medium-dark">미디엄 다크</option>
          <option value="dark">다크 로스트</option>
        </select>
      </div>
    </div>
  )

  const renderHomeCafeMode = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Home className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-coffee-800 mb-2">추출 방법</h2>
        <p className="text-coffee-600">어떻게 커피를 내렸는지 알려주세요</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">추출 방법</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            value={formData.brewMethod || ''}
            onChange={e => setFormData({ ...formData, brewMethod: e.target.value })}
          >
            <option value="">선택하세요</option>
            <option value="v60">V60</option>
            <option value="chemex">케멕스</option>
            <option value="aeropress">에어로프레스</option>
            <option value="french-press">프렌치프레스</option>
            <option value="espresso">에스프레소</option>
            <option value="moka">모카포트</option>
            <option value="cold-brew">콜드브루</option>
            <option value="other">기타</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">분쇄도</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            value={formData.grindSize || ''}
            onChange={e => setFormData({ ...formData, grindSize: e.target.value })}
          >
            <option value="">선택하세요</option>
            <option value="extra-fine">매우 고운</option>
            <option value="fine">고운</option>
            <option value="medium-fine">중간-고운</option>
            <option value="medium">중간</option>
            <option value="medium-coarse">중간-굵은</option>
            <option value="coarse">굵은</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Thermometer className="inline h-4 w-4 mr-1" />물 온도
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            placeholder="예: 93°C"
            value={formData.waterTemp || ''}
            onChange={e => setFormData({ ...formData, waterTemp: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            추출 시간
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            placeholder="예: 2분 30초"
            value={formData.brewTime || ''}
            onChange={e => setFormData({ ...formData, brewTime: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Droplets className="inline h-4 w-4 mr-1" />
            비율
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            placeholder="예: 1:15"
            value={formData.ratio || ''}
            onChange={e => setFormData({ ...formData, ratio: e.target.value })}
          />
        </div>
      </div>
    </div>
  )

  const renderProMode = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Beaker className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-coffee-800 mb-2">SCA 표준 분석</h2>
        <p className="text-coffee-600">SCA 기준에 따른 전문가급 커피 품질 평가 데이터를 입력해주세요</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">품종</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            placeholder="예: 아라비카, 게이샤, 부르봉..."
            value={formData.variety || ''}
            onChange={e => setFormData({ ...formData, variety: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">가공 방식</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            value={formData.process || ''}
            onChange={e => setFormData({ ...formData, process: e.target.value })}
          >
            <option value="">선택하세요</option>
            <option value="washed">워시드</option>
            <option value="natural">내추럴</option>
            <option value="honey">허니</option>
            <option value="semi-washed">세미워시드</option>
            <option value="anaerobic">혐기발효</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">재배 고도</label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
          placeholder="예: 1,200m"
          value={formData.altitude || ''}
          onChange={e => setFormData({ ...formData, altitude: e.target.value })}
        />
      </div>

      {/* SCA 표준 품질 측정 */}
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
          <Beaker className="h-5 w-5 mr-2" />
          SCA 표준 품질 측정
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              TDS (%) - 농도 측정
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="1.35"
              value={formData.tds || ''}
              onChange={e => setFormData({ ...formData, tds: e.target.value })}
            />
            <p className="text-xs text-purple-600 mt-1">표준: 1.15-1.35% (커피강도 기준)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              추출 수율 (%) - 자동 계산
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="20.5"
              value={formData.extraction || ''}
              onChange={e => setFormData({ ...formData, extraction: e.target.value })}
            />
            <p className="text-xs text-purple-600 mt-1">SCA 표준: 18-22% (최적 추출 범위)</p>
          </div>
        </div>

        {/* SCA 기준 상태 표시 */}
        {formData.extraction && (
          <div className="mt-4 p-3 rounded-lg flex items-center">
            {Number(formData.extraction) < 18 ? (
              <div className="flex items-center text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                미추출 (Under-extracted)
              </div>
            ) : Number(formData.extraction) > 22 ? (
              <div className="flex items-center text-orange-700 bg-orange-100 px-3 py-2 rounded-lg">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                과추출 (Over-extracted)
              </div>
            ) : (
              <div className="flex items-center text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                적정 추출 (Optimal)
              </div>
            )}
          </div>
        )}
      </div>

      {/* 추가 SCA 파라미터 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">물 경도 (ppm)</label>
          <input
            type="number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            placeholder="150"
            value={formData.waterHardness || ''}
            onChange={e => setFormData({ ...formData, waterHardness: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">SCA 권장: 150-300 ppm</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">물 pH</label>
          <input
            type="number"
            step="0.1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
            placeholder="7.0"
            value={formData.waterPH || ''}
            onChange={e => setFormData({ ...formData, waterPH: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">SCA 표준: 6.5-7.5</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-coffee-800">커피 기록하기</h1>
            <div className="text-sm text-coffee-600">2 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2 mb-4">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '50%' }}
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
                {step1Data.mode === 'pro' && '🔬 프로 모드'}
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
          {step1Data.mode === 'cafe' && renderCafeMode()}
          {step1Data.mode === 'homecafe' && renderHomeCafeMode()}
          {step1Data.mode === 'pro' && renderProMode()}

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
            <p className="text-sm text-coffee-700">
              <span className="font-medium">💡 팁:</span>
              {step1Data.mode === 'cafe' &&
                ' 모르는 정보는 비워두셔도 괜찮아요. 나중에 수정할 수 있어요!'}
              {step1Data.mode === 'homecafe' &&
                ' 정확한 레시피를 기록하면 다음에 같은 맛을 재현하기 쉬워요!'}
              {step1Data.mode === 'pro' &&
                ' 전문 데이터가 있으면 더 정확한 분석을 제공할 수 있어요!'}
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
          <p className="text-sm text-coffee-500">다음: 맛 평가 및 점수 입력</p>
        </div>
      </div>
    </div>
  )
}
