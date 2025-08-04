/**
 * 반응형 디자인 시스템 유틸리티
 * Breakpoint 관리 및 디바이스 감지
 */

// Breakpoint 정의 (px)
export const BREAKPOINTS = {
  xs: 375,      // Small mobile (iPhone SE)
  sm: 640,      // Large mobile
  md: 768,      // Tablet portrait
  lg: 1024,     // Tablet landscape / Small desktop
  xl: 1280,     // Desktop
  '2xl': 1536,  // Large desktop
  '3xl': 1920,  // Full HD desktop
} as const

// 디바이스 타입
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 화면 크기에 따른 디바이스 타입 반환
export const getDeviceType = (width: number): DeviceType => {
  if (width < BREAKPOINTS.md) return 'mobile'
  if (width < BREAKPOINTS.lg) return 'tablet'
  return 'desktop'
}

// 반응형 크기 변형
export const ResponsiveSizes = {
  // 버튼 크기
  button: {
    mobile: {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-base',
      xl: 'px-6 py-3.5 text-lg',
    },
    tablet: {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-lg',
    },
    desktop: {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
      xl: 'px-10 py-4 text-xl',
    }
  },
  
  // 텍스트 크기
  text: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl',
    body: 'text-sm sm:text-base md:text-base lg:text-lg',
    small: 'text-xs sm:text-sm md:text-sm',
  },
  
  // 패딩
  padding: {
    page: {
      mobile: 'px-4 py-4',
      tablet: 'px-6 py-6',
      desktop: 'px-8 py-8',
    },
    card: {
      mobile: 'p-4',
      tablet: 'p-6',
      desktop: 'p-8',
    },
    section: {
      mobile: 'py-8',
      tablet: 'py-12',
      desktop: 'py-16',
    }
  },
  
  // 갭
  gap: {
    mobile: {
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
    tablet: {
      xs: 'gap-3',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
    desktop: {
      xs: 'gap-4',
      sm: 'gap-6',
      md: 'gap-8',
      lg: 'gap-12',
    }
  },
  
  // 그리드 컬럼
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3',
  },
  
  // 최대 너비
  maxWidth: {
    mobile: 'max-w-full',
    tablet: 'max-w-3xl',
    desktop: 'max-w-7xl',
  }
}

// Tailwind 클래스 조합 헬퍼
export const getResponsiveClass = (
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string => {
  const classes = [base]
  if (sm) classes.push(`sm:${sm}`)
  if (md) classes.push(`md:${md}`)
  if (lg) classes.push(`lg:${lg}`)
  if (xl) classes.push(`xl:${xl}`)
  return classes.join(' ')
}

// 디바이스별 조건부 렌더링을 위한 클래스
export const DeviceClasses = {
  mobileOnly: 'block md:hidden',
  tabletOnly: 'hidden md:block lg:hidden',
  desktopOnly: 'hidden lg:block',
  mobileAndTablet: 'block lg:hidden',
  tabletAndDesktop: 'hidden md:block',
}

// 터치 디바이스 감지
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 현재 브레이크포인트 가져오기
export const getCurrentBreakpoint = (): string => {
  if (typeof window === 'undefined') return 'md'
  
  const width = window.innerWidth
  
  if (width < BREAKPOINTS.xs) return 'xs'
  if (width < BREAKPOINTS.sm) return 'sm'
  if (width < BREAKPOINTS.md) return 'md'
  if (width < BREAKPOINTS.lg) return 'lg'
  if (width < BREAKPOINTS.xl) return 'xl'
  if (width < BREAKPOINTS['2xl']) return '2xl'
  return '3xl'
}