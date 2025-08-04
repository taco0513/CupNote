/**
 * 성취 페이지 - 하이브리드 디자인 시스템 v2.0
 * 데스크탑 최적화 레이아웃
 */
'use client'

import { useState, useEffect } from 'react'

import { Trophy, Target, TrendingUp, Award, Star, Zap, Users, Crown, Coffee, Lock, Unlock } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import { StatsGridSkeleton, AchievementGridSkeleton } from '../../components/SkeletonLoader'
import { Card, CardContent } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import PageLayout from '../../components/ui/PageLayout'
import { simpleDemoStats } from '../../data/simple-demo'
import { SupabaseStorage } from '../../lib/supabase-storage'
import { UserStats, Achievement } from '../../types/achievement'

export default function AchievementsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        // 실제 데이터 로드 시도
        const stats = await SupabaseStorage.getUserStats()
        setUserStats(stats)
      } catch (error) {
        console.error('통계 로드 실패:', error)
        setUserStats(null)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // 로딩 스켈레톤
  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation showBackButton currentPage="achievements" />
        <PageLayout>
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-coffee-200 rounded-lg w-32 mb-2"></div>
              <div className="h-4 bg-coffee-100 rounded-lg w-64"></div>
            </div>
            <StatsGridSkeleton />
            <AchievementGridSkeleton count={6} />
          </div>
        </PageLayout>
      </ProtectedRoute>
    )
  }

  // 데이터가 없는 경우
  if (!userStats || !userStats.achievements || userStats.achievements.length === 0) {
    return (
      <ProtectedRoute>
        <Navigation showBackButton currentPage="achievements" />
        <PageLayout>
          <EmptyState
            title="아직 성취가 없어요"
            description="첫 커피 기록을 만들어보세요! 기록을 쌓아가면 다양한 성취를 얻을 수 있어요."
            variant="achievement"
            illustration="trophy"
          />
        </PageLayout>
      </ProtectedRoute>
    )
  }

  const categories = [
    { id: 'all', name: '전체', icon: Trophy, color: 'from-amber-400 to-amber-500' },
    { id: 'milestone', name: '마일스톤', icon: Target, color: 'from-blue-400 to-blue-500' },
    { id: 'exploration', name: '탐험', icon: TrendingUp, color: 'from-green-400 to-green-500' },
    { id: 'quality', name: '품질', icon: Star, color: 'from-yellow-400 to-yellow-500' },
    { id: 'consistency', name: '일관성', icon: Zap, color: 'from-purple-400 to-purple-500' },
    { id: 'special', name: '특별', icon: Crown, color: 'from-pink-400 to-pink-500' },
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
      milestone: 'from-blue-400 to-blue-500',
      exploration: 'from-green-400 to-green-500',
      quality: 'from-yellow-400 to-yellow-500',
      consistency: 'from-purple-400 to-purple-500',
      special: 'from-pink-400 to-pink-500',
    }
    return colorMap[category] || 'from-gray-400 to-gray-500'
  }

  const getCategoryBadgeColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      milestone: 'bg-blue-100/80 text-blue-800 border-blue-200/50',
      exploration: 'bg-green-100/80 text-green-800 border-green-200/50',
      quality: 'bg-yellow-100/80 text-yellow-800 border-yellow-200/50',
      consistency: 'bg-purple-100/80 text-purple-800 border-purple-200/50',
      special: 'bg-pink-100/80 text-pink-800 border-pink-200/50',
    }
    return colorMap[category] || 'bg-gray-100/80 text-gray-800 border-gray-200/50'
  }

  return (
    <ProtectedRoute>
      <Navigation showBackButton currentPage="achievements" />
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="성취"
          description="커피 여정의 발자취를 확인해보세요"
          icon={<Trophy className="h-6 w-6" />}
        />

        {/* 데스크탑 최적화 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 왼쪽: 전체 진행률과 통계 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 전체 진행률 - 데스크탑에서 더 크게 */}
            <Card variant="elevated" className="bg-gradient-to-br from-coffee-50/90 to-amber-50/90 backdrop-blur-sm border border-coffee-200/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-coffee-800">총 달성률</h3>
                      <p className="text-sm text-coffee-600">전체 성취 진행도</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-coffee-800">
                      {unlockedCount}/{totalCount}
                    </span>
                    <span className="text-lg font-bold text-amber-600">
                      {Math.round((unlockedCount / totalCount) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-coffee-200/50 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-4 rounded-full transition-all duration-500 shadow-md relative overflow-hidden"
                      style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                        <Unlock className="h-4 w-4" />
                        <span className="text-lg font-bold">{unlockedCount}</span>
                      </div>
                      <span className="text-xs text-coffee-600">달성</span>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                        <Lock className="h-4 w-4" />
                        <span className="text-lg font-bold">{totalCount - unlockedCount}</span>
                      </div>
                      <span className="text-xs text-coffee-600">미달성</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 레벨 카드 - 더 큰 디자인 */}
            <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold text-coffee-800">Lv.{userStats.level.level}</div>
                        <div className="text-sm text-coffee-600">{userStats.level.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-coffee-500">다음 레벨까지</div>
                        <div className="text-sm font-bold text-coffee-700">
                          {userStats.level.nextLevelPoints - userStats.level.currentPoints}P
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-coffee-200/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${userStats.level.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 통계 카드들 - 2x2 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-coffee-700">{userStats.streaks.current}일</div>
                  <div className="text-xs text-coffee-600">연속 기록</div>
                </CardContent>
              </Card>

              <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-coffee-700">{userStats.totalPoints}P</div>
                  <div className="text-xs text-coffee-600">총 포인트</div>
                </CardContent>
              </Card>

              <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                    <Coffee className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-coffee-700">{userStats.totalRecords}</div>
                  <div className="text-xs text-coffee-600">총 기록</div>
                </CardContent>
              </Card>

              <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-coffee-700">{userStats.streaks.longest}일</div>
                  <div className="text-xs text-coffee-600">최고 기록</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 오른쪽: 성취 목록 */}
          <div className="lg:col-span-2">
            {/* 카테고리 필터 - 통합 디자인 토큰 시스템 적용 */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map(category => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`btn-base filter-btn ${isActive ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                  >
                    <Icon className="icon" />
                    <span className={isActive ? 'text-on-dark' : 'text-high-contrast'}>{category.name}</span>
                    {category.id !== 'all' && (
                      <span className="filter-count">
                        ({userStats.achievements.filter(a => a.category === category.id && a.unlocked).length}/
                        {userStats.achievements.filter(a => a.category === category.id).length})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 성취 목록 - 2열 그리드 (데스크탑) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAchievements.map(achievement => {
                const CategoryIcon = getCategoryIcon(achievement.category)
                const categoryColor = getCategoryColor(achievement.category)
                const categoryBadgeColor = getCategoryBadgeColor(achievement.category)

                return (
                  <Card
                    key={achievement.id}
                    variant="default"
                    className={`relative overflow-hidden transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-white/90 backdrop-blur-sm border-coffee-200/50 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:bg-white'
                        : 'bg-gray-50/80 backdrop-blur-sm border-gray-200/50 opacity-75 hover:opacity-85'
                    }`}
                  >
                    {/* 달성 시 반짝이는 효과 */}
                    {achievement.unlocked && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-300/20 to-transparent rounded-full blur-2xl"></div>
                    )}
                    
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-3">
                        {/* 아이콘 - 그라데이션 배경 */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md ${
                          achievement.unlocked 
                            ? `bg-gradient-to-br ${categoryColor}` 
                            : 'bg-gray-200'
                        }`}>
                          <div className={achievement.unlocked ? 'text-white' : 'text-gray-400'}>
                            {achievement.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-bold text-base ${
                              achievement.unlocked ? 'text-coffee-800' : 'text-gray-500'
                            }`}>
                              {achievement.title}
                            </h3>
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-medium border backdrop-blur-sm ${categoryBadgeColor}`}>
                              <CategoryIcon className="inline h-3 w-3 mr-0.5" />
                              {achievement.category}
                            </div>
                          </div>

                          <p className={`text-sm mb-3 line-clamp-2 ${
                            achievement.unlocked ? 'text-coffee-600' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>

                          {achievement.progress && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className={achievement.unlocked ? 'text-coffee-600' : 'text-gray-400'}>
                                  진행률
                                </span>
                                <span className={`font-medium ${
                                  achievement.unlocked ? 'text-coffee-700' : 'text-gray-500'
                                }`}>
                                  {achievement.progress.current}/{achievement.progress.target}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 relative ${
                                    achievement.unlocked
                                      ? `bg-gradient-to-r ${categoryColor}`
                                      : 'bg-gray-400'
                                  }`}
                                  style={{
                                    width: `${Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)}%`,
                                  }}
                                >
                                  {achievement.unlocked && (
                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {achievement.reward && (
                            <div className="flex items-center justify-between text-xs">
                              <span className={achievement.unlocked ? 'text-coffee-500' : 'text-gray-400'}>
                                {achievement.unlockedAt &&
                                  `${new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}`}
                              </span>
                              <span className={`font-bold ${
                                achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                +{achievement.reward.points}P
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <EmptyState
                title="이 카테고리에는 성취가 없어요"
                description="다른 카테고리를 확인해보세요"
                variant="achievement"
                illustration="trophy"
              />
            )}
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}