/**
 * DesktopLayout - 데스크탑 전용 3-Column 대시보드
 * 전문가 도구와 고급 분석 기능
 * Phase 3에서 완전 구현 예정
 */
'use client'

import { ReactNode } from 'react'
import { useResponsive } from '../../contexts/ResponsiveContext'

export interface DesktopLayoutProps {
  children: ReactNode
  enableTransitions?: boolean
  showDeviceIndicator?: boolean
  'aria-label'?: string
}

export default function DesktopLayout({
  children,
  enableTransitions = true,
  showDeviceIndicator = false,
  'aria-label': ariaLabel = '데스크탑 레이아웃'
}: DesktopLayoutProps) {
  
  const { isDesktop, width, height } = useResponsive()
  const transitionClass = enableTransitions ? 'transition-all duration-300 ease-in-out' : ''
  
  return (
    <div 
      className={`desktop-layout min-h-screen bg-coffee-50 ${transitionClass}`}
      aria-label={ariaLabel}
      data-testid="desktop-layout"
    >
      {/* Phase 3 구현 예정 알림 */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-2xl text-center">
          <div className="w-20 h-20 bg-coffee-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🖥️</span>
          </div>
          
          <h2 className="text-3xl font-bold text-coffee-800 mb-3">
            데스크탑 대시보드
          </h2>
          
          <p className="text-lg text-coffee-600 mb-8">
            3-Column 전문가 도구가 Phase 3에서 구현될 예정입니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 왼쪽 사이드바 */}
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <h3 className="font-semibold text-coffee-800 mb-3">왼쪽 사이드바 (20%)</h3>
              <ul className="text-sm text-coffee-600 space-y-2">
                <li>• 전체 메뉴 트리</li>
                <li>• 빠른 필터 패널</li>
                <li>• 미니 캘린더</li>
                <li>• 활동 로그</li>
              </ul>
            </div>
            
            {/* 메인 콘텐츠 */}
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <h3 className="font-semibold text-coffee-800 mb-3">메인 콘텐츠 (60%)</h3>
              <ul className="text-sm text-coffee-600 space-y-2">
                <li>• 고급 분석 차트</li>
                <li>• 데이터 테이블</li>
                <li>• 배치 작업 도구</li>
                <li>• 키보드 단축키</li>
              </ul>
            </div>
            
            {/* 오른쪽 패널 */}
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <h3 className="font-semibold text-coffee-800 mb-3">오른쪽 패널 (20%)</h3>
              <ul className="text-sm text-coffee-600 space-y-2">
                <li>• AI 추천 시스템</li>
                <li>• 빠른 액션 센터</li>
                <li>• 알림 피드</li>
                <li>• 컨텍스트 정보</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">전문가 기능 미리보기:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-amber-700">
              <div>
                <strong>고급 분석:</strong>
                <br />트렌드 차트, 평점 분포, 플레이버 프로파일
              </div>
              <div>
                <strong>생산성 도구:</strong>
                <br />CSV 내보내기, 배치 편집, 실시간 동기화
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-coffee-500">
            현재 화면: {width}×{height}px
          </div>
        </div>
      </div>
      
      {/* 임시로 숨겨진 children 렌더링 */}
      <div className="sr-only">
        {children}
      </div>
    </div>
  )
}