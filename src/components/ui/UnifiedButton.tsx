/**
 * Unified Button Component - Enhanced with Global Design Tokens
 * 새로운 글로벌 디자인 토큰 시스템을 활용한 일관된 버튼 컴포넌트
 */
'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'hero' // Simplified - hero is now a variant, not excessive options
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  subtle?: boolean // For subtle animations
}

export default function UnifiedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  subtle = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Use unified design token classes from globals.css
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary'
      case 'secondary':
        return 'btn-secondary'
      case 'filter-active':
        return 'filter-btn filter-btn-active'
      case 'filter-inactive':
        return 'filter-btn filter-btn-inactive'
      case 'outline':
        return 'btn-secondary border-2 border-coffee-400 bg-transparent hover:bg-coffee-50'
      case 'ghost':
        return 'bg-transparent text-coffee-600 hover:bg-coffee-50 hover:text-coffee-800'
      case 'danger':
        return 'btn-primary'
      case 'hero':
        // Hero maintains coffee DNA with responsive shadow
        return 'bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 text-white shadow-md sm:shadow-lg hover:shadow-xl'
      default:
        return 'btn-primary'
    }
  }

  const getSizeClass = () => {
    // Responsive size variations - mobile first approach
    switch (size) {
      case 'xs':
        return 'px-2.5 py-1 text-xs sm:px-3 sm:py-1.5'
      case 'sm':
        return 'px-3 py-1.5 text-sm sm:px-3.5 sm:py-2 md:px-4'
      case 'md':
        return 'px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base'
      case 'lg':
        return 'px-5 py-2.5 text-base sm:px-6 sm:py-3 md:px-8 md:text-lg'
      case 'xl':
        return 'px-6 py-3 text-lg sm:px-8 sm:py-4 md:px-10 md:text-xl'
      case 'icon':
        return 'p-2 sm:p-2.5 md:p-3 aspect-square'
      default:
        return 'px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base'
    }
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const dangerStyle = variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''
  const isHero = variant === 'hero'
  const subtleAnimation = subtle ? 'transform hover:scale-105 transition-all duration-200' : ''

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className={variant === 'primary' || variant === 'hero' ? 'text-white' : 'text-high-contrast'}>
            로딩 중...
          </span>
        </>
      )
    }

    // Consistent icon handling for all variants
    if (icon || isHero) {
      return (
        <div className="flex items-center justify-center space-x-2">
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </div>
      )
    }

    return children
  }

  return (
    <button
      className={`
        btn-base
        ${getVariantClass()}
        ${getSizeClass()}
        ${widthStyle}
        ${dangerStyle}
        ${subtleAnimation}
        ${isHero ? 'font-semibold rounded-xl' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  )
}