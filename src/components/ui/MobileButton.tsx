/**
 * MobileButton - 모바일 최적화 버튼 컴포넌트
 * 44px+ 터치 타겟, 햅틱 피드백 스타일, 접근성 완벽 지원
 */
'use client'

import { ReactNode, forwardRef, ButtonHTMLAttributes, TouchEvent, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  hapticFeedback?: boolean
  rounded?: 'md' | 'lg' | 'xl' | 'full'
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  hapticFeedback = true,
  rounded = 'lg',
  className,
  disabled,
  onTouchStart,
  onTouchEnd,
  onClick,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    if (hapticFeedback && !disabled && !loading) {
      setIsPressed(true)
      // Haptic feedback for supporting devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10) // Very light haptic
      }
    }
    onTouchStart?.(e)
  }

  const handleTouchEnd = (e: TouchEvent<HTMLButtonElement>) => {
    if (hapticFeedback && !disabled && !loading) {
      setIsPressed(false)
    }
    onTouchEnd?.(e)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      // Medium haptic feedback for actions
      if ('vibrate' in navigator && hapticFeedback) {
        navigator.vibrate(20)
      }
      onClick?.(e)
    }
  }

  const baseStyles = cn(
    // Base button styles - mobile optimized
    'relative inline-flex items-center justify-center font-medium',
    'touch-manipulation select-none transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    
    // Size variants - all meet 44px minimum touch target
    {
      // Small - 44px height (iOS minimum)
      'min-h-[44px] px-3 py-2 text-sm gap-2': size === 'sm',
      
      // Medium - 48px height (Android recommended)  
      'min-h-[48px] px-4 py-3 text-base gap-2': size === 'md',
      
      // Large - 52px height (comfortable)
      'min-h-[52px] px-6 py-3 text-lg gap-3': size === 'lg',
      
      // Extra Large - 56px height (spacious)
      'min-h-[56px] px-8 py-4 text-xl gap-3': size === 'xl',
      
      // Icon only - square aspect ratio
      'min-h-[44px] min-w-[44px] p-0': size === 'icon',
    },
    
    // Width variants
    {
      'w-full': fullWidth,
      'w-auto': !fullWidth,
    },
    
    // Rounded corners
    {
      'rounded-lg': rounded === 'md',    // 8px
      'rounded-xl': rounded === 'lg',    // 12px
      'rounded-2xl': rounded === 'xl',   // 16px
      'rounded-full': rounded === 'full', // Fully rounded
    },
    
    // Visual variants
    {
      // Primary - coffee theme main action
      'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-md': 
        variant === 'primary',
      'hover:from-coffee-600 hover:to-coffee-700 hover:shadow-lg': 
        variant === 'primary' && !disabled && !loading,
      'active:from-coffee-700 active:to-coffee-800 active:shadow-sm': 
        variant === 'primary' && !disabled && !loading,
      
      // Secondary - subtle action
      'bg-white/95 text-coffee-700 border-2 border-coffee-200/50 shadow-sm': 
        variant === 'secondary',
      'hover:bg-white hover:border-coffee-300/60 hover:shadow-md': 
        variant === 'secondary' && !disabled && !loading,
      'active:bg-coffee-50/80 active:border-coffee-400/70': 
        variant === 'secondary' && !disabled && !loading,
      
      // Outline - clear boundaries
      'bg-transparent text-coffee-600 border-2 border-coffee-400/60': 
        variant === 'outline',
      'hover:bg-coffee-50/80 hover:text-coffee-700 hover:border-coffee-500/80': 
        variant === 'outline' && !disabled && !loading,
      'active:bg-coffee-100/80 active:text-coffee-800': 
        variant === 'outline' && !disabled && !loading,
      
      // Ghost - minimal presence
      'bg-transparent text-coffee-600': variant === 'ghost',
      'hover:bg-coffee-50/80 hover:text-coffee-700': 
        variant === 'ghost' && !disabled && !loading,
      'active:bg-coffee-100/80 active:text-coffee-800': 
        variant === 'ghost' && !disabled && !loading,
      
      // Danger - destructive actions
      'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md': 
        variant === 'danger',
      'hover:from-red-600 hover:to-red-700 hover:shadow-lg': 
        variant === 'danger' && !disabled && !loading,
      'active:from-red-700 active:to-red-800 active:shadow-sm': 
        variant === 'danger' && !disabled && !loading,
      
      // Success - positive actions
      'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md': 
        variant === 'success',
      'hover:from-green-600 hover:to-green-700 hover:shadow-lg': 
        variant === 'success' && !disabled && !loading,
      'active:from-green-700 active:to-green-800 active:shadow-sm': 
        variant === 'success' && !disabled && !loading,
    },
    
    // Haptic feedback visual states
    {
      'transform transition-transform': hapticFeedback,
      'scale-[0.96]': isPressed && hapticFeedback && !disabled && !loading,
      'hover:scale-[1.02]': hapticFeedback && !disabled && !loading,
    }
  )

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {size !== 'icon' && (
            <span className="ml-2">로딩 중...</span>
          )}
        </>
      )
    }

    if (size === 'icon') {
      return icon || children
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span className="leading-none">{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </>
    )
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, className)}
      disabled={disabled || loading}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </button>
  )
})

MobileButton.displayName = 'MobileButton'

// Button group component - mobile optimized spacing
export const MobileButtonGroup = ({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  className,
  ...props
}: {
  children: ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'tight' | 'normal' | 'relaxed'
  className?: string
} & HTMLAttributes<HTMLDivElement>) => {
  const groupStyles = cn(
    'flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
    },
    {
      'gap-2': spacing === 'tight',     // 8px
      'gap-3': spacing === 'normal',    // 12px  
      'gap-4': spacing === 'relaxed',   // 16px
    },
    className
  )

  return (
    <div className={groupStyles} role="group" {...props}>
      {children}  
    </div>
  )
}

// Floating Action Button - mobile pattern
export const MobileFloatingButton = forwardRef<HTMLButtonElement, 
  Omit<MobileButtonProps, 'size' | 'variant' | 'fullWidth'> & {
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  }
>(({
  position = 'bottom-right',
  className,
  ...props
}, ref) => {
  const positionStyles = cn(
    'fixed z-50 shadow-xl',
    {
      'bottom-20 right-4': position === 'bottom-right',
      'bottom-20 left-4': position === 'bottom-left', 
      'bottom-20 left-1/2 -translate-x-1/2': position === 'bottom-center',
    }
  )

  return (
    <MobileButton
      ref={ref}
      variant="primary"
      size="lg"
      rounded="full"
      className={cn(positionStyles, className)}
      {...props}
    />
  )
})

MobileFloatingButton.displayName = 'MobileFloatingButton'

export default MobileButton

// Utility hook for button states
export const useMobileButtonState = () => {
  const [isPressed, setIsPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePress = () => setIsPressed(true)
  const handleRelease = () => setIsPressed(false)
  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return {
    isPressed,
    isLoading,
    handlePress,
    handleRelease,
    startLoading,
    stopLoading,
  }
}