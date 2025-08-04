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
              primarySlot={
                <div className="tablet-primary-content">
                  {/* 좌측 패널: 네비게이션과 목록 */}
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-coffee-800 mb-2">네비게이션</h2>
                    <div className="space-y-2">
                      <div className="p-2 bg-coffee-100 rounded-lg text-sm">홈</div>
                      <div className="p-2 bg-coffee-100 rounded-lg text-sm">내 기록</div>
                      <div className="p-2 bg-coffee-100 rounded-lg text-sm">분석</div>
                      <div className="p-2 bg-coffee-100 rounded-lg text-sm">설정</div>
                    </div>
                  </div>
                </div>
              }
              secondarySlot={
                <div className="tablet-secondary-content">
                  {/* 우측 패널: 메인 컨텐츠 */}
                  {children}
                </div>
              }
              headerSlot={showDeviceIndicator && (
                <div className="p-4 bg-coffee-100 text-center text-sm text-coffee-600">
                  태블릿 모드 - Phase 2 구현 완료
                </div>
              )}
            />
          </Suspense>
        )
      
      case 'desktop':
        return (
          <Suspense fallback={<LayoutSkeleton deviceType="desktop" />}>
            <DesktopLayout 
              leftSidebarSlot={
                <div className="desktop-sidebar-content p-4">
                  {/* 좌측 사이드바: 네비게이션과 필터 */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-coffee-800 mb-3">📁 네비게이션</h2>
                    <div className="space-y-1">
                      <div className="p-3 bg-coffee-500 text-white rounded-lg text-sm font-medium">🏠 홈</div>
                      <div className="p-3 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 cursor-pointer">☕ 내 기록</div>
                      <div className="p-3 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 cursor-pointer">📊 분석</div>
                      <div className="p-3 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 cursor-pointer">⚙️ 설정</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-coffee-800 mb-2">🔍 빠른 검색</h3>
                    <input 
                      type="text" 
                      placeholder="커피 기록 검색..." 
                      className="w-full p-2 border border-coffee-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-300"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold text-coffee-800 mb-2">🏷️ 태그</h3>
                    <div className="space-y-1 text-sm">
                      <div className="p-2 bg-coffee-50 rounded cursor-pointer hover:bg-coffee-100">에스프레소 (12)</div>
                      <div className="p-2 bg-coffee-50 rounded cursor-pointer hover:bg-coffee-100">드립커피 (8)</div>
                      <div className="p-2 bg-coffee-50 rounded cursor-pointer hover:bg-coffee-100">라떼 (15)</div>
                    </div>
                  </div>
                </div>
              }
              mainContentSlot={
                <div className="desktop-main-content p-6">
                  {/* 메인 콘텐츠: 데스크탑 최적화 */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-coffee-800 mb-2">☕ CupNote 데스크탑</h1>
                    <p className="text-coffee-600">전문가급 커피 기록 관리 시스템</p>
                  </div>
                  {children}
                </div>
              }
              rightPanelSlot={
                <div className="desktop-tools-panel p-4">
                  {/* 우측 패널: 도구와 정보 */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-coffee-800 mb-3">🛠️ 빠른 도구</h2>
                    <div className="space-y-2">
                      <button className="w-full p-2 bg-coffee-500 text-white rounded-lg text-sm font-medium hover:bg-coffee-600 transition-colors">+ 새 기록</button>
                      <button className="w-full p-2 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 transition-colors">📤 내보내기</button>
                      <button className="w-full p-2 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 transition-colors">🔄 동기화</button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-coffee-800 mb-2">📈 통계</h3>
                    <div className="bg-coffee-50 rounded-lg p-3 text-sm">
                      <div className="flex justify-between mb-2">
                        <span>총 기록:</span>
                        <span className="font-medium">47개</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>평균 평점:</span>
                        <span className="font-medium">4.2⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span>이번 달:</span>
                        <span className="font-medium">12개</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold text-coffee-800 mb-2">💡 팁</h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      <strong>키보드 단축키:</strong><br/>
                      Ctrl+Shift+L/M/R로 패널 간 이동<br/>
                      Ctrl+B로 사이드바 토글
                    </div>
                  </div>
                </div>
              }
              headerSlot={showDeviceIndicator && (
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-lg font-semibold text-coffee-800">데스크탑 모드 - Phase 3 구현 완료</span>
                  </div>
                  <div className="text-sm text-coffee-600">3-Column 레이아웃 활성화</div>
                </div>
              )}
              statusBarSlot={showDeviceIndicator && (
                <div className="flex items-center justify-between px-4 py-2 text-xs text-coffee-600">
                  <span>Ready</span>
                  <span>3-Column Desktop Layout</span>
                  <span>{width}×{height}px</span>
                </div>
              )}
            />
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