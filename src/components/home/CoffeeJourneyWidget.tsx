/**
 * Coffee Journey Widget Component
 * 사용자의 커피 여정 진행 상황을 보여줍니다
 */
'use client'

import { TrendingUp, Award, Calendar } from 'lucide-react'

import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'

interface CoffeeJourneyWidgetProps {
  stats: {
    total: number
    thisMonth: number
    avgRating: number
  }
}

export default function CoffeeJourneyWidget({ stats }: CoffeeJourneyWidgetProps) {
  // 레벨 계산 (10개당 1레벨)
  const level = Math.floor(stats.total / 10) + 1
  const progress = (stats.total % 10) * 10

  // 뱃지 결정
  const getBadge = () => {
    if (stats.total >= 100) return { name: '커피 마스터', color: 'primary' }
    if (stats.total >= 50) return { name: '커피 애호가', color: 'success' }
    if (stats.total >= 20) return { name: '커피 탐험가', color: 'info' }
    if (stats.total >= 10) return { name: '커피 입문자', color: 'warning' }
    return { name: '커피 새싹', color: 'default' }
  }

  const badge = getBadge()

  return (
    <Card variant="elevated" className="max-w-md mx-auto mb-8">
      <CardContent className="card-padding">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">나의 커피 여정</h2>
            <p className="text-sm text-neutral-600">Level {level}</p>
          </div>
          <Badge variant={badge.color as any} size="large">
            {badge.name}
          </Badge>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-neutral-600 mb-2">
            <span>다음 레벨까지</span>
            <span>{10 - (stats.total % 10)}개</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-accent-warm h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 통계 하이라이트 */}
        <div className="grid grid-cols-3 gap-mobile">
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-warm/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-accent-warm" />
            </div>
            <div className="text-xs text-neutral-600">이번 달</div>
            <div className="font-semibold text-neutral-800">{stats.thisMonth}잔</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-warm/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="h-6 w-6 text-accent-warm" />
            </div>
            <div className="text-xs text-neutral-600">평균 평점</div>
            <div className="font-semibold text-neutral-800">{stats.avgRating.toFixed(1)}점</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-warm/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-6 w-6 text-accent-warm" />
            </div>
            <div className="text-xs text-neutral-600">총 기록</div>
            <div className="font-semibold text-neutral-800">{stats.total}개</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}