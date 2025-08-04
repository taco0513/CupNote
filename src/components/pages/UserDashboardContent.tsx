/**
 * 사용자 대시보드 - 로그인 사용자용
 * User Dashboard with Stats and Recent Records
 */
'use client'

import { memo, lazy, Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { Coffee, Plus, BarChart3, Trophy, Target, TrendingUp, Calendar, Award } from 'lucide-react'

import { Card, CardContent } from '../ui/Card'
import UnifiedButton from '../ui/UnifiedButton'

// Lazy load components
const CoffeeTip = lazy(() => import('../home/CoffeeTip'))

interface UserDashboardProps {
  user: any
  stats: {
    total: number
    thisMonth: number 
    avgRating: number
  }
  recentRecords: any[]
}

const UserDashboardContent = memo(function UserDashboardContent({ 
  user, 
  stats, 
  recentRecords 
}: UserDashboardProps) {
  return (
    <div className="px-4 max-w-6xl mx-auto">
      {/* Enhanced Stats Widget */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-coffee-100 to-amber-50 rounded-2xl p-6 border border-coffee-200/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-coffee-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-coffee-800">나의 커피 여정</h2>
                <p className="text-sm text-coffee-600">이번 달 활동</p>
              </div>
            </div>
            <Link href="/my-records">
              <UnifiedButton variant="outline" size="sm">
                전체 보기
              </UnifiedButton>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Coffee className="h-4 w-4 text-coffee-600" />
                <span className="text-2xl font-bold text-coffee-800">{stats.total}</span>
              </div>
              <p className="text-xs text-coffee-600">총 기록</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Calendar className="h-4 w-4 text-coffee-600" />
                <span className="text-2xl font-bold text-coffee-800">{stats.thisMonth}</span>
              </div>
              <p className="text-xs text-coffee-600">이번 달</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Trophy className="h-4 w-4 text-coffee-600" />
                <span className="text-2xl font-bold text-coffee-800">{stats.avgRating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-coffee-600">평균 평점</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Record Widget */}
      {recentRecords.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-coffee-800">최근 기록</h3>
            <Link href="/my-records" className="text-sm text-coffee-600 hover:text-coffee-800">
              더 보기 →
            </Link>
          </div>
          
          <Card className="bg-white/95 backdrop-blur-sm border-coffee-200/30">
            <CardContent className="p-4">
              {recentRecords.map((record, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-coffee-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-coffee-800 truncate">
                      {record.coffee_name || record.coffeeName || '커피 기록'}
                    </p>
                    <p className="text-xs text-coffee-600">
                      {new Date(record.date).toLocaleDateString('ko-KR', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (record.overall || 0) ? 'bg-amber-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-coffee-800 mb-3">빠른 실행</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/mode-selection">
            <Card className="bg-gradient-to-r from-coffee-600 to-coffee-700 border-coffee-600 hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardContent className="p-4 text-center text-white">
                <Plus className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">새 기록</p>
                <p className="text-xs opacity-90">커피 기록 작성</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/my-records">
            <Card className="bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500 hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardContent className="p-4 text-center text-white">
                <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">내 통계</p>
                <p className="text-xs opacity-90">기록 분석 보기</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Coffee Tip Section */}
      <div className="mb-6">
        <Suspense fallback={
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/40">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        }>
          <CoffeeTip />
        </Suspense>
      </div>

      {/* Achievement Preview */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-800">성취 달성</h3>
                  <p className="text-xs text-purple-600">커피 여정의 발자취</p>
                </div>
              </div>
              <Link href="/achievements">
                <UnifiedButton variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  보기
                </UnifiedButton>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivation Section */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200/40">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-orange-800 mb-1">꾸준한 기록이 성장의 열쇠</h3>
            <p className="text-xs text-orange-600">
              오늘도 새로운 커피 경험을 기록해보세요
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default UserDashboardContent