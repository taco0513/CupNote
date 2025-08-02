'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  // 기본 스타일
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        // 기본 버튼 (Primary)
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md",
        
        // 보조 버튼 (Secondary)
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border",
        
        // 강조 버튼 (Accent)
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm hover:shadow-md",
        
        // 위험 버튼 (Destructive)
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm",
        
        // 성공 버튼
        success: "bg-success text-success-foreground hover:bg-success-hover shadow-sm",
        
        // 경고 버튼
        warning: "bg-warning text-warning-foreground hover:bg-warning-hover shadow-sm",
        
        // 투명 버튼 (Ghost)
        ghost: "hover:bg-secondary text-foreground",
        
        // 외곽선 버튼 (Outline)
        outline: "border border-border text-foreground hover:bg-secondary hover:text-foreground",
        
        // 링크 스타일
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
        icon: "h-10 w-10"
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={buttonVariants({ variant, size, fullWidth, className })}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }

// 특별한 용도의 버튼 컴포넌트들
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'> & { icon: ReactNode; 'aria-label': string }>(
  ({ icon, ...props }, ref) => (
    <Button ref={ref} size="icon" {...props}>
      {icon}
    </Button>
  )
)

export const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, children, ...props }, ref) => (
    <Button ref={ref} loading={loading} {...props}>
      {children}
    </Button>
  )
)

// Purple Accent 테마 특별 버튼 (구 Coffee 버튼)
export const CoffeeButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Button 
      ref={ref} 
      variant="default"
      className={`bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl ${className}`}
      {...props} 
    />
  )
)