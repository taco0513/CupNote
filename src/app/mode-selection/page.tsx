'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { Coffee, Home, Beaker, Clock, Users, TrendingUp } from 'lucide-react'

interface ModeCardProps {
  mode: 'cafe' | 'homecafe' | 'lab'
  icon: React.ReactNode
  title: string
  description: string
  duration: string
  badge?: string
  features: string[]
  popular?: boolean
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
}: ModeCardProps) => (
  <Link href={`/record/step1?mode=${mode}`}>
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
            mode === 'cafe'
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
              어떤 방식으로 기록하시겠어요?
            </h1>
            <p className="text-base md:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
              상황과 목적에 맞는 모드를 선택하면, 최적화된 커피 기록 경험을 제공해드려요
            </p>
          </div>

          {/* 모드 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Cafe Mode */}
            <ModeCard
              mode="cafe"
              icon={<Coffee className="h-6 w-6" />}
              title="카페 모드"
              description="카페에서 간단히 기록"
              duration="3-5분"
              badge="가장 인기"
              popular={true}
              features={[
                '빠른 기본 정보 입력',
                '간단한 맛 표현',
                '카페 분위기 기록',
                '즉석 평가 시스템',
              ]}
            />

            {/* HomeCafe Mode */}
            <ModeCard
              mode="homecafe"
              icon={<Home className="h-6 w-6" />}
              title="홈카페 모드"
              description="집에서 내린 커피 + 레시피"
              duration="5-8분"
              badge="NEW"
              features={[
                '추출 방법 및 레시피',
                '사용한 도구 기록',
                '상세한 맛 분석',
                '개선점 메모',
              ]}
            />

            {/* Lab Mode */}
            <ModeCard
              mode="lab"
              icon={<Beaker className="h-6 w-6" />}
              title="랩 모드"
              description="전문적인 분석과 평가"
              duration="8-12분"
              badge="전문가용"
              features={['SCA 표준 평가', 'TDS 및 추출 수율', '상세 감각 분석', '종합 QC 리포트']}
            />
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
                카페 모드부터 시작해보세요. 익숙해지면 다른 모드도 시도해볼 수 있어요!
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
