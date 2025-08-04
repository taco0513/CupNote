/**
 * ResponsiveContext - 반응형 시스템의 핵심 컨텍스트
 * 디바이스별 breakpoint와 상태 관리
 */
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Breakpoint 정의 (Tailwind CSS 기준)
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440
} as const

export type Breakpoint = keyof typeof BREAKPOINTS
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 반응형 컨텍스트 상태 인터페이스
export interface ResponsiveState {
  // 현재 breakpoint
  breakpoint: Breakpoint
  // 현재 디바이스 타입
  deviceType: DeviceType
  // 화면 크기
  width: number
  height: number
  // 편의 불린 값들
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  // 가로/세로 모드
  isLandscape: boolean
  isPortrait: boolean
  // 터치 디바이스 여부
  isTouchDevice: boolean
  // 고해상도 디스플레이 여부
  isHighDPI: boolean
  // 다크 모드 선호도
  prefersDarkMode: boolean
  // 애니메이션 감소 선호도
  prefersReducedMotion: boolean
}

// 초기 상태
const initialState: ResponsiveState = {
  breakpoint: 'mobile',
  deviceType: 'mobile',
  width: 0,
  height: 0,
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isWide: false,
  isLandscape: false,
  isPortrait: true,
  isTouchDevice: false,
  isHighDPI: false,
  prefersDarkMode: false,
  prefersReducedMotion: false
}

// 컨텍스트 생성
const ResponsiveContext = createContext<ResponsiveState>(initialState)

// Breakpoint 계산 함수
function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.wide) return 'wide'
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}

// 디바이스 타입 계산 함수
function getDeviceType(width: number): DeviceType {
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}

// 터치 디바이스 감지
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 고해상도 디스플레이 감지
function detectHighDPI(): boolean {
  if (typeof window === 'undefined') return false
  return window.devicePixelRatio > 1
}

// 미디어 쿼리 감지
function detectMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

// Provider Props
interface ResponsiveProviderProps {
  children: ReactNode
  // 테스트용 초기값 override
  initialWidth?: number
  initialHeight?: number
}

// ResponsiveProvider 컴포넌트
export function ResponsiveProvider({ 
  children, 
  initialWidth, 
  initialHeight 
}: ResponsiveProviderProps) {
  const [state, setState] = useState<ResponsiveState>(() => {
    // SSR 안전을 위한 초기값 설정
    if (typeof window === 'undefined') {
      return {
        ...initialState,
        width: initialWidth || 375, // 모바일 기본값
        height: initialHeight || 667
      }
    }

    const width = initialWidth || window.innerWidth
    const height = initialHeight || window.innerHeight
    const breakpoint = getBreakpoint(width)
    const deviceType = getDeviceType(width)

    return {
      breakpoint,
      deviceType,
      width,
      height,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
      isWide: breakpoint === 'wide',
      isLandscape: width > height,
      isPortrait: width <= height,
      isTouchDevice: detectTouchDevice(),
      isHighDPI: detectHighDPI(),
      prefersDarkMode: detectMediaQuery('(prefers-color-scheme: dark)'),
      prefersReducedMotion: detectMediaQuery('(prefers-reduced-motion: reduce)')
    }
  })

  // 화면 크기 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      // 디바운스를 통한 성능 최적화
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        const breakpoint = getBreakpoint(width)
        const deviceType = getDeviceType(width)

        setState(prevState => ({
          ...prevState,
          breakpoint,
          deviceType,
          width,
          height,
          isMobile: breakpoint === 'mobile',
          isTablet: breakpoint === 'tablet',
          isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
          isWide: breakpoint === 'wide',
          isLandscape: width > height,
          isPortrait: width <= height
        }))
      }, 100) // 100ms 디바운스
    }

    // 미디어 쿼리 변경 감지
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setState(prevState => ({
        ...prevState,
        prefersDarkMode: e.matches
      }))
    }

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setState(prevState => ({
        ...prevState,
        prefersReducedMotion: e.matches
      }))
    }

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize)
    darkModeQuery.addEventListener('change', handleDarkModeChange)
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

    // 초기 실행
    handleResize()

    // 클린업
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      darkModeQuery.removeEventListener('change', handleDarkModeChange)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  )
}

// 커스텀 훅
export function useResponsive(): ResponsiveState {
  const context = useContext(ResponsiveContext)
  
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider')
  }
  
  return context
}

// 편의 훅들
export function useBreakpoint(): Breakpoint {
  return useResponsive().breakpoint
}

export function useDeviceType(): DeviceType {
  return useResponsive().deviceType
}

export function useIsMobile(): boolean {
  return useResponsive().isMobile
}

export function useIsTablet(): boolean {
  return useResponsive().isTablet
}

export function useIsDesktop(): boolean {
  return useResponsive().isDesktop
}

// 타입 가드 함수들
export function isMobileBreakpoint(breakpoint: Breakpoint): boolean {
  return breakpoint === 'mobile'
}

export function isTabletBreakpoint(breakpoint: Breakpoint): boolean {
  return breakpoint === 'tablet'
}

export function isDesktopBreakpoint(breakpoint: Breakpoint): boolean {
  return breakpoint === 'desktop' || breakpoint === 'wide'
}

// 디바이스별 조건부 렌더링 헬퍼
export function renderOnMobile(children: ReactNode): ReactNode {
  const { isMobile } = useResponsive()
  return isMobile ? children : null
}

export function renderOnTablet(children: ReactNode): ReactNode {
  const { isTablet } = useResponsive()
  return isTablet ? children : null
}

export function renderOnDesktop(children: ReactNode): ReactNode {
  const { isDesktop } = useResponsive()
  return isDesktop ? children : null
}

export default ResponsiveContext