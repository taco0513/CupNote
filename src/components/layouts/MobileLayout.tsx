/**
 * MobileLayout - 모바일 전용 레이아웃
 * 기존 5-Tab 하단 네비게이션 + 상단 헤더 시스템 유지
 */
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Coffee, User, Home, Trophy, Settings, Plus } from 'lucide-react'
import { useResponsive } from '../../contexts/ResponsiveContext'

export interface MobileLayoutProps {
  children: ReactNode
  enableTransitions?: boolean
  showDeviceIndicator?: boolean
  
  // 네비게이션 설정
  activeTab?: string
  onTabChange?: (tab: string) => void
  
  // 헤더 설정
  showHeader?: boolean
  headerTitle?: string
  
  // 접근성
  'aria-label'?: string
}

// 네비게이션 탭 정의
const navigationTabs = [
  { 
    id: 'home', 
    icon: Home, 
    label: '홈', 
    href: '/',
    description: '대시보드 및 최근 활동'
  },
  { 
    id: 'records', 
    icon: Coffee, 
    label: '내 기록', 
    href: '/records',
    description: '커피 기록 목록 및 검색'
  },
  { 
    id: 'create', 
    icon: Plus, 
    label: '작성', 
    href: '/create',
    description: '새 커피 기록 작성',
    special: true // 특별한 스타일링
  },
  { 
    id: 'achievements', 
    icon: Trophy, 
    label: '성취', 
    href: '/achievements',
    description: '배지 및 성취 진행률'
  },
  { 
    id: 'settings', 
    icon: Settings, 
    label: '설정', 
    href: '/settings',
    description: '계정 및 앱 설정'
  }
]

export default function MobileLayout({
  children,
  enableTransitions = true,
  showDeviceIndicator = false,
  activeTab = 'home',
  onTabChange,
  showHeader = true,
  headerTitle = 'CupNote',
  'aria-label': ariaLabel = '모바일 레이아웃'
}: MobileLayoutProps) {
  
  const { isMobile, width, height } = useResponsive()
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  // 스크롤에 따른 헤더 숨김/표시
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // 스크롤 다운 - 헤더 숨김
        setIsHeaderVisible(false)
      } else {
        // 스크롤 업 - 헤더 표시
        setIsHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])
  
  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string, href: string) => {
    onTabChange?.(tabId)
    
    // 실제 네비게이션은 Next.js Router로 처리
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', href)
    }
  }
  
  // 키보드 네비게이션
  const handleTabKeyDown = (e: React.KeyboardEvent, tabId: string, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTabClick(tabId, href)
    }
  }
  
  // 전환 애니메이션 클래스
  const transitionClass = enableTransitions ? 'transition-all duration-300 ease-in-out' : ''
  
  return (
    <div 
      className={`mobile-layout flex flex-col h-screen bg-coffee-50 ${transitionClass}`}
      aria-label={ariaLabel}
      data-testid="mobile-layout"
    >
      {/* 상단 헤더 (기존 시스템 유지) */}
      {showHeader && (
        <header 
          className={`
            bg-white border-b border-coffee-200/30 px-4 py-3 
            ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}
            ${transitionClass} sticky top-0 z-40
          `}
          role="banner"
        >
          <div className="flex items-center justify-between h-full">
            {/* 로고 및 브랜드 */}
            <div className="flex items-center space-x-2">
              <Coffee className="h-6 w-6 text-coffee-600" aria-hidden="true" />
              <h1 className="text-lg font-bold text-coffee-800 tracking-tight">
                {headerTitle}
              </h1>
            </div>
            
            {/* 프로필 버튼 */}
            <button
              className="
                w-10 h-10 bg-gradient-to-r from-coffee-400 to-coffee-500 
                rounded-full flex items-center justify-center shadow-sm
                touch-target hover:from-coffee-500 hover:to-coffee-600
                focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
                transition-all duration-200 active:scale-95
              "
              aria-label="사용자 프로필 메뉴 열기"
              data-testid="profile-button"
            >
              <User className="h-5 w-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </header>
      )}
      
      {/* 메인 콘텐츠 영역 */}
      <main 
        className="flex-1 overflow-y-auto scroll-smooth safe-area-inset"
        role="main"
        aria-label="메인 콘텐츠"
      >
        {children}
      </main>
      
      {/* 하단 5-Tab 네비게이션 (기존 시스템 유지) */}
      <nav 
        className="
          bg-white border-t border-coffee-200 safe-area-inset
          backdrop-blur-sm bg-white/95 sticky bottom-0 z-50
        "
        role="navigation"
        aria-label="메인 네비게이션"
        data-testid="bottom-navigation"
      >
        <div className="grid grid-cols-5 h-16">
          {navigationTabs.map(({ id, icon: Icon, label, href, description, special }) => {
            const isActive = activeTab === id
            
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id, href)}
                onKeyDown={(e) => handleTabKeyDown(e, id, href)}
                className={`
                  flex flex-col items-center justify-center space-y-1 relative
                  touch-target transition-all duration-200 focus:outline-none
                  ${special 
                    ? 'text-white' 
                    : isActive 
                      ? 'text-coffee-700' 
                      : 'text-coffee-400 hover:text-coffee-600'
                  }
                  ${isActive && !special ? 'scale-110' : 'active:scale-95'}
                `}
                aria-label={`${label} - ${description}`}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`nav-tab-${id}`}
              >
                {/* 특별한 작성 버튼 배경 */}
                {special && (
                  <div className="
                    absolute inset-2 bg-gradient-to-br from-coffee-500 to-coffee-600 
                    rounded-xl shadow-lg scale-95 hover:scale-100 transition-transform
                  " />
                )}
                
                {/* 아이콘 */}
                <Icon 
                  className={`h-5 w-5 relative ${isActive && !special ? 'scale-110' : ''}`} 
                  aria-hidden="true"
                />
                
                {/* 라벨 */}
                <span className="text-xs relative font-medium">
                  {label}
                </span>
                
                {/* 활성 상태 인디케이터 */}
                {isActive && !special && (
                  <div className="absolute -top-1 w-1 h-1 bg-coffee-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
      
      {/* 스크린 리더용 네비게이션 안내 */}
      <div className="sr-only">
        현재 활성 탭: {navigationTabs.find(tab => tab.id === activeTab)?.label}
        총 {navigationTabs.length}개 탭 중 {navigationTabs.findIndex(tab => tab.id === activeTab) + 1}번째
      </div>
      
      {/* 접근성 향상을 위한 스킵 링크 */}
      <a 
        href="#main-content"
        className="
          sr-only focus:not-sr-only fixed top-4 left-4 z-50
          bg-coffee-600 text-white px-4 py-2 rounded-md
          focus:outline-none focus:ring-2 focus:ring-white
        "
      >
        메인 콘텐츠로 건너뛰기
      </a>
    </div>
  )
}

// 모바일 전용 HOC
export const withMobileLayout = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function MobileWrappedComponent(props: P) {
    const { isMobile } = useResponsive()
    
    if (!isMobile) {
      return <Component {...props} />
    }
    
    return (
      <MobileLayout>
        <Component {...props} />
      </MobileLayout>
    )
  }
}

// 유틸리티 함수들
export const getMobileTabIndex = (tabId: string): number => {
  return navigationTabs.findIndex(tab => tab.id === tabId)
}

export const getMobileTabByIndex = (index: number) => {
  return navigationTabs[index] || null
}

export const isMobileTabActive = (currentTab: string, targetTab: string): boolean => {
  return currentTab === targetTab
}