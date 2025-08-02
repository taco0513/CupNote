'use client'

import Link from 'next/link'

import { Coffee, Home, Beaker, Clock, Users, TrendingUp, Zap } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import { TASTING_MODES_CONFIG, getModeColor, getModeGradient, UI_LABELS } from '../../config'
import GuestModeIndicator from '../../components/GuestModeIndicator'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import AuthModal from '../../components/auth/AuthModal'
import PageLayout from '../../components/ui/PageLayout'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Alert from '../../components/ui/Alert'

interface ModeCardProps {
  mode: 'cafe' | 'homecafe'
  icon: React.ReactNode
  title: string
  description: string
  duration: string
  badge?: string
  features: string[]
  popular?: boolean
  category?: '카페방문' | '직접추출'
}

const ModeCard = ({
  mode,
  icon,
  title,
  description,
  duration,
  badge,
  features,
  popular = false,
  category,
}: ModeCardProps) => {
  const badgeVariant = mode === 'cafe' && popular ? 'primary' : mode === 'homecafe' ? 'success' : 'default'
  
  return (
    <Link href={TASTING_MODES_CONFIG[mode].route}>
      <Card 
        variant={popular ? 'elevated' : 'bordered'}
        hover
        className="h-full relative"
      >
        {/* 배지 */}
        {badge && (
          <div className="absolute -top-3 -right-3">
            <Badge variant={badgeVariant} size="medium">
              {badge}
            </Badge>
          </div>
        )}

        <CardContent>
          {/* 아이콘 및 제목 */}
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl mr-4 bg-coffee-500/10 text-coffee-500 shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-coffee-800">{title}</h3>
              <p className="text-coffee-600 text-sm">{description}</p>
            </div>
          </div>

          {/* 소요 시간 */}
          <div className="flex items-center mb-4 text-coffee-500">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{duration}</span>
          </div>

          {/* 주요 기능 */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-coffee-700">
                <div className="w-1.5 h-1.5 rounded-full mr-3 bg-coffee-500" />
                {feature}
              </div>
            ))}
          </div>

          {/* 호버 효과 */}
          <div className="mt-4 pt-4 border-t border-coffee-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
    </Link>
  )
}

export default function ModeSelectionPage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    // <ProtectedRoute> {/* 임시로 비활성화 - 게스트 사용자 테스트를 위해 */}
    <>
      <Navigation showBackButton currentPage="record" />
      <PageLayout
        title={UI_LABELS.record.selectMode}
        description={UI_LABELS.tips.selectMode}
        showHeader={false}
      >
        
        {/* 게스트 모드 표시 */}
        {!user && (
          <GuestModeIndicator 
            variant="banner" 
            onLoginClick={() => openAuthModal('login')}
            className="mb-6"
          />
        )}

        {/* 헤더 - 하이브리드 디자인 */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">
              {UI_LABELS.record.selectMode}
            </h1>
          </div>
          <p className="text-base md:text-lg text-coffee-600 max-w-2xl mx-auto px-4">
            {UI_LABELS.tips.selectMode}
          </p>
        </div>

          {/* 모드 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Quick Mode - 임시 비활성화 
            <ModeCard
              mode="quick"
              icon={<Zap className="h-6 w-6" />}
              title={TASTING_MODES_CONFIG.quick.labelKr}
              description={TASTING_MODES_CONFIG.quick.description}
              duration={TASTING_MODES_CONFIG.quick.estimatedTime}
              badge="NEW"
              category="카페방문"
              features={[
                '최소한의 정보만 입력',
                '별점과 간단한 메모',
                '1-2분 내 완성',
                '나중에 상세 정보 추가 가능',
              ]}
            />
            */}

            {/* Cafe Mode */}
            <ModeCard
              mode="cafe"
              icon={<Coffee className="h-6 w-6" />}
              title={TASTING_MODES_CONFIG.cafe.labelKr}
              description={TASTING_MODES_CONFIG.cafe.description}
              duration={TASTING_MODES_CONFIG.cafe.estimatedTime}
              badge="가장 인기"
              popular={true}
              category="카페방문"
              features={[
                '카페와 로스터 정보',
                '향미 선택 (최대 5개)',
                '한국어 감각 표현',
                '개인 코멘트와 태그',
              ]}
            />

            {/* HomeCafe Mode */}
            <ModeCard
              mode="homecafe"
              icon={<Home className="h-6 w-6" />}
              title={TASTING_MODES_CONFIG.homecafe.labelKr}
              description={TASTING_MODES_CONFIG.homecafe.description}
              duration={TASTING_MODES_CONFIG.homecafe.estimatedTime}
              badge="레시피"
              category="직접추출"
              features={[
                '드리퍼 및 추출 비율 설정',
                '원두량 다이얼 제어(±1g)',
                '실시간 물량 자동 계산',
                '추출 타이머 및 레시피 저장',
              ]}
            />

            {/* Lab Mode removed - features merged into HomeCafe Mode */}
          </div>

          {/* 모드 카테고리 설명 */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Alert variant="info" title="카페에서 마신 커피">
              <strong>Cafe Mode</strong>: {UI_LABELS.tips.cafeMode}
            </Alert>
            
            <Alert variant="success" title="직접 내린 커피">
              <strong>HomeCafe Mode</strong>: {UI_LABELS.tips.homecafeMode}
            </Alert>
          </div>

          {/* 하단 안내 - 하이브리드 디자인 */}
          <Card variant="default" className="mt-8 md:mt-16">
            <CardContent>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-coffee-100/80 rounded-xl shadow-sm">
                    <TrendingUp className="h-6 w-6 text-coffee-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-coffee-800 mb-2">처음이신가요?</h3>
                <p className="text-coffee-600 mb-4">
                  카페 모드로 가볍게 시작해보세요. 익숙해지면 더 상세한 모드로 도전해보세요!
                </p>
                <div className="flex justify-center space-x-4 text-sm text-coffee-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>85% 사용자가 카페 모드 선택</span>
                  </div>
                  <div className="flex items-center">
                    <Coffee className="h-4 w-4 mr-1" />
                    <span>모든 모드 언제든 변경 가능</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        
        {/* 인증 모달 */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          initialMode={authMode}
        />
      </PageLayout>
    </>
    // </ProtectedRoute> {/* 임시로 비활성화 - 게스트 사용자 테스트를 위해 */}
  )
}
