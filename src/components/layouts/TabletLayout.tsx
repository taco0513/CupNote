/**
 * TabletLayout - 태블릿 전용 1.5-Column 레이아웃
 * 사이드바 + 메인 콘텐츠 분할 뷰 시스템
 * Phase 2에서 완전 구현 예정
 */
'use client'

import { ReactNode } from 'react'
import { useResponsive } from '../../contexts/ResponsiveContext'

export interface TabletLayoutProps {
  children: ReactNode
  enableTransitions?: boolean
  showDeviceIndicator?: boolean
  'aria-label'?: string
}

export default function TabletLayout({
  children,
  enableTransitions = true,
  showDeviceIndicator = false,
  'aria-label': ariaLabel = '태블릿 레이아웃'
}: TabletLayoutProps) {
  
  const { isTablet, width, height } = useResponsive()
  const transitionClass = enableTransitions ? 'transition-all duration-300 ease-in-out' : ''
  
  return (
    <div 
      className={`tablet-layout min-h-screen bg-coffee-50 ${transitionClass}`}
      aria-label={ariaLabel}
      data-testid="tablet-layout"
    >
      {/* Phase 2 구현 예정 알림 */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-coffee-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📟</span>
          </div>
          
          <h2 className="text-2xl font-bold text-coffee-800 mb-2">
            태블릿 레이아웃
          </h2>
          
          <p className="text-coffee-600 mb-6">
            1.5-Column 분할 뷰 시스템이 Phase 2에서 구현될 예정입니다.
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-coffee-200 text-left">
            <h3 className="font-semibold text-coffee-800 mb-2">예정 기능:</h3>
            <ul className="text-sm text-coffee-600 space-y-1">
              <li>• 왼쪽 사이드바 (30%) - 세로형 네비게이션</li>
              <li>• 메인 콘텐츠 (70%) - 분할 뷰</li>
              <li>• 배치 편집 기능</li>
              <li>• 확장된 필터 시스템</li>
              <li>• 키보드 네비게이션</li>
            </ul>
          </div>

          <div className="mt-6 text-xs text-coffee-500">
            현재 화면: {width}×{height}px
          </div>
        </div>
      </div>
      
      {/* 임시로 모바일 스타일로 children 렌더링 */}
      <div className="sr-only">
        {children}
      </div>
    </div>
  )
}