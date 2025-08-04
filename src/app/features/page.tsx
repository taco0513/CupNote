/**
 * 주요 기능 소개 페이지
 */
'use client'

import Link from 'next/link'
import { Coffee, Target, BarChart3, Trophy, Smartphone, Users, Clock, Shield, ArrowRight, Sparkles, Bell } from 'lucide-react'

import Navigation from '../../components/Navigation'
import { Card, CardContent } from '../../components/ui/Card'
import PageLayout from '../../components/ui/PageLayout'
import PageHeader from '../../components/ui/PageHeader'
import UnifiedButton from '../../components/ui/UnifiedButton'

const features = [
  {
    icon: <Target className="h-6 w-6" />,
    title: '3-Mode 시스템',
    description: '상황에 맞는 3가지 전문화된 기록 모드',
    details: [
      'Cafe Mode: 카페 방문 기록 (5-7분)',
      'HomeCafe Mode: 홈카페 레시피 관리 (8-12분)',
      'Lab Mode: SCA 표준 전문가 평가 (15-20분)'
    ],
    color: 'from-blue-400 to-blue-600'
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI 고급 분석',
    description: '개인화된 AI 기반 취향 분석',
    details: [
      '맛 프로파일 레이더 차트',
      '계절별 취향 변화 추적',
      'AI 카페 & 원두 추천',
      '로스터리 선호도 트렌드'
    ],
    color: 'from-purple-400 to-purple-600',
    badge: 'NEW'
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: '성취 시스템',
    description: '재미있는 도전과 보상',
    details: [
      '30+ 다양한 배지',
      '레벨 & 경험치 시스템',
      '개인 성장 시각화',
      '커피 여정 타임라인'
    ],
    color: 'from-amber-400 to-amber-600'
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: '스마트 알림',
    description: '놓치지 않는 커피 일기',
    details: [
      '커피 리마인더 설정',
      '성취 달성 알림',
      '통계 업데이트 알림',
      '브라우저 푸시 알림'
    ],
    color: 'from-green-400 to-green-600',
    badge: 'NEW'
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: '통계 & 분석',
    description: '데이터로 보는 나의 커피 취향',
    details: [
      '월별 기록 추이',
      '평점 분포 분석',
      '선호도 패턴 발견',
      '데이터 내보내기/가져오기'
    ],
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'PWA 기능',
    description: '언제 어디서나 사용 가능',
    details: [
      '오프라인 지원',
      '앱 설치 가능',
      '백그라운드 동기화',
      '네이티브 앱 경험'
    ],
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: '홈카페 타이머',
    description: '정밀한 추출 도구',
    details: [
      '통합 추출 타이머',
      '장비별 맞춤 가이드',
      '레시피 라이브러리',
      '분쇄도 추천'
    ],
    color: 'from-orange-400 to-orange-600'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: '커뮤니티 (예정)',
    description: '함께 만드는 커피 문화',
    details: [
      '같은 원두 기록 비교',
      '온라인 블라인드 테이스팅',
      '경험 공유 & 학습',
      '로스터리 파트너십'
    ],
    color: 'from-pink-400 to-pink-600',
    badge: 'SOON'
  }
]

export default function FeaturesPage() {
  return (
    <>
      <Navigation showBackButton currentPage="features" />
      
      <PageLayout showHeader={false}>
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <PageHeader 
            title="CupNote 주요 기능"
            description="커피를 기록하는 가장 스마트한 방법"
            icon={<Coffee className="h-6 w-6" />}
          />

          {/* 기능 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white/90 backdrop-blur-sm border border-coffee-200/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        feature.badge === 'NEW' ? 'bg-green-100 text-green-700' :
                        feature.badge === 'SOON' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-coffee-600 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-coffee-400 mr-2">•</span>
                        <span className="text-xs text-coffee-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA 섹션 */}
          <Card className="bg-gradient-to-br from-coffee-50 to-amber-50 backdrop-blur-sm border border-coffee-200/50 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-coffee-800 mb-4">
                준비되셨나요?
              </h2>
              <p className="text-coffee-600 mb-6 max-w-2xl mx-auto">
                지금 바로 CupNote를 시작하고 당신만의 커피 여정을 기록해보세요.
                간단한 회원가입만으로 모든 기능을 무료로 이용할 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <UnifiedButton 
                    variant="primary" 
                    size="large"
                    className="w-full sm:w-auto bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 shadow-md hover:shadow-lg"
                  >
                    <Coffee className="h-5 w-5 mr-2" />
                    회원가입하고 시작하기
                  </UnifiedButton>
                </Link>
                <Link href="/demo">
                  <UnifiedButton 
                    variant="outline" 
                    size="large"
                    className="w-full sm:w-auto border-coffee-300 text-coffee-700 hover:bg-coffee-50"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    샘플 기록 보기
                  </UnifiedButton>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <div className="mt-12 text-center">
            <Card className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md inline-block">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-6">
                  <div>
                    <div className="text-2xl font-bold text-coffee-800">100%</div>
                    <div className="text-sm text-coffee-600">무료</div>
                  </div>
                  <div className="w-px h-12 bg-coffee-200"></div>
                  <div>
                    <div className="text-2xl font-bold text-coffee-800">PWA</div>
                    <div className="text-sm text-coffee-600">오프라인 지원</div>
                  </div>
                  <div className="w-px h-12 bg-coffee-200"></div>
                  <div>
                    <div className="text-2xl font-bold text-coffee-800">v1.3</div>
                    <div className="text-sm text-coffee-600">최신 버전</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </>
  )
}