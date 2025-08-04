/**
 * Fluid Container Component
 * Modern responsive container with container queries
 * 2024-2025 Best Practices
 */
'use client'

import { ReactNode, CSSProperties } from 'react'
import { useResponsive } from '../../hooks/useResponsive'

interface FluidContainerProps {
  children: ReactNode
  as?: 'div' | 'section' | 'article' | 'main' | 'aside'
  className?: string
  
  // Container query support
  containerName?: string
  enableContainerQuery?: boolean
  
  // Fluid sizing - 확장된 옵션
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full' | 'prose' | 'custom'
  customMaxWidth?: string // maxWidth='custom'일 때 사용
  padding?: 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '3xl' | '4xl' | 'fluid' | 'custom'
  customPadding?: string // padding='custom'일 때 사용
  
  // Layout
  center?: boolean
  fullHeight?: boolean
  
  // Advanced features
  safeArea?: boolean // Respect mobile safe areas
  foldable?: boolean // Support foldable devices
}

export default function FluidContainer({
  children,
  as: Component = 'div',
  className = '',
  containerName,
  enableContainerQuery = false,
  maxWidth = 'xl',
  customMaxWidth,
  padding = 'md',
  customPadding,
  center = true,
  fullHeight = false,
  safeArea = false,
  foldable = false
}: FluidContainerProps) {
  const { isMobile, isTablet, safeAreaInsets, supportsContainerQueries, isHydrated } = useResponsive()
  
  // Expanded max width classes
  const maxWidthClasses = {
    xs: 'max-w-lg',
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1536px]',
    '3xl': 'max-w-[1920px]',
    '4xl': 'max-w-[2560px]',
    full: 'max-w-full',
    prose: 'max-w-prose',
    custom: '' // 커스텀은 인라인 스타일로 처리
  }
  
  // Expanded padding classes with fluid option
  const paddingClasses = {
    none: '',
    '2xs': 'fluid-p-2xs',
    xs: 'fluid-p-xs',
    sm: 'fluid-p-sm',
    md: 'fluid-p-md',
    lg: 'fluid-p-lg',
    xl: 'fluid-p-xl',
    '3xl': 'fluid-p-3xl',
    '4xl': 'fluid-p-4xl',
    fluid: 'fluid-padding-inline', // Uses CSS custom properties
    custom: '' // 커스텀은 인라인 스타일로 처리
  }
  
  // Container query styles - only after hydration
  const containerStyles: CSSProperties = enableContainerQuery && isHydrated && supportsContainerQueries
    ? {
        containerType: 'inline-size',
        containerName: containerName || undefined
      }
    : {}
  
  // Safe area padding for mobile devices - only after hydration
  const safeAreaStyles: CSSProperties = safeArea && isHydrated && isMobile
    ? {
        paddingTop: `max(1rem, ${safeAreaInsets.top}px)`,
        paddingBottom: `max(1rem, ${safeAreaInsets.bottom}px)`,
        paddingLeft: `max(1rem, ${safeAreaInsets.left}px)`,
        paddingRight: `max(1rem, ${safeAreaInsets.right}px)`
      }
    : {}
  
  // Custom styles for maxWidth and padding when 'custom' is selected
  const customMaxWidthStyle: CSSProperties = maxWidth === 'custom' && customMaxWidth
    ? { maxWidth: customMaxWidth }
    : {}
  
  const customPaddingStyle: CSSProperties = padding === 'custom' && customPadding
    ? { padding: customPadding }
    : {}
  
  // Combine all classes
  const combinedClassName = [
    // Base classes
    'w-full',
    
    // Max width
    maxWidthClasses[maxWidth],
    
    // Padding
    paddingClasses[padding],
    
    // Center
    center && 'mx-auto',
    
    // Full height
    fullHeight && 'min-h-screen',
    
    // Container query support
    enableContainerQuery && 'supports-container-queries',
    
    // Foldable device support
    foldable && 'foldable-layout',
    
    // Custom classes
    className
  ].filter(Boolean).join(' ')
  
  return (
    <Component
      className={combinedClassName}
      style={{
        ...containerStyles,
        ...safeAreaStyles,
        ...customMaxWidthStyle,
        ...customPaddingStyle
      }}
    >
      {children}
    </Component>
  )
}