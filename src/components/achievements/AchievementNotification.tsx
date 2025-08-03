'use client'

import { useState, useEffect } from 'react'

import { X, Trophy, Star, Gift } from 'lucide-react'

import { Achievement } from '../../types/achievement'

interface AchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
}

export default function AchievementNotification({
  achievement,
  onClose
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      // 5초 후 자동으로 닫기
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300) // 애니메이션 완료 후 제거
  }

  if (!achievement) return null

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-400 to-amber-600'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'platinum': return 'from-purple-400 to-purple-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div 
        className={`relative max-w-md w-full mx-auto transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 배경 이펙트 */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-green-400/20 rounded-3xl blur-xl animate-pulse" />
        
        {/* 메인 카드 */}
        <div className="relative bg-white rounded-3xl shadow-2xl border-4 border-yellow-300 overflow-hidden">
          {/* 헤더 배경 */}
          <div className={`h-32 bg-gradient-to-r ${getTierColor('gold')} relative overflow-hidden`}>
            {/* 장식 요소 */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full" />
            <div className="absolute -bottom-2 -left-4 w-12 h-12 bg-white/20 rounded-full" />
            
            {/* 트로피 아이콘 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="p-6 text-center">
            {/* 제목 */}
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-green-600 mb-1">
                성취 달성!
              </h2>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl">{achievement.icon}</span>
                <h3 className="text-xl font-bold text-gray-800">
                  {achievement.title}
                </h3>
              </div>
            </div>

            {/* 설명 */}
            <p className="text-gray-600 mb-4">
              {achievement.description}
            </p>

            {/* 포인트 */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-full">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">
                  +{achievement.reward?.points || 0} 포인트
                </span>
              </div>
              
              {/* Title reward - currently not supported in achievement.ts type
              {achievement.reward?.type === 'title' && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-full">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-purple-800">
                    새 타이틀 획득
                  </span>
                </div>
              )} */}
            </div>

            {/* 액션 버튼 */}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
            >
              확인
            </button>
          </div>
        </div>

        {/* 하단 장식 */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  )
}