'use client'

import { useState, useEffect } from 'react'

import { Trophy, Target, TrendingUp, Award, Star, Zap, Users, Crown } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import { StatsGridSkeleton, AchievementGridSkeleton } from '../../components/SkeletonLoader'
import { Card, CardContent } from '../../components/ui/Card'
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
        try {
          const stats = await SupabaseStorage.getUserStats()
          if (stats) {
            setUserStats(stats)
          } else {
            // 데이터가 없으면 데모 데이터 사용
            setUserStats(simpleDemoStats as UserStats)
          }
        } catch (error) {
          console.log('실제 데이터 로드 실패, 데모 데이터 사용:', error)
          // 에러 발생 시 데모 데이터 사용
          setUserStats(simpleDemoStats as UserStats)
        }
      } catch (error) {
        console.error('성취 데이터 로드 오류:', error)
        setUserStats(simpleDemoStats as UserStats) // 최종 fallback
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
      <ProtectedRoute>
        <Navigation showBackButton currentPage="achievements" />
        <PageLayout>
          <PageHeader 
            title="성취"
            description="커피 여정의 발자취를 확인해보세요"
            icon={<Trophy className="h-6 w-6" />}
          />
          
          {/* 전체 진행률 스켈레톤 */}
          <Card variant="default" className="max-w-md mx-auto mb-8 bg-white/80 backdrop-blur-sm border border-coffee-200/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
            </CardContent>
          </Card>
          
          {/* 통계 카드 스켈레톤 */}
          <StatsGridSkeleton count={3} />
          
          {/* 카테고리 필터 스켈레톤 */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
          
          {/* 성취 목록 스켈레톤 */}
          <AchievementGridSkeleton count={4} />
        </PageLayout>
      </ProtectedRoute>
    )
  }

  if (!userStats) {
    return (
      <ProtectedRoute>
        <Navigation showBackButton currentPage="achievements" />
        <PageLayout>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-coffee-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-coffee-300" />
            </div>
            <h1 className="text-xl font-bold text-coffee-800 mb-2">아직 성취가 없어요</h1>
            <p className="text-coffee-600">첫 커피 기록을 만들어보세요!</p>
          </div>
        </PageLayout>
      </ProtectedRoute>
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
      <Navigation showBackButton currentPage="achievements" />
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="성취"
          description="커피 여정의 발자취를 확인해보세요"
          icon={<Trophy className="h-6 w-6" />}
        />

        {/* 전체 진행률 - 하이브리드 프리미엄 카드 */}
        <Card variant="elevated" className="max-w-md mx-auto mb-8 bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-coffee-700">달성률</span>
              <span className="text-sm font-bold text-coffee-800">
                {unlockedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-coffee-200/50 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-coffee-600 text-center">
              {Math.round((unlockedCount / totalCount) * 100)}% 완료
            </p>
          </CardContent>
        </Card>

        {/* 레벨 및 통계 카드 - 하이브리드 그리드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 레벨 카드 */}
          <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="text-lg font-bold text-coffee-700 mb-1">Lv.{userStats.level.level}</div>
              <div className="text-xs text-coffee-600 mb-2">{userStats.level.title}</div>
              <div className="w-full bg-coffee-200/50 rounded-full h-1.5 mb-1">
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${userStats.level.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-coffee-500">
                {userStats.level.currentPoints}/{userStats.level.nextLevelPoints}P
              </div>
            </CardContent>
          </Card>

          {/* 연속 기록 카드 */}
          <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="text-lg font-bold text-coffee-700 mb-1">{userStats.streaks.current}일</div>
              <div className="text-xs text-coffee-600 mb-2">연속 기록</div>
              <div className="text-xs text-coffee-500">최고: {userStats.streaks.longest}일</div>
            </CardContent>
          </Card>

          {/* 총 포인트 카드 */}
          <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="text-lg font-bold text-coffee-700 mb-1">{userStats.totalPoints}P</div>
              <div className="text-xs text-coffee-600 mb-2">총 포인트</div>
              <div className="text-xs text-coffee-500">{userStats.totalRecords}개 기록</div>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리 필터 - 하이브리드 버튼 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white/70 backdrop-blur-sm text-coffee-600 hover:bg-white/90 border border-coffee-200/30 shadow-sm hover:shadow-md'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* 성취 목록 - 하이브리드 카드들 */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAchievements.map(achievement => {
            const CategoryIcon = getCategoryIcon(achievement.category)
            const categoryColor = getCategoryColor(achievement.category)

            return (
              <Card
                key={achievement.id}
                variant="default"
                className={`bg-white/80 backdrop-blur-sm border transition-all duration-200 shadow-md hover:shadow-lg ${
                  achievement.unlocked
                    ? 'border-coffee-200/50 hover:bg-white/90'
                    : 'border-gray-200/50 opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${
                        achievement.unlocked ? 'bg-coffee-100/80' : 'bg-gray-100/80'
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
                          className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${categoryColor}`}
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
                          <div className="w-full bg-coffee-200/50 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
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
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-coffee-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-coffee-300" />
            </div>
            <p className="text-coffee-500">이 카테고리에는 성취가 없어요</p>
          </div>
        )}
      </PageLayout>
    </ProtectedRoute>
  )
}