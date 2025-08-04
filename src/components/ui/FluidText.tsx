/**
 * Fluid Typography Component
 * Responsive text with clamp() and container queries
 * 2024-2025 Modern Approach
 */
'use client'

import { ReactNode, CSSProperties, useMemo } from 'react'
import { useResponsive } from '../../hooks/useResponsive'

interface FluidTextProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  
  // Size presets with fluid scaling
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'hero' | 'display'
  
  // Weight
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  
  // Color - 더 유연한 옵션 + 커스텀 지원
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'inherit' | 'custom'
  customColor?: string // color='custom'일 때 사용
  
  // Alignment
  align?: 'left' | 'center' | 'right' | 'justify'
  
  // Line height - 'loose' 복원 + 커스텀 지원
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose' | 'custom'
  customLineHeight?: string | number // lineHeight='custom'일 때 사용
  
  // Advanced
  responsive?: boolean // Enable fluid typography
  clamp?: [string, string, string] // Custom clamp values [min, preferred, max]
  truncate?: boolean
  balance?: boolean // text-wrap: balance for better line breaks
  
  className?: string
}

export default function FluidText({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  customColor,
  align = 'left',
  lineHeight = 'normal',
  customLineHeight,
  responsive = true,
  clamp,
  truncate = false,
  balance = false,
  className = ''
}: FluidTextProps) {
  const { isHighDensity, isReducedMotion, isHighContrast, respectsUserFontSize, isHydrated } = useResponsive()
  
  // Fluid size classes with clamp
  const sizeClasses = responsive ? {
    xs: 'fluid-text-xs',
    sm: 'fluid-text-sm',
    base: 'fluid-text-base',
    lg: 'fluid-text-lg',
    xl: 'fluid-text-xl',
    '2xl': 'fluid-text-2xl',
    '3xl': 'fluid-text-3xl',
    '4xl': 'fluid-text-4xl',
    '5xl': 'fluid-text-5xl',
    hero: 'text-[clamp(2.5rem,5vw,5rem)]',
    display: 'text-[clamp(3rem,7vw,8rem)]'
  } : {
    // Fallback to regular Tailwind classes
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    hero: 'text-5xl md:text-6xl lg:text-7xl',
    display: 'text-6xl md:text-7xl lg:text-8xl'
  }
  
  // Weight classes
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  }
  
  // Color classes - 확장된 옵션
  const colorClasses = {
    primary: 'text-coffee-800',
    secondary: 'text-coffee-600',
    muted: 'text-coffee-500',
    accent: 'text-amber-600',
    inherit: 'text-inherit',
    custom: '' // 커스텀 색상은 인라인 스타일로 처리
  }
  
  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }
  
  // Line height classes - 복원 및 확장
  const lineHeightClasses = useMemo(() => responsive ? {
    tight: 'leading-[var(--fluid-leading-tight)]',
    normal: 'leading-[var(--fluid-leading-normal)]',
    relaxed: 'leading-[var(--fluid-leading-relaxed)]',
    loose: 'leading-[var(--fluid-leading-loose)]', // 복원
    custom: '' // 커스텀은 인라인 스타일로 처리
  } : {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose', // 복원
    custom: '' // 커스텀은 인라인 스타일로 처리
  }, [responsive])
  
  // Custom clamp styles
  const customStyles: CSSProperties = clamp
    ? {
        fontSize: `clamp(${clamp[0]}, ${clamp[1]}, ${clamp[2]})`
      }
    : {}
  
  // Font smoothing for high DPI screens - only after hydration
  const smoothingStyles: CSSProperties = isHydrated && isHighDensity
    ? {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }
    : {}
  
  // Enhanced styles with custom support - optimized with useMemo
  const enhancedStyles: CSSProperties = useMemo(() => {
    const styles: CSSProperties = {}
    
    // Custom color support
    if (color === 'custom' && customColor) {
      styles.color = customColor
    }
    
    // Custom line height support
    if (lineHeight === 'custom' && customLineHeight) {
      styles.lineHeight = typeof customLineHeight === 'number' 
        ? customLineHeight 
        : customLineHeight
    }
    
    // Accessibility font size scaling
    if (isHydrated && respectsUserFontSize && !clamp) {
      const baseFontSize = parseInt(getComputedStyle(document.documentElement).fontSize) || 16
      const scale = baseFontSize / 16
      
      if (scale !== 1) {
        styles.fontSize = `calc(var(--fluid-text-${size}) * ${scale})`
      }
    }
    
    return styles
  }, [color, customColor, lineHeight, customLineHeight, isHydrated, respectsUserFontSize, clamp, size])

  // Combine classes - optimized with useMemo for performance
  const combinedClassName = useMemo(() => [
    // Size
    sizeClasses[size],
    
    // Weight
    weightClasses[weight],
    
    // Color (adjust for high contrast)
    isHydrated && isHighContrast ? 'text-[CanvasText]' : colorClasses[color],
    
    // Alignment
    alignClasses[align],
    
    // Line height
    lineHeightClasses[lineHeight],
    
    // Truncate
    truncate && 'truncate',
    
    // Balance (modern text wrapping)
    balance && 'text-balance',
    
    // Smooth transitions (unless reduced motion) - only after hydration
    isHydrated && !isReducedMotion && 'fluid-transition-fast',
    
    // High contrast mode
    isHydrated && isHighContrast && 'fluid-high-contrast',
    
    // Custom classes
    className
  ].filter(Boolean).join(' '), [
    size, weight, color, align, lineHeight, truncate, balance, 
    isHydrated, isHighContrast, isReducedMotion, className
  ])
  
  return (
    <Component
      className={combinedClassName}
      style={{
        ...customStyles,
        ...smoothingStyles,
        ...enhancedStyles
      }}
    >
      {children}
    </Component>
  )
}