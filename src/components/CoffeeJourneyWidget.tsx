/**
 * @document-ref MICRO_ANIMATIONS.md#coffee-themed-animations
 * @design-ref DESIGN_SYSTEM.md#component-patterns
 * @compliance-check 2025-08-02 - 마이크로 애니메이션 적용 완료
 */
import React from 'react'

import { TrendingUp, Calendar, MapPin, Star } from 'lucide-react'

interface JourneyStats {
  totalCoffees: number
  favoriteCafe?: string
  averageRating: number
  currentStreak: number
  journeyDays: number
}

export default function CoffeeJourneyWidget({ stats }: { stats?: JourneyStats }) {
  const defaultStats: JourneyStats = {
    totalCoffees: 0,
    averageRating: 0,
    currentStreak: 0,
    journeyDays: 0
  }
  
  const data = stats || defaultStats

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl p-6 shadow-sm border border-neutral-100 hover-lift">
      <h3 className="text-lg font-bold text-neutral-800 mb-4">
        나의 커피 여정 ☕
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 총 커피 수 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 coffee-button">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-neutral-500" />
            <span className="text-2xl font-bold text-neutral-800">
              {data.totalCoffees}
            </span>
          </div>
          <p className="text-sm text-neutral-600">잔의 커피</p>
        </div>
        
        {/* 평균 평점 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 coffee-button">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-5 w-5 text-accent-warm" />
            <span className="text-2xl font-bold text-neutral-800">
              {data.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-neutral-600">평균 평점</p>
        </div>
        
        {/* 연속 기록 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-neutral-800">
              {data.currentStreak}
            </span>
          </div>
          <p className="text-sm text-neutral-600">일 연속</p>
        </div>
        
        {/* 여정 일수 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="text-2xl font-bold text-neutral-800">
              {data.journeyDays}
            </span>
          </div>
          <p className="text-sm text-neutral-600">일째 여정</p>
        </div>
      </div>
      
      {/* 동기부여 메시지 */}
      <div className="mt-4 p-3 bg-white/50 rounded-xl">
        <p className="text-sm text-neutral-700 text-center">
          {data.totalCoffees === 0 
            ? "첫 커피를 기록하고 여정을 시작하세요! 🚀"
            : data.totalCoffees < 10
            ? "좋은 시작이에요! 계속 기록해보세요 💪"
            : data.totalCoffees < 50
            ? "커피 애호가가 되어가고 있어요! ☕"
            : "진정한 커피 마스터! 🏆"
          }
        </p>
      </div>
    </div>
  )
}