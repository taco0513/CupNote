'use client'

import { useRouter } from 'next/navigation'
import { Coffee, Home, Clock, TrendingUp } from 'lucide-react'

import Navigation from '../../components/Navigation'
import { isFeatureEnabled } from '../../config/feature-flags.config'

interface ModeCard {
  id: 'cafe' | 'homecafe'
  icon: React.ReactNode
  title: string
  description: string
  duration: string
  badge?: string
  features: string[]
  popular?: boolean
  route: string
}

const modes: ModeCard[] = [
  {
    id: 'cafe',
    icon: <Coffee className="h-6 w-6" />,
    title: '카페 모드',
    description: '카페에서 마신 커피를 기록',
    duration: '5-7분',
    badge: '가장 인기',
    popular: true,
    features: [
      '카페와 로스터 정보',
      '향미 선택 (최대 5개)',
      '한국어 감각 표현',
      '개인 코멘트와 태그',
    ],
    route: '/tasting-flow/cafe/coffee-info',
  },
  {
    id: 'homecafe',
    icon: <Home className="h-6 w-6" />,
    title: '홈카페 모드',
    description: '집에서 직접 내린 커피를 기록',
    duration: '8-12분',
    badge: '레시피',
    features: [
      '드리퍼 및 추출 비율 설정',
      '원두량 다이얼 제어(±1g)',
      '실시간 물량 자동 계산',
      '추출 타이머 및 레시피 저장',
    ],
    route: '/tasting-flow/homecafe/coffee-info',
  },
]

export default function TastingFlowModePage() {
  const router = useRouter()

  // Feature flag 체크
  if (!isFeatureEnabled('ENABLE_NEW_TASTING_FLOW')) {
    router.push('/mode-selection')
    return null
  }

  const handleModeSelect = (route: string) => {
    // 세션 초기화
    sessionStorage.removeItem('tf_session')
    router.push(route)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-coffee-800 mb-3 md:mb-4">
            기록 모드를 선택하세요
          </h1>
          <p className="text-base md:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
            어떤 상황에서 커피를 마셨나요?
          </p>
        </div>

        {/* 모드 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.route)}
              className={`
                relative p-4 md:p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer group text-left w-full
                hover:shadow-xl md:hover:scale-105 md:hover:-translate-y-1
                ${mode.popular ? 'border-coffee-400 shadow-lg' : 'border-coffee-200 hover:border-coffee-300'}
              `}
            >
              {/* 배지 */}
              {mode.badge && (
                <div
                  className={`
                    absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-semibold
                    ${mode.popular ? 'bg-coffee-500 text-white' : 'bg-blue-100 text-blue-800'}
                  `}
                >
                  {mode.badge}
                </div>
              )}

              {/* 아이콘 및 제목 */}
              <div className="flex items-center mb-4">
                <div
                  className={`
                    p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform
                    ${mode.id === 'cafe' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                  `}
                >
                  {mode.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-coffee-800">{mode.title}</h3>
                  <p className="text-coffee-600 text-sm">{mode.description}</p>
                </div>
              </div>

              {/* 소요 시간 */}
              <div className="flex items-center mb-4 text-coffee-500">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">{mode.duration}</span>
              </div>

              {/* 주요 기능 */}
              <div className="space-y-2">
                {mode.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-coffee-700">
                    <div className="w-1.5 h-1.5 bg-coffee-400 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* 호버 효과 */}
              <div className="mt-4 pt-4 border-t border-coffee-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center text-coffee-600 text-sm font-medium">
                  <span>시작하기</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 md:mt-16 bg-white rounded-2xl p-6 md:p-8 border border-coffee-200">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-coffee-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-coffee-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-coffee-800 mb-2">처음이신가요?</h3>
            <p className="text-coffee-600 mb-4">
              카페 모드로 가볍게 시작해보세요. 익숙해지면 더 상세한 모드로 도전해보세요!
            </p>
            <div className="flex justify-center space-x-4 text-sm text-coffee-500">
              <div className="flex items-center">
                <Coffee className="h-4 w-4 mr-1" />
                <span>모든 모드 언제든 변경 가능</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}