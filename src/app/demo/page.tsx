/**
 * 데모 페이지 - 로그인 없이 CupNote 기능 체험
 * 샘플 데이터로 앱의 핵심 기능을 보여줍니다
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Coffee, TrendingUp, Award, User, ArrowRight, Sparkles } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card'  
import PageHeader from '../../components/ui/PageHeader'
import PageLayout from '../../components/ui/PageLayout'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { simpleDemoStats } from '../../data/simple-demo'

// 데모용 커피 기록 샘플
const demoRecords = [
  {
    id: '1',
    coffeeName: '에티오피아 예가체프',
    cafeName: '블루보틀 성수점',
    roasterName: '블루보틀',
    rating: 4.5,
    flavors: ['플로럴', '시트러스', '밝은산미'],
    date: '2025-08-03',
    mode: 'cafe'
  },
  {
    id: '2', 
    coffeeName: '콜롬비아 수프레모',
    roasterName: '안트러사이트',
    rating: 4.2,
    flavors: ['초콜릿', '견과류', '균형감'],
    date: '2025-08-02',
    mode: 'homecafe'
  },
  {
    id: '3',
    coffeeName: '과테말라 안티구아',
    cafeName: '스타벅스 리저브',
    roasterName: '스타벅스',
    rating: 4.0,
    flavors: ['스모키', '카라멜', '풀바디'],
    date: '2025-08-01',
    mode: 'cafe'
  }
]

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'stats' | 'achievements'>('records')

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      {/* 데모 표시 배너 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">✨ 데모 모드 - CupNote 기능을 체험해보세요!</span>
        </div>
      </div>

      <PageLayout>
        <PageHeader 
          title="CupNote 데모" 
          subtitle="커피 기록과 분석의 모든 기능을 체험해보세요"
          showBackButton={false}
        />

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-coffee-100/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'records'
                ? 'bg-white text-coffee-800 shadow-sm'
                : 'text-coffee-600 hover:text-coffee-800'
            }`}
          >
            <Coffee className="inline h-4 w-4 mr-2" />
            내 기록
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-white text-coffee-800 shadow-sm'
                : 'text-coffee-600 hover:text-coffee-800'
            }`}
          >
            <TrendingUp className="inline h-4 w-4 mr-2" />
            통계
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'achievements'
                ? 'bg-white text-coffee-800 shadow-sm'
                : 'text-coffee-600 hover:text-coffee-800'
            }`}
          >
            <Award className="inline h-4 w-4 mr-2" />
            성취
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'records' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-2xl font-bold text-coffee-800">{simpleDemoStats.totalRecords}</div>
                  <div className="text-sm text-coffee-600">총 기록</div>
                </CardContent>
              </Card>
              <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-2xl font-bold text-coffee-800">{simpleDemoStats.averageRating}</div>
                  <div className="text-sm text-coffee-600">평균 평점</div>
                </CardContent>
              </Card>
              <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-2xl font-bold text-coffee-800">{simpleDemoStats.streaks.current}</div>
                  <div className="text-sm text-coffee-600">연속 기록</div>
                </CardContent>
              </Card>
              <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-2xl font-bold text-coffee-800">{simpleDemoStats.exploredOrigins.length}</div>
                  <div className="text-sm text-coffee-600">탐험한 원산지</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-coffee-800">최근 커피 기록</h3>
              {demoRecords.map((record) => (
                <Card key={record.id} variant="elevated" className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-coffee-800">{record.coffeeName}</h4>
                        <p className="text-sm text-coffee-600">
                          {record.roasterName}
                          {record.cafeName && ` • ${record.cafeName}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.mode === 'cafe' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.mode === 'cafe' ? '☕ 카페' : '🏠 홈카페'}
                        </div>
                        <div className="text-sm font-medium text-amber-600">★ {record.rating}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.flavors.map((flavor, i) => (
                        <span key={i} className="px-2 py-1 bg-coffee-100 text-coffee-700 rounded-full text-xs">
                          {flavor}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-coffee-500 mt-2">{record.date}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6 md:space-y-8">
            <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-bold text-coffee-800 mb-4">레벨 정보</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{simpleDemoStats.level.level}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-coffee-800">{simpleDemoStats.level.title}</h4>
                    <p className="text-sm text-coffee-600">{simpleDemoStats.totalPoints} 포인트</p>
                  </div>
                </div>
                <div className="w-full bg-coffee-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-coffee-400 to-coffee-500 h-2 rounded-full"
                    style={{ width: `${simpleDemoStats.level.progress}%` }}
                  />
                </div>
                <p className="text-xs text-coffee-600 mt-2">
                  다음 레벨까지 {simpleDemoStats.level.nextLevelPoints - simpleDemoStats.level.currentPoints} 포인트
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-bold text-coffee-800 mb-4">취향 분석</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-coffee-600">선호 원산지:</span>
                    <span className="ml-2 font-medium text-coffee-800">{simpleDemoStats.favorites.origin}</span>
                  </div>
                  <div>
                    <span className="text-sm text-coffee-600">선호 로스터리:</span>
                    <span className="ml-2 font-medium text-coffee-800">{simpleDemoStats.favorites.roastery}</span>
                  </div>
                  <div>
                    <span className="text-sm text-coffee-600">선호 추출법:</span>
                    <span className="ml-2 font-medium text-coffee-800">{simpleDemoStats.favorites.brewMethod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid gap-4">
              {simpleDemoStats.achievements.filter(a => a.unlocked).map((achievement) => (
                <Card key={achievement.id} variant="elevated" className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-coffee-800">{achievement.title}</h4>
                        <p className="text-sm text-coffee-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            달성 완료
                          </span>
                          <span className="text-xs text-coffee-500">
                            +{achievement.reward.points} 포인트
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA 섹션 */}
        <div className="mt-12 text-center">
          <Card variant="elevated" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200/50">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-coffee-800 mb-2">CupNote와 함께 시작해보세요!</h3>
              <p className="text-coffee-600 mb-6">
                나만의 커피 여정을 기록하고 분석해보세요. 
                무료로 시작할 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <UnifiedButton size="lg" className="w-full sm:w-auto min-w-[200px]">
                    무료로 시작하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </UnifiedButton>
                </Link>
                <Link href="/">
                  <UnifiedButton variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                    홈으로 돌아가기
                  </UnifiedButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </div>
  )
}