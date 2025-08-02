'use client'

import { useRouter } from 'next/navigation'
import { Coffee, Home, Clock, TrendingUp, Users } from 'lucide-react'

import Navigation from '../../components/Navigation'
import PageLayout from '../../components/ui/PageLayout'
import PageHeader from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
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

const ModeCardComponent = ({ mode }: { mode: ModeCard }) => {
  const router = useRouter()

  const handleSelect = () => {
    // 세션 초기화
    sessionStorage.removeItem('tf_session')
    router.push(mode.route)
  }

  return (
    <Card 
      variant={mode.popular ? 'elevated' : 'default'}
      hover
      className="h-full relative group cursor-pointer bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all duration-200"
      onClick={handleSelect}
    >
      {/* 하이브리드 스타일 배지 */}
      {mode.badge && (
        <div className="absolute -top-3 -right-3">
          <Badge 
            variant={mode.popular ? 'primary' : 'default'} 
            size="medium" 
            className="shadow-md"
          >
            {mode.badge}
          </Badge>
        </div>
      )}

      <CardContent className="p-6">
        {/* 아이콘 및 제목 - 하이브리드 그라디언트 */}
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-xl mr-4 bg-gradient-to-r from-coffee-400 to-coffee-500 text-white shadow-lg group-hover:scale-110 transition-transform">
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
          <span className="text-sm font-medium">{mode.duration}</span>
        </div>

        {/* 주요 기능 */}
        <div className="space-y-2 mb-4">
          {mode.features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-coffee-700">
              <div className="w-1.5 h-1.5 rounded-full mr-3 bg-coffee-500" />
              {feature}
            </div>
          ))}
        </div>

        {/* 하이브리드 호버 효과 */}
        <div className="pt-4 border-t border-coffee-100/50 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="flex items-center text-sm font-medium text-coffee-500">
            <span>시작하기</span>
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TastingFlowModePage() {
  const router = useRouter()

  // Feature flag 체크
  if (!isFeatureEnabled('ENABLE_NEW_TASTING_FLOW')) {
    router.push('/mode-selection')
    return null
  }

  return (
    <>
      <Navigation showBackButton currentPage="record" />
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="기록 모드를 선택하세요"
          description="어떤 상황에서 커피를 마셨나요?"
          icon={<Coffee className="h-6 w-6" />}
        />

        {/* 모드 카드들 - 하이브리드 디자인 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {modes.map((mode) => (
            <ModeCardComponent key={mode.id} mode={mode} />
          ))}
        </div>

        {/* 하단 안내 - 하이브리드 프리미엄 카드 */}
        <Card variant="elevated" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-coffee-800 mb-3">처음이신가요?</h3>
              <p className="text-coffee-600 mb-6 text-lg">
                카페 모드로 가볍게 시작해보세요. 익숙해지면 더 상세한 모드로 도전해보세요!
              </p>
              <div className="flex justify-center space-x-6 text-sm text-coffee-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>85% 사용자가 카페 모드 선택</span>
                </div>
                <div className="flex items-center">
                  <Coffee className="h-4 w-4 mr-2" />
                  <span>모든 모드 언제든 변경 가능</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    </>
  )
}