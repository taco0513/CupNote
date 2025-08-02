/**
 * Unified Button Component
 * 모든 버튼에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large' | 'icon'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-accent-warm text-white hover:bg-accent-warm/90',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
    outline: 'bg-transparent border-2 border-accent-warm text-accent-warm hover:bg-accent-warm/10',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
    icon: 'p-2'
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const disabledStyle = disabled || loading ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-warm focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyle}
        ${disabledStyle}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          로딩 중...
        </>
      ) : (
        children
      )}
    </button>
  )
}