/**
 * MobileCard - 모바일 최적화 카드 컴포넌트
 * 터치 친화적 인터랙션과 접근성을 고려한 모바일 퍼스트 카드
 */
'use client'

import { ReactNode, forwardRef, HTMLAttributes, TouchEvent, useState } from 'react'
import { cn } from '../../utils/cn'

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'elevated' | 'outlined' | 'filled' | 'ghost'
  size?: 'compact' | 'comfortable' | 'spacious'
  interactive?: boolean
  pressable?: boolean
  loading?: boolean
  disabled?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(({
  children,
  variant = 'elevated',
  size = 'comfortable',
  interactive = false,
  pressable = false,
  loading = false,
  disabled = false,
  rounded = 'lg',
  shadow = 'md',
  className,
  onTouchStart,
  onTouchEnd,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (pressable && !disabled) {
      setIsPressed(true)
    }
    onTouchStart?.(e)
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (pressable && !disabled) {
      setIsPressed(false)
    }
    onTouchEnd?.(e)
  }

  const baseStyles = cn(
    // Base mobile card styles
    'relative overflow-hidden transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-500 focus-visible:ring-offset-2',
    
    // Size variants - mobile optimized spacing
    {
      'p-3': size === 'compact',     // 12px - tight spacing
      'p-4': size === 'comfortable', // 16px - standard spacing  
      'p-6': size === 'spacious',    // 24px - generous spacing
    },
    
    // Rounded corners - mobile friendly
    {
      'rounded-lg': rounded === 'sm',   // 8px
      'rounded-xl': rounded === 'md',   // 12px
      'rounded-2xl': rounded === 'lg',  // 16px
      'rounded-3xl': rounded === 'xl',  // 24px
    },
    
    // Visual variants
    {
      // Elevated - default mobile card
      'bg-white/95 backdrop-blur-sm border border-coffee-200/30': variant === 'elevated',
      
      // Outlined - clear boundaries
      'bg-white/90 backdrop-blur-sm border-2 border-coffee-300/50': variant === 'outlined',
      
      // Filled - prominent content
      'bg-coffee-50/80 backdrop-blur-sm border border-coffee-200/20': variant === 'filled',
      
      // Ghost - minimal presence
      'bg-white/50 backdrop-blur-sm border border-coffee-200/20': variant === 'ghost',
    },
    
    // Shadow system - mobile depth perception
    {
      'shadow-none': shadow === 'none',
      'shadow-sm': shadow === 'sm',     // Subtle elevation
      'shadow-md': shadow === 'md',     // Standard elevation
      'shadow-lg': shadow === 'lg',     // High elevation
    },
    
    // Interactive states
    {
      'cursor-pointer': interactive && !disabled,
      'hover:shadow-lg hover:scale-[1.01] hover:bg-white': 
        interactive && !disabled && !loading,
      'active:scale-[0.99]': interactive && !disabled && !loading,
    },
    
    // Pressable feedback - native app feel
    {
      'transform transition-transform': pressable,
      'scale-[0.98]': isPressed && pressable && !disabled,
    },
    
    // Loading state
    {
      'animate-pulse': loading,
      'pointer-events-none': loading,
    },
    
    // Disabled state
    {
      'opacity-50 cursor-not-allowed pointer-events-none': disabled,
    }
  )

  return (
    <div
      ref={ref}
      className={cn(baseStyles, className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {loading ? (
        <MobileCardSkeleton size={size} />
      ) : (
        children
      )}
    </div>
  )
})

MobileCard.displayName = 'MobileCard'

// Mobile-optimized card skeleton
const MobileCardSkeleton = ({ size }: { size: 'compact' | 'comfortable' | 'spacious' }) => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-10 h-10 bg-coffee-200/50 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-coffee-200/50 rounded mb-1" />
        <div className="h-3 bg-coffee-200/50 rounded w-2/3" />
      </div>
    </div>
    {size !== 'compact' && (
      <div className="space-y-2">
        <div className="h-3 bg-coffee-200/50 rounded" />
        <div className="h-3 bg-coffee-200/50 rounded w-3/4" />
      </div>
    )}
  </div>
)

// Card composition components - mobile optimized
export const MobileCardHeader = ({ 
  children, 
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn('mb-4 pb-3 border-b border-coffee-100/50', className)}
    {...props}
  >
    {children}
  </div>
)

export const MobileCardTitle = ({ 
  children, 
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>) => (
  <h3 
    className={cn('text-lg font-semibold text-coffee-800 leading-tight', className)}
    {...props}
  >
    {children}
  </h3>
)

export const MobileCardDescription = ({ 
  children, 
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLParagraphElement>) => (
  <p 
    className={cn('text-sm text-coffee-600 leading-relaxed mt-1', className)}
    {...props}
  >
    {children}
  </p>
)

export const MobileCardContent = ({ 
  children, 
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
)

export const MobileCardFooter = ({ 
  children, 
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn('mt-4 pt-3 border-t border-coffee-100/50 flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </div>
)

// Action card variant - for touchable cards
export const MobileActionCard = forwardRef<HTMLButtonElement, {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
} & Omit<MobileCardProps, 'interactive' | 'pressable'>>(({
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  ...cardProps
}, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      'w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-500 focus-visible:ring-offset-2',
      className
    )}
  >
    <MobileCard
      interactive
      pressable
      disabled={disabled}
      loading={loading}
      {...cardProps}
    >
      {children}
    </MobileCard>
  </button>
))

MobileActionCard.displayName = 'MobileActionCard'

export default MobileCard