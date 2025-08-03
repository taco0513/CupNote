/**
 * 모드 선택 페이지 - 하이브리드 디자인 시스템
 * 3가지 기록 모드 중 하나를 선택하는 페이지
 */
'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Coffee, Home, Beaker, Clock, Users, TrendingUp, Zap, ArrowRight } from 'lucide-react'

import AuthModal from '../../components/auth/AuthModal'
import GuestModeIndicator from '../../components/GuestModeIndicator'
import Navigation from '../../components/Navigation'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import PageLayout from '../../components/ui/PageLayout'
import { TASTING_MODES_CONFIG, UI_LABELS } from '../../config'
import { useAuth } from '../../contexts/AuthContext'

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
        className={`h-full group transition-all duration-300 ${
          popular 
            ? 'bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg hover:shadow-xl' 
            : 'bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg'
        } hover:scale-105 relative overflow-hidden`}
      >
        {/* 글로우 효과 */}
        {popular && (
          <div className="absolute inset-0 bg-gradient-to-r from-coffee-400/10 to-coffee-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* 배지 */}
        {badge && (
          <div className="absolute -top-3 -right-3 z-10">
            <Badge 
              variant={badgeVariant} 
              size="medium"
              className="shadow-md"
            >
              {badge}
            </Badge>
          </div>
        )}

        <CardContent className="p-6 relative z-10">
          {/* 아이콘 및 제목 */}
          <div className="flex items-center mb-6">
            <div className={`p-4 rounded-xl mr-4 shadow-sm transition-all duration-300 ${
              popular 
                ? 'bg-gradient-to-r from-coffee-400 to-coffee-500 text-white'
                : 'bg-coffee-500/10 text-coffee-500 group-hover:bg-coffee-500/20'
            }`}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-coffee-800 mb-1">{title}</h3>
              <p className="text-coffee-600 text-sm">{description}</p>
            </div>
          </div>

          {/* 소요 시간 */}
          <div className="flex items-center mb-4 text-coffee-500">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{duration}</span>
          </div>

          {/* 주요 기능 */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-coffee-700">
                <div className="w-1.5 h-1.5 rounded-full mr-3 bg-coffee-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* 시작하기 버튼 효과 */}
          <div className="mt-4 pt-4 border-t border-coffee-100/50">
            <div className="flex items-center justify-between text-sm font-medium text-coffee-500 group-hover:text-coffee-600 transition-colors duration-200">
              <span>시작하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
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
    <>
      <Navigation showBackButton currentPage="record" />
      <PageLayout>
        
        {/* 게스트 모드 표시 */}
        {!user && (
          <GuestModeIndicator 
            variant="banner" 
            onLoginClick={() => openAuthModal('login')}
            className="mb-8"
          />
        )}

        {/* 페이지 헤더 - 하이브리드 디자인 */}
        <PageHeader
          title={UI_LABELS.record.selectMode}
          description={UI_LABELS.tips.selectMode}
          icon={<Coffee className="h-6 w-6" />}
        />

        {/* 모드 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
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
        </div>

        {/* 모드 카테고리 설명 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Alert 
            variant="info" 
            title="카페에서 마신 커피"
            className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50"
          >
            <strong>Cafe Mode</strong>: {UI_LABELS.tips.cafeMode}
          </Alert>
          
          <Alert 
            variant="success" 
            title="직접 내린 커피"
            className="bg-green-50/80 backdrop-blur-sm border border-green-200/50"
          >
            <strong>HomeCafe Mode</strong>: {UI_LABELS.tips.homecafeMode}
          </Alert>
        </div>

        {/* 하단 안내 - 하이브리드 디자인 */}
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-coffee-800 mb-3">처음이신가요?</h3>
              <p className="text-coffee-600 mb-6 max-w-lg mx-auto leading-relaxed">
                카페 모드로 가볍게 시작해보세요. 익숙해지면 더 상세한 모드로 도전해보세요!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-coffee-500">
                <div className="flex items-center justify-center md:justify-end">
                  <Users className="h-4 w-4 mr-2" />
                  <span>85% 사용자가 카페 모드 선택</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Coffee className="h-4 w-4 mr-2" />
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
  )
}