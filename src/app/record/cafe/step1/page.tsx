'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  ArrowLeft, 
  Coffee,
  MapPin,
  Thermometer,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Navigation from '../../../../components/Navigation'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'pro'
}

interface CafeData {
  cafeName: string
  menuName: string
  roastery: string
  price: string
  temperature: 'hot' | 'iced'
  origin?: string
  variety?: string
  altitude?: string
  roastLevel?: string
  processing?: string
}

export default function CafeStep1Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [cafeData, setCafeData] = useState<CafeData>({
    cafeName: '',
    menuName: '',
    roastery: '',
    price: '',
    temperature: 'hot',
    origin: '',
    variety: '',
    altitude: '',
    roastLevel: '',
    processing: ''
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      if (data1.mode !== 'cafe') {
        router.push('/mode-selection')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
  }, [router])

  const handleNext = () => {
    // Foundation 문서의 필수 입력 검증
    if (!cafeData.cafeName.trim() || !cafeData.menuName.trim() || !cafeData.roastery.trim()) {
      alert('카페명, 커피명, 로스터리는 필수 입력 항목입니다.')
      return
    }

    // Foundation 문서의 출력 데이터 구조
    const cafeStepData = {
      cafe_name: cafeData.cafeName,
      coffee_name: cafeData.menuName,
      roastery: cafeData.roastery,
      price: cafeData.price,
      temperature: cafeData.temperature,
      
      // 선택적 커피 상세 정보
      origin: cafeData.origin,
      variety: cafeData.variety,
      altitude: cafeData.altitude,
      roast_level: cafeData.roastLevel,
      processing: cafeData.processing,
      
      // 메타데이터
      input_timestamp: new Date(),
      cafe_mode: true
    }
    
    sessionStorage.setItem('cafeStep1', JSON.stringify(cafeStepData))
    router.push('/record/cafe/step2')
  }

  const handleBack = () => {
    router.push('/mode-selection')
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
            <h1 className="text-3xl font-bold text-blue-800">카페 & 커피 정보</h1>
            <div className="text-sm text-blue-600">1 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '25%' }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                ☕ 카페 모드
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
          {/* Foundation 문서의 헤더 구조 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">어느 카페에서 마셨나요?</h2>
            <p className="text-blue-600 mb-4">카페와 커피 정보를 입력해주세요</p>
          </div>

          {/* Foundation 문서의 메인 입력 영역 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* 카페 정보 섹션 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                카페 정보
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카페명 *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 블루보틀 한남점"
                    value={cafeData.cafeName}
                    onChange={(e) => setCafeData({ ...cafeData, cafeName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 커피 정보 섹션 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Coffee className="h-5 w-5 mr-2 text-blue-600" />
                커피 정보
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    로스터리 *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 블루보틀, 커피빈앤티리프"
                    value={cafeData.roastery}
                    onChange={(e) => setCafeData({ ...cafeData, roastery: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    커피명/메뉴명 *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 에티오피아 예가체프, 아메리카노"
                    value={cafeData.menuName}
                    onChange={(e) => setCafeData({ ...cafeData, menuName: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가격 (선택)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 6,000원"
                      value={cafeData.price}
                      onChange={(e) => setCafeData({ ...cafeData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      온도 *
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCafeData({ ...cafeData, temperature: 'hot' })}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                          cafeData.temperature === 'hot'
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <Thermometer className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-medium">Hot</div>
                      </button>
                      <button
                        onClick={() => setCafeData({ ...cafeData, temperature: 'iced' })}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                          cafeData.temperature === 'iced'
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <Thermometer className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-medium">Iced</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foundation 문서의 선택적 상세 정보 - 접기/펼치기 */}
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <Coffee className="h-5 w-5 mr-2 text-blue-600" />
                  커피 상세 정보 (선택사항)
                </h3>
                {showDetails ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {showDetails && (
                <div className="mt-4 space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      원산지
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="예: 에티오피아 예가체프"
                      value={cafeData.origin}
                      onChange={(e) => setCafeData({ ...cafeData, origin: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        품종
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="예: 아라비카, 게이샤"
                        value={cafeData.variety}
                        onChange={(e) => setCafeData({ ...cafeData, variety: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        고도
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="예: 1,500m, 1,800-2,000m"
                        value={cafeData.altitude}
                        onChange={(e) => setCafeData({ ...cafeData, altitude: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        로스팅 레벨
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        value={cafeData.roastLevel}
                        onChange={(e) => setCafeData({ ...cafeData, roastLevel: e.target.value })}
                      >
                        <option value="">선택하세요</option>
                        <option value="라이트 로스트">라이트 로스트</option>
                        <option value="미디엄 라이트">미디엄 라이트</option>
                        <option value="미디엄">미디엄</option>
                        <option value="미디엄 다크">미디엄 다크</option>
                        <option value="다크 로스트">다크 로스트</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가공방식
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        value={cafeData.processing}
                        onChange={(e) => setCafeData({ ...cafeData, processing: e.target.value })}
                      >
                        <option value="">선택하세요</option>
                        <option value="워시드">워시드</option>
                        <option value="내추럴">내추럴</option>
                        <option value="허니">허니</option>
                        <option value="펄프드 내추럴">펄프드 내추럴</option>
                      </select>
                    </div>
                  </div>

                  {/* 상세 정보 입력 완료 표시 */}
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      💡 상세 정보는 더 정확한 커피 기록을 위해 도움이 됩니다
                    </p>
                  </div>
                </div>
              )}
            </div>
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
            disabled={!cafeData.cafeName.trim() || !cafeData.menuName.trim() || !cafeData.roastery.trim()}
            className="flex-2 py-4 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-500">다음: 향미 선택 (최대 5개)</p>
        </div>
      </div>
    </div>
  )
}