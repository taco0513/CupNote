/**
 * Unified Card Component
 * 모든 카드 형태의 UI에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost'
  padding?: 'none' | 'small' | 'medium' | 'large'
  onClick?: () => void
  hover?: boolean
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  onClick,
  hover = false
}: CardProps) {
  const variantStyles = {
    default: 'bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-sm',
    bordered: 'bg-white/80 backdrop-blur-sm border-2 border-coffee-300/50 shadow-sm',
    elevated: 'bg-white/90 backdrop-blur-sm shadow-lg border border-coffee-200/20',
    ghost: 'bg-white/50 backdrop-blur-sm border border-coffee-200/30'
  }

  const paddingStyles = {
    none: '',
    small: 'p-3',
    medium: 'p-4 md:p-6',
    large: 'p-6 md:p-8'
  }

  const hoverStyles = hover || onClick ? 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:bg-white/95 cursor-pointer group' : ''

  return (
    <div
      className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`pb-4 border-b border-coffee-100/50 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-coffee-800 ${className}`}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-neutral-600 mt-1 ${className}`}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`pt-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`pt-4 mt-4 border-t border-neutral-100 ${className}`}>
      {children}
    </div>
  )
}