/**
 * Advanced Responsive Design Hook
 * Container Queries, Device Detection, Viewport Info
 * 2024-2025 Modern Approach
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Device categories based on 2024-2025 standards
export const DEVICE_SIZES = {
  // Mobile devices
  mobileSmall: { min: 0, max: 374, name: 'Mobile S' },      // Small phones
  mobileMedium: { min: 375, max: 429, name: 'Mobile M' },   // Standard phones
  mobileLarge: { min: 430, max: 639, name: 'Mobile L' },    // Large phones
  
  // Tablets
  tabletSmall: { min: 640, max: 767, name: 'Tablet S' },    // Small tablets
  tabletMedium: { min: 768, max: 1023, name: 'Tablet M' },   // iPads
  
  // Desktops
  desktopSmall: { min: 1024, max: 1279, name: 'Desktop S' }, // Small laptops
  desktopMedium: { min: 1280, max: 1535, name: 'Desktop M' }, // Standard desktop
  desktopLarge: { min: 1536, max: 1919, name: 'Desktop L' }, // Large monitors
  desktopXL: { min: 1920, max: Infinity, name: 'Desktop XL' } // 4K and up
} as const

// Modern breakpoints
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560  // 4K displays
} as const

interface ResponsiveState {
  // Basic info
  width: number
  height: number
  breakpoint: string
  deviceCategory: string
  
  // Advanced features
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  isTouchDevice: boolean
  isHighDensity: boolean
  isReducedMotion: boolean
  isDarkMode: boolean
  isHighContrast: boolean
  respectsUserFontSize: boolean
  
  // Container queries support
  supportsContainerQueries: boolean
  
  // Viewport units
  vh: number
  vw: number
  
  // Safe areas for mobile
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export function useResponsive() {
  const [state, setState] = useState<ResponsiveState>({
    width: 1024,
    height: 768,
    breakpoint: 'lg',
    deviceCategory: 'Desktop M',
    orientation: 'landscape',
    pixelRatio: 1,
    isTouchDevice: false,
    isHighDensity: false,
    isReducedMotion: false,
    isDarkMode: false,
    isHighContrast: false,
    respectsUserFontSize: false,
    supportsContainerQueries: false,
    vh: 0,
    vw: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  })

  const [isHydrated, setIsHydrated] = useState(false)

  // Determine current breakpoint
  const getCurrentBreakpoint = useCallback((width: number): string => {
    if (width < BREAKPOINTS.xs) return 'xs'
    if (width < BREAKPOINTS.sm) return 'sm'
    if (width < BREAKPOINTS.md) return 'md'
    if (width < BREAKPOINTS.lg) return 'lg'
    if (width < BREAKPOINTS.xl) return 'xl'
    if (width < BREAKPOINTS['2xl']) return '2xl'
    if (width < BREAKPOINTS['3xl']) return '3xl'
    return '4xl'
  }, [])

  // Determine device category
  const getDeviceCategory = useCallback((width: number): string => {
    for (const [_, config] of Object.entries(DEVICE_SIZES)) {
      if (width >= config.min && width <= config.max) {
        return config.name
      }
    }
    return 'Unknown'
  }, [])

  // Update state
  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    
    // Check for various features
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const pixelRatio = window.devicePixelRatio || 1
    const isHighDensity = pixelRatio > 1.5
    
    // Check user preferences
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    // Check if user has customized browser font size (indicates accessibility need)
    const baseFontSize = parseInt(getComputedStyle(document.documentElement).fontSize) || 16
    const respectsUserFontSize = baseFontSize !== 16
    
    // Check container queries support
    const supportsContainerQueries = CSS.supports('container-type: inline-size')
    
    // Calculate viewport units
    const vh = height * 0.01
    const vw = width * 0.01
    
    // Get safe area insets (for notched devices)
    const getSafeAreaInset = (position: string): number => {
      if (typeof getComputedStyle === 'undefined') return 0
      const value = getComputedStyle(document.documentElement).getPropertyValue(`--safe-area-inset-${position}`)
      return parseInt(value) || 0
    }
    
    setState({
      width,
      height,
      breakpoint: getCurrentBreakpoint(width),
      deviceCategory: getDeviceCategory(width),
      orientation: width > height ? 'landscape' : 'portrait',
      pixelRatio,
      isTouchDevice,
      isHighDensity,
      isReducedMotion,
      isDarkMode,
      isHighContrast,
      respectsUserFontSize,
      supportsContainerQueries,
      vh,
      vw,
      safeAreaInsets: {
        top: getSafeAreaInset('top'),
        bottom: getSafeAreaInset('bottom'),
        left: getSafeAreaInset('left'),
        right: getSafeAreaInset('right')
      }
    })
  }, [getCurrentBreakpoint, getDeviceCategory])

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true)
    
    // Initial update after hydration
    updateState()
    
    // Event listeners
    const handleResize = () => updateState()
    const handleOrientationChange = () => updateState()
    
    // Media query listeners
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleDarkModeChange = () => updateState()
    const handleMotionChange = () => updateState()
    const handleContrastChange = () => updateState()
    
    // Add listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    darkModeQuery.addEventListener('change', handleDarkModeChange)
    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      darkModeQuery.removeEventListener('change', handleDarkModeChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [updateState])

  // Utility functions
  const isMobile = useMemo(() => state.width < BREAKPOINTS.md, [state.width])
  const isTablet = useMemo(() => state.width >= BREAKPOINTS.md && state.width < BREAKPOINTS.lg, [state.width])
  const isDesktop = useMemo(() => state.width >= BREAKPOINTS.lg, [state.width])
  
  // Responsive value helper
  const responsiveValue = useCallback(<T,>(
    mobile: T,
    tablet?: T,
    desktop?: T
  ): T => {
    if (isDesktop && desktop !== undefined) return desktop
    if (isTablet && tablet !== undefined) return tablet
    return mobile
  }, [isDesktop, isTablet])

  // Container query helper
  const containerQuery = useCallback((
    containerWidth: number,
    values: { [key: number]: any }
  ) => {
    const sortedBreakpoints = Object.keys(values)
      .map(Number)
      .sort((a, b) => b - a)
    
    for (const breakpoint of sortedBreakpoints) {
      if (containerWidth >= breakpoint) {
        return values[breakpoint]
      }
    }
    
    return values[Math.min(...sortedBreakpoints)]
  }, [])

  return {
    ...state,
    isHydrated,
    isMobile,
    isTablet,
    isDesktop,
    responsiveValue,
    containerQuery,
    // Tailwind-compatible checks
    isXs: state.width < BREAKPOINTS.xs,
    isSm: state.width >= BREAKPOINTS.xs && state.width < BREAKPOINTS.sm,
    isMd: state.width >= BREAKPOINTS.sm && state.width < BREAKPOINTS.md,
    isLg: state.width >= BREAKPOINTS.md && state.width < BREAKPOINTS.lg,
    isXl: state.width >= BREAKPOINTS.lg && state.width < BREAKPOINTS.xl,
    is2xl: state.width >= BREAKPOINTS.xl && state.width < BREAKPOINTS['2xl'],
    is3xl: state.width >= BREAKPOINTS['2xl'] && state.width < BREAKPOINTS['3xl'],
    is4xl: state.width >= BREAKPOINTS['3xl']
  }
}