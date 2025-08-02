/**
 * Unified Badge Component
 * 상태나 카테고리 표시에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = ''
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-accent-warm/10 text-accent-warm',
    success: 'bg-accent-warm/10 text-accent-warm',
    warning: 'bg-neutral-200 text-neutral-800',
    danger: 'bg-neutral-300 text-neutral-900',
    info: 'bg-neutral-100 text-neutral-600'
  }

  const sizeStyles = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}