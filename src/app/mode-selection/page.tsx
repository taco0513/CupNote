'use client'

import Link from 'next/link'

import { Coffee, Home, Beaker, Clock, Users, TrendingUp, Zap } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import { TASTING_MODES_CONFIG, getModeColor, getModeGradient, UI_LABELS } from '../../config'

interface ModeCardProps {
  mode: 'quick' | 'cafe' | 'homecafe' | 'pro'
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
}: ModeCardProps) => (
  <Link href={TASTING_MODES_CONFIG[mode].route}>
    <div
      className={`
      relative p-4 md:p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer group
      hover:shadow-xl md:hover:scale-105 md:hover:-translate-y-1
      ${popular ? 'border-coffee-400 shadow-lg' : 'border-coffee-200 hover:border-coffee-300'}
    `}
    >
      {/* 배지 */}
      {badge && (
        <div
          className={`
          absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-semibold
          ${popular ? 'bg-coffee-500 text-white' : 'bg-blue-100 text-blue-800'}
        `}
        >
          {badge}
        </div>
      )}

      {/* 아이콘 및 제목 */}
      <div className="flex items-center mb-4">
        <div
          className={`
          p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform
          ${
            mode === 'quick'
              ? 'bg-orange-100 text-orange-600'
              : mode === 'cafe'
                ? 'bg-blue-100 text-blue-600'
                : mode === 'homecafe'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-purple-100 text-purple-600'
          }
        `}
        >
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
    </div>
  </Link>
)

export default function ModeSelectionPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
          <Navigation showBackButton currentPage="record" />

          {/* 헤더 */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-coffee-800 mb-3 md:mb-4">
              {UI_LABELS.record.selectMode}
            </h1>
            <p className="text-base md:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
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

            {/* Pro Mode */}
            <ModeCard
              mode="pro"
              icon={<Beaker className="h-6 w-6" />}
              title={TASTING_MODES_CONFIG.pro.labelKr}
              description={TASTING_MODES_CONFIG.pro.description}
              duration={TASTING_MODES_CONFIG.pro.estimatedTime}
              badge="전문가용"
              category="직접추출"
              features={[
                'SCA 표준 기반 품질 평가',
                'TDS 측정 및 추출 수율 분석',
                'SCA Flavor Wheel 표준 향미',
                '전문 QC 리포트 및 등급 판정',
              ]}
            />
          </div>

          {/* 모드 카테고리 설명 */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                <Coffee className="h-5 w-5 mr-2" />
                카페에서 마신 커피
              </h4>
              <p className="text-blue-700 text-sm">
                <strong>Quick Mode</strong>: {UI_LABELS.tips.quickMode}<br />
                <strong>Cafe Mode</strong>: {UI_LABELS.tips.cafeMode}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-green-800 mb-2 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                직접 내린 커피
              </h4>
              <p className="text-green-700 text-sm">
                <strong>HomeCafe Mode</strong>: {UI_LABELS.tips.homecafeMode}<br />
                <strong>Pro Mode</strong>: {UI_LABELS.tips.proMode}
              </p>
            </div>
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
                Quick 모드로 가볍게 시작해보세요. 익숙해지면 더 상세한 모드로 도전해보세요!
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
