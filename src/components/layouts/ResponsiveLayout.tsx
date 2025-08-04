/**
 * ResponsiveLayout - 메인 반응형 레이아웃 컨테이너
 * 디바이스별 적절한 레이아웃으로 자동 전환
 */
'use client'

import { ReactNode, Suspense, lazy } from 'react'
import { useResponsive } from '../../contexts/ResponsiveContext'

// 레이아웃 컴포넌트들을 동적 로딩으로 최적화
const MobileLayout = lazy(() => import('./MobileLayout'))
const TabletLayout = lazy(() => import('./TabletLayout'))
const DesktopLayout = lazy(() => import('./DesktopLayout'))

// 로딩 컴포넌트
const LayoutSkeleton = ({ deviceType }: { deviceType: string }) => (
  <div className="min-h-screen bg-coffee-50 animate-pulse">
    <div className="flex flex-col h-screen">
      {/* 헤더 스켈레톤 */}
      <div className="h-16 bg-white border-b border-coffee-200">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-coffee-200 rounded-full"></div>
            <div className="w-20 h-6 bg-coffee-200 rounded"></div>
          </div>
          <div className="w-8 h-8 bg-coffee-200 rounded-full"></div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 스켈레톤 */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="w-3/4 h-8 bg-coffee-200 rounded"></div>
          <div className="w-full h-32 bg-coffee-200 rounded-lg"></div>
          <div className="w-1/2 h-6 bg-coffee-200 rounded"></div>
        </div>
      </div>
      
      {/* 네비게이션 스켈레톤 (모바일) */}
      {deviceType === 'mobile' && (
        <div className="h-16 bg-white border-t border-coffee-200">
          <div className="flex items-center justify-around h-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-coffee-200 rounded"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)

export interface ResponsiveLayoutProps {
  children: ReactNode
  
  // 레이아웃 설정
  enableTransitions?: boolean
  showDeviceIndicator?: boolean
  
  // 성능 최적화
  preloadLayouts?: boolean
  enablePrefetch?: boolean
  
  // 테스트 지원
  testMode?: boolean
  forceLayout?: 'mobile' | 'tablet' | 'desktop'
  
  // 접근성
  'aria-label'?: string
  role?: string
}

export default function ResponsiveLayout({
  children,
  enableTransitions = true,
  showDeviceIndicator = false,
  preloadLayouts = true,
  enablePrefetch = false,
  testMode = false,
  forceLayout,
  'aria-label': ariaLabel = '반응형 메인 레이아웃',
  role = 'main'
}: ResponsiveLayoutProps) {
  
  const { deviceType, breakpoint, width, height, isMobile, isTablet, isDesktop } = useResponsive()
  
  // 테스트 모드에서는 강제 레이아웃 사용
  const activeDeviceType = testMode && forceLayout ? forceLayout : deviceType
  
  // 디바이스별 레이아웃 선택
  const getLayoutComponent = () => {
    switch (activeDeviceType) {
      case 'tablet':
        return (
          <Suspense fallback={<LayoutSkeleton deviceType="tablet" />}>
            <TabletLayout 
              enableTransitions={enableTransitions}
              showDeviceIndicator={showDeviceIndicator}
            >
              {children}
            </TabletLayout>
          </Suspense>
        )
      
      case 'desktop':
        return (
          <Suspense fallback={<LayoutSkeleton deviceType="desktop" />}>
            <DesktopLayout 
              enableTransitions={enableTransitions}
              showDeviceIndicator={showDeviceIndicator}
            >
              {children}
            </DesktopLayout>
          </Suspense>
        )
      
      case 'mobile':
      default:
        return (
          <Suspense fallback={<LayoutSkeleton deviceType="mobile" />}>
            <MobileLayout 
              enableTransitions={enableTransitions}
              showDeviceIndicator={showDeviceIndicator}
            >
              {children}
            </MobileLayout>
          </Suspense>
        )
    }
  }
  
  // 전환 애니메이션 클래스
  const transitionClasses = enableTransitions 
    ? 'transition-all duration-300 ease-in-out' 
    : ''
  
  return (
    <div 
      className={`responsive-layout ${transitionClasses}`}
      role={role}
      aria-label={ariaLabel}
      data-device-type={activeDeviceType}
      data-breakpoint={breakpoint}
      data-width={width}
      data-height={height}
      style={{
        // CSS 커스텀 프로퍼티로 현재 디바이스 정보 전달
        '--current-device': activeDeviceType,
        '--current-breakpoint': breakpoint,
        '--viewport-width': `${width}px`,
        '--viewport-height': `${height}px`
      } as React.CSSProperties}
    >
      {/* 개발 모드 디바이스 표시기 */}
      {showDeviceIndicator && (
        <div className="fixed top-4 left-4 z-50 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-mono">
          {activeDeviceType} ({width}×{height}) {breakpoint}
        </div>
      )}
      
      {/* 메인 레이아웃 렌더링 */}
      {getLayoutComponent()}
      
      {/* 스크린 리더용 정보 */}
      <div className="sr-only">
        현재 레이아웃: {activeDeviceType}, 
        화면 크기: {width} x {height} 픽셀,
        브레이크포인트: {breakpoint}
      </div>
      
      {/* 레이아웃 전환 감지를 위한 이벤트 */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {/* 레이아웃 변경 시 스크린 리더에 알림 */}
        {activeDeviceType} 레이아웃이 활성화되었습니다
      </div>
    </div>
  )
}

// 컴포넌트별 추가 유틸리티들
export const useCurrentLayout = () => {
  const { deviceType } = useResponsive()
  return deviceType
}

export const withResponsiveLayout = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function WrappedComponent(props: P) {
    return (
      <ResponsiveLayout>
        <Component {...props} />
      </ResponsiveLayout>
    )
  }
}

// 타입 export
export type { ResponsiveLayoutProps }