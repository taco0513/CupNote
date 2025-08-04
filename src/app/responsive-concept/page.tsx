/**
 * 반응형 디자인 컨셉 페이지
 * Mobile/Tablet/Desktop 레이아웃 시연
 */
'use client'

import { useState } from 'react'
import { 
  BarChart3, Coffee, Plus, User, Home, Trophy, Settings, 
  Copy, Edit, Star, Trash, ChevronRight, ArrowLeft,
  Smartphone, Tablet, Monitor, Palette, Layout, Target
} from 'lucide-react'

import FluidText from '../../components/ui/FluidText'
import FluidContainer from '../../components/ui/FluidContainer'
import { Card, CardContent } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'

export default function ResponsiveConceptPage() {
  const [currentView, setCurrentView] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [showSwipeActions, setShowSwipeActions] = useState(false)

  // 샘플 데이터
  const sampleRecords = [
    {
      id: 1,
      name: "에티오피아 예가체프",
      roaster: "블루보틀",
      rating: 4.5,
      date: "2024-08-04",
      notes: "밝은 산미와 플로럴 향이 인상적"
    },
    {
      id: 2,
      name: "콜롬비아 슈프리모",
      roaster: "스타벅스",
      rating: 4.0,
      date: "2024-08-03",
      notes: "균형잡힌 바디감과 달콤한 후미"
    },
    {
      id: 3,
      name: "과테말라 안티구아",
      roaster: "커피빈",
      rating: 4.2,
      date: "2024-08-02",
      notes: "스모키한 향과 초콜릿 노트"
    }
  ]

  const DeviceToggle = () => (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-2xl border border-coffee-200 shadow-lg p-2">
      <div className="flex space-x-2">
        {[
          { key: 'mobile', icon: Smartphone, label: '모바일' },
          { key: 'tablet', icon: Tablet, label: '태블릿' },
          { key: 'desktop', icon: Monitor, label: '데스크탑' }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all ${
              currentView === key 
                ? 'bg-coffee-500 text-white shadow-md' 
                : 'text-coffee-600 hover:bg-coffee-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const MobileLayout = () => (
    <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
      {/* 모바일 상단 바 */}
      <div className="bg-gray-900 text-white text-center py-2 text-xs">
        9:41 AM • CupNote Mobile
      </div>
      
      {/* 모바일 컨텐츠 */}
      <div className="h-[600px] overflow-y-auto">
        {/* 현재 상단 네비게이션 시스템 유지 */}
        <div className="bg-white border-b border-coffee-200/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-coffee-600" />
            <FluidText as="h1" size="lg" weight="bold" className="text-coffee-800">
              CupNote
            </FluidText>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 프로필 버튼 */}
            <div className="w-8 h-8 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-sm">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-gradient-to-r from-coffee-100 to-amber-50 p-4">
          <FluidText as="h2" size="xl" weight="bold" className="mb-2">
            ☕ 오늘의 커피
          </FluidText>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-coffee-700">3</div>
              <div className="text-xs text-coffee-600">이번 주</div>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-coffee-700">12</div>
              <div className="text-xs text-coffee-600">총 기록</div>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-coffee-700">4.2</div>
              <div className="text-xs text-coffee-600">평균 평점</div>
            </div>
          </div>
        </div>

        {/* 최근 기록 */}
        <div className="p-4">
          <FluidText as="h3" size="lg" weight="semibold" className="mb-3">
            최근 기록
          </FluidText>
          
          <div className="space-y-3">
            {sampleRecords.slice(0, 2).map((record) => (
              <div
                key={record.id}
                className="bg-white border border-coffee-200 rounded-xl p-4 shadow-sm relative"
                onTouchStart={() => setShowSwipeActions(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <FluidText as="h4" size="base" weight="semibold">
                    {record.name}
                  </FluidText>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <span className="text-sm">{record.rating}</span>
                  </div>
                </div>
                <FluidText as="p" size="sm" color="secondary" className="mb-2">
                  {record.notes}
                </FluidText>
                <div className="text-xs text-coffee-500">
                  {record.roaster} • {record.date}
                </div>
                
                {/* 스와이프 액션 미리보기 */}
                {showSwipeActions && record.id === 1 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-2">
                    <div className="bg-blue-500 text-white p-2 rounded-lg">
                      <Copy className="h-4 w-4" />
                    </div>
                    <div className="bg-green-500 text-white p-2 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 하단 네비게이션 5탭 구조 유지 */}
      <div className="bg-white border-t border-coffee-200">
        <div className="grid grid-cols-5 h-16">
          {[
            { icon: Home, label: '홈', active: true },
            { icon: Coffee, label: '내 기록', active: false },
            { icon: Plus, label: '작성', active: false, special: true },
            { icon: Trophy, label: '성취', active: false },
            { icon: Settings, label: '설정', active: false }
          ].map(({ icon: Icon, label, active, special }) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center space-y-1 relative ${
                special 
                  ? 'text-white' 
                  : active 
                    ? 'text-coffee-700' 
                    : 'text-coffee-400'
              }`}
            >
              {special && (
                <div className="absolute inset-2 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-xl shadow-lg" />
              )}
              <Icon className={`h-5 w-5 relative ${active ? 'scale-110' : ''}`} />
              <span className="text-xs relative">{label}</span>
              {active && !special && (
                <div className="absolute -top-1 w-1 h-1 bg-coffee-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const TabletLayout = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-600">
      {/* 태블릿 상단 바 */}
      <div className="bg-gray-800 text-white text-center py-2 text-sm">
        iPad • CupNote Tablet View
      </div>
      
      <div className="h-[500px] flex">
        {/* 왼쪽 사이드바 (30%) */}
        <div className="w-80 bg-coffee-50/50 border-r border-coffee-200 p-6">
          {/* 세로형 네비게이션 */}
          <nav className="space-y-2 mb-6">
            {[
              { icon: BarChart3, label: '대시보드', active: true },
              { icon: Coffee, label: '기록', active: false },
              { icon: Plus, label: '작성', active: false },
              { icon: User, label: '프로필', active: false }
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  active 
                    ? 'bg-coffee-100 text-coffee-800 shadow-sm' 
                    : 'text-coffee-600 hover:bg-coffee-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </nav>

          {/* 미니 위젯들 */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <FluidText as="h3" size="sm" weight="semibold" className="mb-2">
                  이번 주 요약
                </FluidText>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>총 기록</span>
                    <span className="font-semibold">3개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>평균 평점</span>
                    <span className="font-semibold">4.2⭐</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <FluidText as="h3" size="sm" weight="semibold" className="mb-2">
                  빠른 액션
                </FluidText>
                <div className="space-y-2">
                  <UnifiedButton size="sm" className="w-full justify-start text-left">
                    <Copy className="h-4 w-4 mr-2" />
                    어제 기록 복사
                  </UnifiedButton>
                  <UnifiedButton size="sm" variant="outline" className="w-full justify-start text-left">
                    <Plus className="h-4 w-4 mr-2" />
                    새 기록 작성
                  </UnifiedButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 메인 콘텐츠 (70%) */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <FluidText as="h1" size="2xl" weight="bold">
              커피 기록 대시보드
            </FluidText>
            <div className="flex space-x-2">
              <UnifiedButton size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                필터
              </UnifiedButton>
              <UnifiedButton size="sm">
                <Plus className="h-4 w-4 mr-2" />
                새 기록
              </UnifiedButton>
            </div>
          </div>

          {/* 분할 뷰 */}
          <div className="grid grid-cols-2 gap-6 h-80">
            {/* 기록 리스트 */}
            <div className="bg-coffee-50/30 rounded-xl p-4 overflow-y-auto">
              <FluidText as="h2" size="lg" weight="semibold" className="mb-4">
                최근 기록
              </FluidText>
              <div className="space-y-3">
                {sampleRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-coffee-400"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FluidText as="h3" size="sm" weight="semibold">
                        {record.name}
                      </FluidText>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-amber-400 fill-current" />
                        <span className="text-xs">{record.rating}</span>
                      </div>
                    </div>
                    <FluidText as="p" size="xs" color="secondary">
                      {record.roaster} • {record.date}
                    </FluidText>
                  </div>
                ))}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="bg-white rounded-xl p-4 border border-coffee-200">
              <FluidText as="h2" size="lg" weight="semibold" className="mb-4">
                기록 상세
              </FluidText>
              <div className="space-y-4">
                <div>
                  <FluidText as="h3" size="base" weight="semibold" className="mb-2">
                    에티오피아 예가체프
                  </FluidText>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-coffee-600">로스터:</span>
                      <span className="ml-2 font-medium">블루보틀</span>
                    </div>
                    <div>
                      <span className="text-coffee-600">평점:</span>
                      <span className="ml-2 font-medium">4.5⭐</span>
                    </div>
                    <div>
                      <span className="text-coffee-600">날짜:</span>
                      <span className="ml-2 font-medium">2024-08-04</span>
                    </div>
                    <div>
                      <span className="text-coffee-600">모드:</span>
                      <span className="ml-2 font-medium">Cafe</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <FluidText as="h4" size="sm" weight="semibold" className="mb-2">
                    테이스팅 노트
                  </FluidText>
                  <FluidText as="p" size="sm" color="secondary" className="bg-coffee-50 rounded-lg p-3">
                    밝은 산미와 플로럴 향이 인상적. 레몬과 베르가못 향이 느껴지며, 
                    깔끔한 후미가 특징적이다.
                  </FluidText>
                </div>

                <div className="flex space-x-2 pt-2">
                  <UnifiedButton size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </UnifiedButton>
                  <UnifiedButton size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    복사
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const DesktopLayout = () => (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-400">
      {/* 데스크탑 상단 바 */}
      <div className="bg-gray-700 text-white text-center py-2 text-sm">
        Desktop • CupNote Full Dashboard
      </div>
      
      <div className="h-[600px] flex">
        {/* 왼쪽 사이드바 (20%) */}
        <div className="w-64 bg-coffee-50 border-r border-coffee-200 p-4">
          <FluidText as="h2" size="lg" weight="bold" className="mb-4 text-coffee-800">
            CupNote
          </FluidText>
          
          {/* 전체 메뉴 트리 */}
          <nav className="space-y-1">
            {[
              { 
                icon: BarChart3, 
                label: '대시보드', 
                active: true,
                children: ['전체 현황', '트렌드 분석', 'AI 인사이트']
              },
              { 
                icon: Coffee, 
                label: '커피 기록',
                children: ['전체 기록', '즐겨찾기', '최근 기록']
              },
              { 
                icon: Trophy, 
                label: '성취 & 통계',
                children: ['배지 관리', '진행률', '랭킹']
              },
              { 
                icon: Settings, 
                label: '설정 & 도구',
                children: ['계정 설정', '데이터 관리', '관리자']
              }
            ].map(({ icon: Icon, label, active, children }) => (
              <div key={label}>
                <div
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    active 
                      ? 'bg-coffee-200 text-coffee-800' 
                      : 'text-coffee-600 hover:bg-coffee-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                  <ChevronRight className="h-3 w-3 ml-auto" />
                </div>
                {active && children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {children.map((child) => (
                      <div
                        key={child}
                        className="text-xs text-coffee-600 hover:text-coffee-800 cursor-pointer py-1 px-2 hover:bg-coffee-50 rounded"
                      >
                        {child}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 빠른 필터 */}
          <div className="mt-6">
            <FluidText as="h3" size="sm" weight="semibold" className="mb-2">
              빠른 필터
            </FluidText>
            <div className="space-y-1">
              {['최근 7일', '이번 달', '높은 평점', '즐겨찾기'].map((filter) => (
                <div
                  key={filter}
                  className="text-xs text-coffee-600 hover:text-coffee-800 cursor-pointer py-1 px-2 hover:bg-coffee-50 rounded"
                >
                  {filter}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 (60%) */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <FluidText as="h1" size="3xl" weight="bold">
              커피 분석 대시보드
            </FluidText>
            <div className="flex space-x-2">
              <UnifiedButton size="sm" variant="outline">
                내보내기
              </UnifiedButton>
              <UnifiedButton size="sm">
                <Plus className="h-4 w-4 mr-2" />
                새 기록
              </UnifiedButton>
            </div>
          </div>

          {/* 고급 분석 차트 영역 */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* 트렌드 차트 */}
            <Card>
              <CardContent className="p-4">
                <FluidText as="h3" size="lg" weight="semibold" className="mb-4">
                  테이스팅 트렌드
                </FluidText>
                <div className="h-40 bg-gradient-to-r from-coffee-100 to-amber-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-coffee-400 mx-auto mb-2" />
                    <FluidText as="p" size="sm" color="secondary">
                      월별 커피 기록 트렌드
                    </FluidText>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 평점 분포 */}
            <Card>
              <CardContent className="p-4">
                <FluidText as="h3" size="lg" weight="semibold" className="mb-4">
                  평점 분포
                </FluidText>
                <div className="h-40 bg-gradient-to-r from-amber-100 to-coffee-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                    <FluidText as="p" size="sm" color="secondary">
                      평점별 기록 분포도
                    </FluidText>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 데이터 테이블 */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-coffee-100">
                <FluidText as="h3" size="lg" weight="semibold">
                  전체 커피 기록
                </FluidText>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-coffee-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">이름</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">로스터</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">평점</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">날짜</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRecords.map((record, index) => (
                      <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-coffee-25'}>
                        <td className="px-4 py-3 text-sm font-medium text-coffee-800">{record.name}</td>
                        <td className="px-4 py-3 text-sm text-coffee-600">{record.roaster}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-amber-400 fill-current" />
                            <span>{record.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-coffee-600">{record.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <button className="p-1 text-coffee-600 hover:text-coffee-800">
                              <Edit className="h-3 w-3" />
                            </button>
                            <button className="p-1 text-coffee-600 hover:text-coffee-800">
                              <Copy className="h-3 w-3" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800">
                              <Trash className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 패널 (20%) */}
        <div className="w-64 bg-coffee-25 border-l border-coffee-200 p-4">
          <FluidText as="h3" size="base" weight="semibold" className="mb-4">
            AI 추천 & 인사이트
          </FluidText>
          
          <div className="space-y-4">
            {/* AI 추천 */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <FluidText as="h4" size="sm" weight="semibold">
                    오늘의 추천
                  </FluidText>
                </div>
                <FluidText as="p" size="xs" color="secondary">
                  최근 취향을 분석한 결과, 케냐 AA 등급 원두를 추천드립니다.
                </FluidText>
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <Card>
              <CardContent className="p-3">
                <FluidText as="h4" size="sm" weight="semibold" className="mb-3">
                  빠른 액션
                </FluidText>
                <div className="space-y-2">
                  <UnifiedButton size="sm" className="w-full text-xs justify-start">
                    <Plus className="h-3 w-3 mr-2" />
                    빠른 기록
                  </UnifiedButton>
                  <UnifiedButton size="sm" variant="outline" className="w-full text-xs justify-start">
                    <Copy className="h-3 w-3 mr-2" />
                    CSV 가져오기
                  </UnifiedButton>
                </div>
              </CardContent>
            </Card>

            {/* 알림 센터 */}
            <Card>
              <CardContent className="p-3">
                <FluidText as="h4" size="sm" weight="semibold" className="mb-3">
                  알림
                </FluidText>
                <div className="space-y-2">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded">
                    <FluidText as="p" size="xs">
                      새로운 성취 배지를 획득했습니다!
                    </FluidText>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-2 rounded">
                    <FluidText as="p" size="xs">
                      주간 리포트가 준비되었습니다.
                    </FluidText>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 p-4">
      <DeviceToggle />
      
      {/* 헤더 */}
      <div className="text-center mb-8 pt-16">
        <FluidText as="h1" size="4xl" weight="bold" className="mb-4">
          <span className="text-coffee-800">CupNote </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-amber-600">
            반응형 디자인
          </span>
        </FluidText>
        <FluidText as="p" size="lg" color="secondary" className="mb-6">
          모바일, 태블릿, 데스크탑 최적화 레이아웃 시연
        </FluidText>
        
        {/* 개선사항 요약 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <FluidText as="h3" size="base" weight="semibold" className="mb-2">
                모바일 유지
              </FluidText>
              <FluidText as="p" size="sm" color="secondary">
                현재 5-Tab 구조, 상단/하단 네비 시스템 유지
              </FluidText>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Layout className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <FluidText as="h3" size="base" weight="semibold" className="mb-2">
                태블릿 확장
              </FluidText>
              <FluidText as="p" size="sm" color="secondary">
                1.5-Column 레이아웃, 분할 뷰, 배치 편집
              </FluidText>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <FluidText as="h3" size="base" weight="semibold" className="mb-2">
                데스크탑 완전체
              </FluidText>
              <FluidText as="p" size="sm" color="secondary">
                3-Column 대시보드, 고급 분석, 키보드 단축키
              </FluidText>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 메인 컨셉 시연 */}
      <div className="flex justify-center">
        {currentView === 'mobile' && <MobileLayout />}
        {currentView === 'tablet' && <TabletLayout />}
        {currentView === 'desktop' && <DesktopLayout />}
      </div>

      {/* 하단 설명 */}
      <div className="text-center mt-8 max-w-2xl mx-auto">
        <FluidText as="p" size="base" color="secondary" className="mb-4">
          {currentView === 'mobile' && "📱 모바일: 현재 시스템 유지 - 5탭 하단 네비 + 상단 헤더"}
          {currentView === 'tablet' && "📟 태블릿: 확장된 정보와 분할 화면 지원"}
          {currentView === 'desktop' && "🖥️ 데스크탑: 전문가 도구와 고급 분석 기능"}
        </FluidText>
        
        <div className="flex justify-center space-x-4">
          <UnifiedButton 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </UnifiedButton>
          <UnifiedButton>
            <Palette className="h-4 w-4 mr-2" />
            실제 구현 시작
          </UnifiedButton>
        </div>
      </div>
    </div>
  )
}