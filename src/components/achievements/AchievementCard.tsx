'use client'

import { Achievement } from '../../types/achievement'
import { ACHIEVEMENT_POINTS, ACHIEVEMENT_COLORS } from '../../types/achievements.types'

interface AchievementCardProps {
  achievement: Achievement
  showProgress?: boolean
}

export default function AchievementCard({ achievement, showProgress = true }: AchievementCardProps) {
  const isUnlocked = achievement.unlocked
  const progress = achievement.progress?.current || 0
  const target = achievement.progress?.target || achievement.condition.target
  const progressPercentage = Math.min(100, (progress / target) * 100)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-400 to-amber-600'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'platinum': return 'from-purple-400 to-purple-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'bg-coffee-100 text-coffee-800'
      case 'quality': return 'bg-blue-100 text-blue-800'
      case 'exploration': return 'bg-green-100 text-green-800'
      case 'consistency': return 'bg-orange-100 text-orange-800'
      case 'special': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {/* 잠금 해제 오버레이 */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm">✓</span>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`text-4xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {achievement.icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-green-800' : 'text-gray-700'}`}>
              {achievement.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
              {achievement.category === 'milestone' && '마일스톤'}
              {achievement.category === 'exploration' && '탐험'}
              {achievement.category === 'quality' && '품질'}
              {achievement.category === 'consistency' && '꾸준함'}
              {achievement.category === 'special' && '특별'}
            </span>
          </div>
        </div>

        {/* 포인트 */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getTierColor('gold')} text-white`}>
          {achievement.reward?.points || 0}pt
        </div>
      </div>

      {/* 설명 */}
      <p className={`text-sm mb-4 ${isUnlocked ? 'text-green-700' : 'text-gray-600'}`}>
        {achievement.description}
      </p>

      {/* 진행도 */}
      {showProgress && !isUnlocked && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">진행도</span>
            <span className="font-medium text-gray-800">
              {progress} / {target}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {Math.round(progressPercentage)}% 완료
          </div>
        </div>
      )}

      {/* 잠금 해제 날짜 */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <p className="text-xs text-green-600">
            {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')} 달성
          </p>
        </div>
      )}

      {/* 요구사항 */}
      {!isUnlocked && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {achievement.condition.type === 'count' && `${achievement.condition.target}회 달성`}
            {achievement.condition.type === 'rating' && `평점 ${achievement.condition.target}점 이상`}
            {achievement.condition.type === 'variety' && `${achievement.condition.target}가지 종류`}
            {achievement.condition.type === 'streak' && `${achievement.condition.target}일 연속`}
            {achievement.condition.type === 'special' && '특별 조건 달성'}
          </p>
        </div>
      )}
    </div>
  )
}