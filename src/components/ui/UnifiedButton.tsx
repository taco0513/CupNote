/**
 * Unified Button Component - Enhanced with Global Design Tokens
 * 새로운 글로벌 디자인 토큰 시스템을 활용한 일관된 버튼 컴포넌트
 */
'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'filter-active' | 'filter-inactive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  loading?: boolean
  fullWidth?: boolean
  ripple?: boolean
}

export default function UnifiedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  ripple = false,
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
      default:
        return 'btn-primary'
    }
  }

  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'btn-xs'
      case 'sm':
        return 'btn-sm'
      case 'md':
        return 'btn-md'
      case 'lg':
        return 'btn-lg'
      case 'xl':
        return 'btn-xl'
      case 'icon':
        return 'btn-sm p-3 aspect-square'
      default:
        return 'btn-md'
    }
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const rippleClass = ripple ? 'button-ripple' : ''
  const dangerStyle = variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''

  return (
    <button
      className={`
        btn-base
        ${getVariantClass()}
        ${getSizeClass()}
        ${widthStyle}
        ${rippleClass}
        ${dangerStyle}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className={variant === 'primary' || variant === 'filter-active' ? 'text-on-dark' : 'text-high-contrast'}>
            로딩 중...
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}