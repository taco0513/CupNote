/**
 * Phase 1 반응형 시스템 테스트 페이지
 * ResponsiveContext, SwipeableItem, TouchOptimization 검증
 */
'use client'

import { useState } from 'react'
import { Coffee, Edit, Copy, Trash, Star } from 'lucide-react'

import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import ResponsiveLayout from '../../components/layouts/ResponsiveLayout'
import SwipeableItem from '../../components/ui/SwipeableItem'
import FluidText from '../../components/ui/FluidText'
import { createTouchOptimizedProps } from '../../utils/touch-optimization'

export default function ResponsiveTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }
  
  // 샘플 커피 기록 데이터
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
  
  // 스와이프 액션 정의
  const leftActions = [
    {
      id: 'favorite',
      label: '즐겨찾기',
      icon: <Star className="h-4 w-4" />,
      color: 'warning' as const,
      onClick: () => addTestResult('즐겨찾기 액션 실행됨')
    }
  ]
  
  const rightActions = [
    {
      id: 'edit',
      label: '편집',
      icon: <Edit className="h-4 w-4" />,
      color: 'primary' as const,
      onClick: () => addTestResult('편집 액션 실행됨')
    },
    {
      id: 'copy',
      label: '복사',
      icon: <Copy className="h-4 w-4" />,
      color: 'secondary' as const,
      onClick: () => addTestResult('복사 액션 실행됨')
    },
    {
      id: 'delete',
      label: '삭제',
      icon: <Trash className="h-4 w-4" />,
      color: 'error' as const,
      onClick: () => addTestResult('삭제 액션 실행됨')
    }
  ]
  
  return (
    <ResponsiveProvider>
      <ResponsiveLayout 
        showDeviceIndicator={true}
        enableTransitions={true}
      >
        <div className="min-h-screen bg-coffee-50 p-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* 페이지 헤더 */}
            <div className="text-center">
              <FluidText as="h1" size="3xl" weight="bold" className="mb-2">
                ☕ Phase 1 반응형 시스템 테스트
              </FluidText>
              <FluidText as="p" size="lg" color="secondary">
                ResponsiveContext, SwipeableItem, TouchOptimization 검증
              </FluidText>
            </div>
            
            {/* 반응형 정보 표시 */}
            <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
              <FluidText as="h2" size="xl" weight="semibold" className="mb-4">
                🖥️ 현재 반응형 상태
              </FluidText>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Device Type:</strong>
                  <div className="text-coffee-600" data-testid="device-type">모바일/태블릿/데스크탑</div>
                </div>
                <div>
                  <strong>Breakpoint:</strong>
                  <div className="text-coffee-600" data-testid="breakpoint">auto-detected</div>
                </div>
                <div>
                  <strong>Screen Size:</strong>
                  <div className="text-coffee-600" data-testid="screen-size">auto-detected</div>
                </div>
                <div>
                  <strong>Touch Device:</strong>
                  <div className="text-coffee-600" data-testid="touch-device">auto-detected</div>
                </div>
              </div>
            </div>
            
            {/* 스와이프 테스트 섹션 */}
            <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
              <FluidText as="h2" size="xl" weight="semibold" className="mb-4">
                👆 SwipeableItem 테스트
              </FluidText>
              <FluidText as="p" size="sm" color="secondary" className="mb-6">
                모바일에서 좌우로 스와이프하여 액션 메뉴를 확인하세요
              </FluidText>
              
              <div className="space-y-4">
                {sampleRecords.map((record) => (
                  <SwipeableItem
                    key={record.id}
                    leftActions={leftActions}
                    rightActions={rightActions}
                    className="w-full"
                    onSwipeStart={(direction) => addTestResult(`${direction} 스와이프 시작`)}
                    onSwipeEnd={(direction, distance) => addTestResult(`${direction} 스와이프 종료 (${distance}px)`)}
                    onActionTrigger={(action) => addTestResult(`액션 트리거: ${action.label}`)}
                  >
                    <div className="bg-coffee-50 border border-coffee-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FluidText as="h3" size="base" weight="semibold">
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
                    </div>
                  </SwipeableItem>
                ))}
              </div>
            </div>
            
            {/* 터치 최적화 테스트 */}
            <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
              <FluidText as="h2" size="xl" weight="semibold" className="mb-4">
                🤏 터치 최적화 테스트
              </FluidText>
              <FluidText as="p" size="sm" color="secondary" className="mb-6">
                모든 버튼이 44px+ 터치 타겟을 가지고 있는지 확인
              </FluidText>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['sm', 'md', 'lg'].map((size) => (
                  <button
                    key={size}
                    {...createTouchOptimizedProps(size as any)}
                    className={`
                      bg-coffee-500 text-white rounded-lg font-medium
                      hover:bg-coffee-600 active:scale-95 transition-all
                      ${createTouchOptimizedProps(size as any).className}
                    `}
                    onClick={() => addTestResult(`${size.toUpperCase()} 버튼 클릭`)}
                  >
                    {size.toUpperCase()} 버튼
                  </button>
                ))}
                
                <button
                  className="
                    min-w-[44px] min-h-[44px] 
                    bg-amber-500 text-white rounded-full
                    hover:bg-amber-600 active:scale-95 transition-all
                    flex items-center justify-center
                  "
                  onClick={() => addTestResult('FAB 버튼 클릭')}
                  aria-label="플로팅 액션 버튼"
                >
                  <Coffee className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* 디자인 토큰 테스트 */}
            <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
              <FluidText as="h2" size="xl" weight="semibold" className="mb-4">
                🎨 디자인 토큰 테스트
              </FluidText>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-coffee-100 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs">coffee-100</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-coffee-300 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs">coffee-300</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-coffee-500 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs">coffee-500</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-coffee-700 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs">coffee-700</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <FluidText as="p" size="xs">Fluid XS Text</FluidText>
                <FluidText as="p" size="sm">Fluid SM Text</FluidText>
                <FluidText as="p" size="base">Fluid Base Text</FluidText>
                <FluidText as="p" size="lg">Fluid LG Text</FluidText>
                <FluidText as="p" size="xl">Fluid XL Text</FluidText>
              </div>
            </div>
            
            {/* 테스트 로그 */}
            <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
              <FluidText as="h2" size="xl" weight="semibold" className="mb-4">
                📋 테스트 로그
              </FluidText>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    아직 테스트 결과가 없습니다
                  </div>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700">
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                onClick={() => setTestResults([])}
              >
                로그 지우기
              </button>
            </div>
            
          </div>
        </div>
      </ResponsiveLayout>
    </ResponsiveProvider>
  )
}