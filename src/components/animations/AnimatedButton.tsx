/**
 * @document-ref MICRO_ANIMATIONS.md#button-feedback-animations
 * @design-ref DESIGN_SYSTEM.md#button-patterns
 * @compliance-check 2025-08-02 - 애니메이션 버튼 컴포넌트
 */
import React from 'react'

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coffee'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function AnimatedButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: AnimatedButtonProps) {

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-accent-warm text-white hover:bg-neutral-600',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    coffee: 'bg-gradient-to-br from-accent-warm to-neutral-600 text-white hover:from-neutral-600 hover:to-neutral-700'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const buttonClass = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  )
}