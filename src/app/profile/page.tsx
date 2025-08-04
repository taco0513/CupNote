/**
 * 프로필 페이지 - 하이브리드 디자인 시스템
 * 개인정보와 커피 여정 중심의 독립적인 프로필 관리
 */
'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { User, Award, Coffee, Settings, TrendingUp, Calendar, MapPin, Star, Trophy, Target } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import { Card, CardContent } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import PageLayout from '../../components/ui/PageLayout'
import { useAuth } from '../../contexts/AuthContext'
import { SupabaseStorage } from '../../lib/supabase-storage'

interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  level: number
  title: string
  total_points: number
  total_records: number
  current_streak: number
  longest_streak: number
  join_date: string
}

interface CoffeeJourneySummary {
  monthly_records: number
  avg_rating: number
  favorite_roaster: string
  favorite_origin: string
  favorite_cafe: string
  recent_achievements: Array<{
    id: string
    title: string
    icon: string
    unlocked_at: string
  }>
}

interface HomeCafeEquipment {
  grinder: string
  dripper: string
  scale: string
  kettle: string
  other_equipment: string[]
}

// 가장 자주 나타나는 값 찾기 헬퍼 함수
const getMostFrequent = (arr: string[]): string => {
  if (arr.length === 0) return ''
  const frequency: { [key: string]: number } = {}
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1
  })
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, '')
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [journeySummary, setJourneySummary] = useState<CoffeeJourneySummary | null>(null)
  const [equipment, setEquipment] = useState<HomeCafeEquipment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      // 실제 사용자 데이터 로드
      const [userStats, userRecords] = await Promise.all([
        SupabaseStorage.getUserStats(),
        SupabaseStorage.getRecords()
      ])

      // 기록 데이터에서 통계 계산
      const recordsData = userRecords.length > 0 ? {
        thisMonth: userRecords.filter(r => {
          const recordDate = new Date(r.date)
          const now = new Date()
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
        }).length,
        avgRating: userRecords.reduce((sum, r) => sum + (r.overall || 0), 0) / userRecords.length,
        favoriteRoaster: getMostFrequent(userRecords.map(r => r.roastery).filter(Boolean)),
        favoriteOrigin: getMostFrequent(userRecords.map(r => r.origin).filter(Boolean)),
        favoriteCafe: getMostFrequent(userRecords.map(r => r.location).filter(Boolean))
      } : null

      if (userStats && userRecords.length > 0) {
        // 실제 데이터가 있을 때
        const actualProfile: UserProfile = {
          id: user?.id || '',
          username: user?.username || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          avatar_url: user?.avatar_url,
          level: userStats.level?.level || 1,
          title: userStats.level?.title || '커피 입문자',
          total_points: userStats.totalPoints || 0,
          total_records: userStats.totalRecords || 0,
          current_streak: userStats.streaks?.current || 0,
          longest_streak: userStats.streaks?.longest || 0,
          join_date: user?.created_at || new Date().toISOString()
        }

        const actualJourney: CoffeeJourneySummary = {
          monthly_records: recordsData.thisMonth || 0,
          avg_rating: recordsData.avgRating || 0,
          favorite_roaster: recordsData.favoriteRoaster || '',
          favorite_origin: recordsData.favoriteOrigin || '',
          favorite_cafe: recordsData.favoriteCafe || '',
          recent_achievements: userStats.achievements?.filter(a => a.unlocked)
            .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
            .slice(0, 3)
            .map(a => ({
              id: a.id,
              title: a.title,
              icon: a.icon,
              unlocked_at: a.unlockedAt
            })) || []
        }

        setProfile(actualProfile)
        setJourneySummary(actualJourney)
        setEquipment(null) // 장비 데이터는 별도 구현 필요
      } else {
        // 데이터가 없을 때는 기본값으로 설정
        const emptyProfile: UserProfile = {
          id: user?.id || '',
          username: user?.username || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          avatar_url: user?.avatar_url,
          level: 1,
          title: '커피 입문자',
          total_points: 0,
          total_records: 0,
          current_streak: 0,
          longest_streak: 0,
          join_date: user?.created_at || new Date().toISOString()
        }

        const emptyJourney: CoffeeJourneySummary = {
          monthly_records: 0,
          avg_rating: 0,
          favorite_roaster: '',
          favorite_origin: '',
          favorite_cafe: '',
          recent_achievements: []
        }

        setProfile(emptyProfile)
        setJourneySummary(emptyJourney)
        setEquipment(null)
      }
    } catch (error) {
      console.error('프로필 데이터 로드 오류:', error)
      // 에러 시에도 빈 프로필 표시
      const errorProfile: UserProfile = {
        id: user?.id || '',
        username: user?.username || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        avatar_url: user?.avatar_url,
        level: 1,
        title: '커피 입문자',
        total_points: 0,
        total_records: 0,
        current_streak: 0,
        longest_streak: 0,
        join_date: user?.created_at || new Date().toISOString()
      }

      const errorJourney: CoffeeJourneySummary = {
        monthly_records: 0,
        avg_rating: 0,
        favorite_roaster: '',
        favorite_origin: '',
        favorite_cafe: '',
        recent_achievements: []
      }

      setProfile(errorProfile)
      setJourneySummary(errorJourney)
      setEquipment(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation showBackButton currentPage="settings" />
        <PageLayout>
          <PageHeader 
            title="내 프로필"
            description="커피 여정과 개인 정보를 관리하세요"
            icon={<User className="h-6 w-6" />}
          />
          
          <div className="space-y-6">
            {/* 프로필 헤더 스켈레톤 */}
            <Card variant="elevated" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-coffee-200/50 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-coffee-200/50 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-coffee-200/50 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-coffee-200/50 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 통계 카드 스켈레톤 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} variant="default" className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-coffee-200/50 rounded-xl mx-auto mb-3 animate-pulse"></div>
                    <div className="h-5 bg-coffee-200/50 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 bg-coffee-200/50 rounded w-16 mx-auto animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageLayout>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <Navigation showBackButton currentPage="settings" />
        <PageLayout>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-coffee-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-coffee-300" />
            </div>
            <h1 className="text-xl font-bold text-coffee-800 mb-2">프로필을 불러올 수 없어요</h1>
            <p className="text-coffee-600">잠시 후 다시 시도해주세요.</p>
          </div>
        </PageLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Navigation showBackButton currentPage="settings" />
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="내 프로필"
          description="커피 여정과 개인 정보를 관리하세요"
          icon={<User className="h-6 w-6" />}
        />

        <div className="space-y-8">
          {/* 프로필 정보 - 하이브리드 프리미엄 카드 */}
          <Card variant="elevated" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-lg">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-coffee-800 mb-1">{profile.username}</h2>
                    <p className="text-coffee-600 mb-2">{profile.email}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full font-medium">
                        ⭐ Level {profile.level} {profile.title}
                      </span>
                      <span className="text-coffee-500">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        가입: {new Date(profile.join_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 프로필 편집 버튼 - 데스크탑에서만 표시 */}
                <div className="hidden md:block">
                  <button className="btn-base btn-secondary btn-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>편집</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 커피 여정 통계 - 대시보드 스타일 4개 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 총 포인트 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-coffee-700 mb-1">
                  {profile.total_points > 0 ? `${profile.total_points}P` : '-'}
                </div>
                <div className="text-sm text-coffee-600">총 포인트</div>
              </CardContent>
            </Card>

            {/* 총 기록 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Coffee className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-coffee-700 mb-1">
                  {profile.total_records > 0 ? `${profile.total_records}개` : '-'}
                </div>
                <div className="text-sm text-coffee-600">총 기록</div>
              </CardContent>
            </Card>

            {/* 현재 연속 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-coffee-700 mb-1">
                  {profile.current_streak > 0 ? `${profile.current_streak}일` : '-'}
                </div>
                <div className="text-sm text-coffee-600">연속 기록</div>
              </CardContent>
            </Card>

            {/* 평균 평점 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-coffee-700 mb-1">
                  {journeySummary?.avg_rating && journeySummary.avg_rating > 0 ? journeySummary.avg_rating.toFixed(1) : '-'}
                </div>
                <div className="text-sm text-coffee-600">평균 평점</div>
              </CardContent>
            </Card>
          </div>

          {/* 대시보드 2컬럼 레이아웃 */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 좌측 컬럼: 커피 여정 요약 */}
            <div className="space-y-6 md:space-y-8">
              <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    이번 달 커피 여정
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-coffee-700 mb-3">활동 요약</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-coffee-600">이번 달 기록</span>
                          <span className="font-medium text-coffee-800">{journeySummary?.monthly_records}개</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-coffee-600">평균 평점</span>
                          <span className="font-medium text-coffee-800 flex items-center">
                            {journeySummary?.avg_rating.toFixed(1)}
                            <Star className="h-3 w-3 text-amber-400 fill-current ml-1" />
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-coffee-600">최고 연속 기록</span>
                          <span className="font-medium text-coffee-800">{profile.longest_streak}일</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-coffee-100 pt-4">
                      <h4 className="font-medium text-coffee-700 mb-3">즐겨찾는 항목</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-coffee-600">로스터리</span>
                          <span className="font-medium text-coffee-800">{journeySummary?.favorite_roaster}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-coffee-600">원산지</span>
                          <span className="font-medium text-coffee-800">{journeySummary?.favorite_origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-coffee-600">카페</span>
                          <span className="font-medium text-coffee-800">{journeySummary?.favorite_cafe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 홈카페 장비 */}
              {equipment && (
                <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-coffee-800 flex items-center">
                        <Coffee className="h-5 w-5 mr-2" />
                        홈카페 장비
                      </h3>
                      <button className="text-sm text-coffee-500 hover:text-coffee-700 transition-colors font-medium">
                        편집 →
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-coffee-700">그라인더</label>
                          <p className="text-coffee-600 text-sm">{equipment.grinder}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-coffee-700">드리퍼</label>
                          <p className="text-coffee-600 text-sm">{equipment.dripper}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-coffee-700">저울</label>
                          <p className="text-coffee-600 text-sm">{equipment.scale}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-coffee-700">케틀</label>
                          <p className="text-coffee-600 text-sm">{equipment.kettle}</p>
                        </div>
                      </div>
                    </div>
                    
                    {equipment.other_equipment.length > 0 && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-coffee-700">기타 장비</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {equipment.other_equipment.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-coffee-100/50 text-coffee-700 rounded-full text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 우측 컬럼: 최근 성취 & 빠른 링크 */}
            <div className="space-y-6 md:space-y-8">
              {/* 최근 성취 */}
              {journeySummary?.recent_achievements && journeySummary.recent_achievements.length > 0 && (
                <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-coffee-800 flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        최근 성취
                      </h3>
                      <Link 
                        href="/achievements"
                        className="text-sm text-coffee-500 hover:text-coffee-700 transition-colors"
                      >
                        전체 보기 →
                      </Link>
                    </div>
                    
                    <div className="space-y-3">
                      {journeySummary.recent_achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-coffee-50/50 rounded-lg hover:bg-coffee-100/50 transition-colors">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium text-coffee-800 text-sm">{achievement.title}</p>
                            <p className="text-xs text-coffee-500">
                              {new Date(achievement.unlocked_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 빠른 링크 */}
              <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-coffee-800 mb-4">빠른 링크</h3>
                  
                  <div className="space-y-3">
                    <Link 
                      href="/achievements"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-coffee-50/50 hover:bg-coffee-100/50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-coffee-700 font-medium">전체 성취</span>
                        <p className="text-xs text-coffee-500">배지와 도전 과제 확인</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/my-records"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-coffee-50/50 hover:bg-coffee-100/50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-coffee-700 font-medium">상세 통계</span>
                        <p className="text-xs text-coffee-500">분석과 인사이트 보기</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/settings"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-coffee-50/50 hover:bg-coffee-100/50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-coffee-700 font-medium">앱 설정</span>
                        <p className="text-xs text-coffee-500">환경설정과 계정관리</p>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* 여유 공간 - 향후 확장용 */}
              <div className="hidden lg:block">
                <Card variant="default" className="bg-gradient-to-br from-coffee-50/30 to-coffee-100/30 backdrop-blur-sm border border-coffee-200/20 shadow-sm">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="w-12 h-12 bg-coffee-200/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Coffee className="h-6 w-6 text-coffee-400" />
                    </div>
                    <p className="text-sm text-coffee-500 mb-2">새로운 기능이 곧 추가될 예정입니다</p>
                    <p className="text-xs text-coffee-400">커뮤니티 기능과 더 많은 통계를 만나보세요</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}