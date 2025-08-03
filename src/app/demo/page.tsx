/**
 * 데모 페이지 - 비로그인 사용자를 위한 샘플 데이터 체험
 */
'use client'

import Link from 'next/link'

import { Coffee, Star, MapPin, Calendar, User, ArrowRight, Clock, Award, BarChart3 } from 'lucide-react'

import Navigation from '../../components/Navigation'
import { Card, CardContent } from '../../components/ui/Card'
import PageLayout from '../../components/ui/PageLayout'
import UnifiedButton from '../../components/ui/UnifiedButton'

// 샘플 커피 기록 데이터
const sampleRecords = [
  {
    id: 'demo-1',
    coffeeName: '에티오피아 예가체프',
    roaster: '블루보틀 코리아',
    location: '블루보틀 성수점',
    date: '2024-08-01',
    rating: 4.5,
    mode: 'cafe',
    notes: '밝은 산미와 플로럴한 향이 인상적이었어요. 처음 마셔본 싱글 오리진인데 정말 맛있었습니다!',
    tags: ['밝은', '플로럴', '산미'],
    image: null
  },
  {
    id: 'demo-2', 
    coffeeName: '콜롬비아 수프리모',
    roaster: '테라로사',
    location: '홈카페',
    date: '2024-07-28',
    rating: 4.0,
    mode: 'homecafe',
    notes: 'V60으로 추출했는데 달콤하고 부드러운 맛이 좋았어요. 원두 온도와 추출 시간을 더 연구해봐야겠습니다.',
    tags: ['달콤', '부드러운', 'V60'],
    brewing: {
      method: 'V60',
      grindSize: '중간',
      waterTemp: '92°C',
      brewTime: '3:30'
    }
  },
  {
    id: 'demo-3',
    coffeeName: '과테말라 안티구아',
    roaster: '프리츠',
    location: '프리츠 카페',
    date: '2024-07-25',
    rating: 3.5,
    mode: 'cafe',
    notes: '진한 바디감과 초콜릿 향이 특징적이었어요. 개인적으로는 조금 더 밝은 맛을 선호하는 것 같아요.',
    tags: ['진한', '초콜릿', '바디감'],
    image: null
  }
]

// 샘플 통계 데이터
const sampleStats = {
  totalRecords: 12,
  thisMonth: 5,
  averageRating: 4.1,
  favoriteOrigin: '에티오피아',
  favoriteMethod: 'V60',
  achievements: 3
}

export default function DemoPage() {
  return (
    <>
      <Navigation showBackButton={false} currentPage="home" />
      
      <PageLayout showHeader={false}>
        {/* 데모 페이지 헤더 */}
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-coffee-100/80 to-amber-50/80 backdrop-blur-sm rounded-2xl p-6 border border-coffee-200/30 shadow-sm mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center">
                <Coffee className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-coffee-600 bg-coffee-100/80 px-3 py-1 rounded-full">DEMO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-2" data-testid="demo-page-title">
              CupNote 체험하기
            </h1>
            <p className="text-coffee-600">
              실제 사용자의 커피 기록을 샘플로 확인해보세요
            </p>
          </div>
        </div>

        {/* 샘플 통계 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            커피 여정 통계
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-coffee-200/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-coffee-700 mb-1">{sampleStats.totalRecords}</div>
                <div className="text-xs text-coffee-600">총 기록</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-coffee-200/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-coffee-700 mb-1">{sampleStats.thisMonth}</div>
                <div className="text-xs text-coffee-600">이번 달</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-coffee-200/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-2xl font-bold text-coffee-700">{sampleStats.averageRating}</span>
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                </div>
                <div className="text-xs text-coffee-600">평균 평점</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-coffee-200/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-coffee-700 mb-1">{sampleStats.achievements}</div>
                <div className="text-xs text-coffee-600">달성 뱃지</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 샘플 커피 기록들 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            최근 커피 기록
          </h2>
          <div className="space-y-4">
            {sampleRecords.map((record) => (
              <Card key={record.id} className="bg-white/80 backdrop-blur-sm border-coffee-200/30 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-coffee-800">{record.coffeeName}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="text-sm font-medium text-coffee-700">{record.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-coffee-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{record.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.mode === 'cafe' ? 'bg-blue-100 text-blue-600' :
                          record.mode === 'homecafe' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {record.mode === 'cafe' ? '카페' : record.mode === 'homecafe' ? '홈카페' : '랩'}
                        </span>
                      </div>
                      <p className="text-coffee-700 text-sm leading-relaxed mb-3">
                        {record.notes}
                      </p>
                      {record.tags && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {record.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-coffee-100/80 text-coffee-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {record.brewing && (
                        <div className="flex items-center space-x-4 text-xs text-coffee-500 mt-2">
                          <span>📍 {record.brewing.method}</span>
                          <span>🌡️ {record.brewing.waterTemp}</span>
                          <span>⏱️ {record.brewing.brewTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 성취 시스템 미리보기 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            달성한 뱃지
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs text-coffee-600">첫 기록</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">☕</div>
              <div className="text-xs text-coffee-600">카페 러버</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-xs text-coffee-600">홈카페 마스터</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-coffee-200/20 rounded-xl p-3 text-center opacity-50">
              <div className="text-2xl mb-1">🌟</div>
              <div className="text-xs text-coffee-400">10회 달성</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-coffee-200/20 rounded-xl p-3 text-center opacity-50">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs text-coffee-400">분석가</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-coffee-200/20 rounded-xl p-3 text-center opacity-50">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs text-coffee-400">전문가</div>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-coffee-100/80 to-amber-50/80 backdrop-blur-sm border-coffee-200/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Coffee className="h-6 w-6 text-coffee-500" />
                <h2 className="text-xl font-bold text-coffee-800">나만의 커피 여정을 시작해보세요!</h2>
              </div>
              <p className="text-coffee-600 mb-6">
                이런 기록들을 직접 작성하고, 당신만의 커피 취향을 발견해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <UnifiedButton 
                    variant="primary" 
                    size="large"
                    className="w-full sm:w-auto bg-coffee-500 hover:bg-coffee-600 text-white px-8 py-3"
                    data-testid="demo-signup-button"
                  >
                    <User className="h-4 w-4 mr-2" />
                    회원가입하고 시작하기
                  </UnifiedButton>
                </Link>
                <Link href="/mode-selection">
                  <UnifiedButton 
                    variant="outline" 
                    size="large"
                    className="w-full sm:w-auto border-coffee-300 text-coffee-700 hover:bg-coffee-50 px-8 py-3"
                    data-testid="demo-record-button"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    바로 기록해보기
                  </UnifiedButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </>
  )
}