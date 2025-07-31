'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { SupabaseStorage } from '../../lib/supabase-storage'
import { UserStats, Achievement } from '@/types/achievement'
import { Trophy, Target, TrendingUp, Award, Star, Zap, Users, Crown } from 'lucide-react'

export default function AchievementsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const stats = await SupabaseStorage.getUserStats()
        setUserStats(stats)
      } catch (error) {
        console.error('성취 데이터 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    // 기록 추가 이벤트 리스너
    const handleRecordAdded = () => {
      loadStats()
    }

    window.addEventListener('cupnote-record-added', handleRecordAdded)
    return () => window.removeEventListener('cupnote-record-added', handleRecordAdded)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">성취를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-coffee-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-coffee-800 mb-2">아직 성취가 없어요</h1>
          <p className="text-coffee-600">첫 커피 기록을 만들어보세요!</p>
        </div>
      </div>
    )
  }

  const categories = [
    { id: 'all', name: '전체', icon: Trophy },
    { id: 'milestone', name: '마일스톤', icon: Target },
    { id: 'exploration', name: '탐험', icon: TrendingUp },
    { id: 'quality', name: '품질', icon: Star },
    { id: 'consistency', name: '일관성', icon: Zap },
    { id: 'special', name: '특별', icon: Crown },
  ]

  const filteredAchievements =
    selectedCategory === 'all'
      ? userStats.achievements
      : userStats.achievements.filter(a => a.category === selectedCategory)

  const unlockedCount = userStats.achievements.filter(a => a.unlocked).length
  const totalCount = userStats.achievements.length

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      milestone: Target,
      exploration: TrendingUp,
      quality: Star,
      consistency: Zap,
      special: Crown,
    }
    return iconMap[category] || Trophy
  }

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      milestone: 'bg-blue-100 text-blue-800 border-blue-200',
      exploration: 'bg-green-100 text-green-800 border-green-200',
      quality: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      consistency: 'bg-purple-100 text-purple-800 border-purple-200',
      special: 'bg-pink-100 text-pink-800 border-pink-200',
    }
    return colorMap[category] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
          <Navigation showBackButton currentPage="achievements" />

          {/* 헤더 */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Trophy className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-coffee-800 mb-2">성취</h1>
            <p className="text-base md:text-xl text-coffee-600 mb-4 px-4">
              커피 여정의 발자취를 확인해보세요
            </p>

            {/* 전체 진행률 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-coffee-200 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-coffee-700">달성률</span>
                <span className="text-sm font-bold text-coffee-800">
                  {unlockedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-coffee-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-coffee-600 mt-1">
                {Math.round((unlockedCount / totalCount) * 100)}% 완료
              </p>
            </div>
          </div>

          {/* 레벨 및 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* 레벨 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-coffee-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mb-3 md:mb-4">
                  <Crown className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-coffee-800 mb-1">
                  레벨 {userStats.level.level}
                </h3>
                <p className="text-coffee-600 mb-3">{userStats.level.title}</p>
                <div className="w-full bg-coffee-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userStats.level.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-coffee-600">
                  {userStats.level.currentPoints}/{userStats.level.nextLevelPoints} P
                </p>
              </div>
            </div>

            {/* 연속 기록 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-coffee-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-3 md:mb-4">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-coffee-800 mb-1">
                  {userStats.streaks.current}일 연속
                </h3>
                <p className="text-coffee-600 mb-3">현재 연속 기록</p>
                <p className="text-sm text-coffee-500">최고 기록: {userStats.streaks.longest}일</p>
              </div>
            </div>

            {/* 총 포인트 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-coffee-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-3 md:mb-4">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-coffee-800 mb-1">
                  {userStats.totalPoints} P
                </h3>
                <p className="text-coffee-600 mb-3">총 획득 포인트</p>
                <p className="text-sm text-coffee-500">기록 {userStats.totalRecords}개</p>
              </div>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {categories.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-coffee-600 text-white'
                      : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              )
            })}
          </div>

          {/* 성취 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(achievement => {
              const CategoryIcon = getCategoryIcon(achievement.category)
              const categoryColor = getCategoryColor(achievement.category)

              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-2xl shadow-lg p-4 md:p-6 border transition-all ${
                    achievement.unlocked
                      ? 'border-coffee-200 hover:shadow-xl'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        achievement.unlocked ? 'bg-coffee-100' : 'bg-gray-100'
                      }`}
                    >
                      {achievement.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-bold ${achievement.unlocked ? 'text-coffee-800' : 'text-gray-500'}`}
                        >
                          {achievement.title}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColor}`}
                        >
                          <CategoryIcon className="inline h-3 w-3 mr-1" />
                          {achievement.category}
                        </div>
                      </div>

                      <p
                        className={`text-sm mb-3 ${achievement.unlocked ? 'text-coffee-600' : 'text-gray-400'}`}
                      >
                        {achievement.description}
                      </p>

                      {achievement.progress && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-coffee-600 mb-1">
                            <span>진행률</span>
                            <span>
                              {achievement.progress.current}/{achievement.progress.target}
                            </span>
                          </div>
                          <div className="w-full bg-coffee-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                achievement.unlocked
                                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                                  : 'bg-gradient-to-r from-coffee-400 to-coffee-600'
                              }`}
                              style={{
                                width: `${Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {achievement.reward && (
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs ${achievement.unlocked ? 'text-coffee-500' : 'text-gray-400'}`}
                          >
                            {achievement.unlockedAt &&
                              `달성: ${new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}`}
                          </span>
                          <span
                            className={`text-xs font-medium ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            +{achievement.reward.points}P
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
              <p className="text-coffee-500">이 카테고리에는 성취가 없어요</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
