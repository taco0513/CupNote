'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const inputVariants = cva(
  // 기본 스타일
  "flex w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-secondary focus-visible:border-primary",
        success: "border-success focus-visible:border-success focus-visible:ring-success",
        error: "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
        warning: "border-warning focus-visible:border-warning focus-visible:ring-warning"
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3",
        lg: "h-12 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  successMessage?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size,
    type,
    label,
    helperText,
    errorMessage,
    successMessage,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // 상태에 따른 variant 결정
    const currentVariant = errorMessage ? 'error' 
      : successMessage ? 'success'
      : variant

    // 실제 input type 결정
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type

    // 고유 ID 생성
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {/* 라벨 */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}

        {/* 입력 필드 컨테이너 */}
        <div className="relative">
          {/* 왼쪽 아이콘 */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted">
              {leftIcon}
            </div>
          )}

          {/* 입력 필드 */}
          <input
            type={inputType}
            className={inputVariants({ 
              variant: currentVariant, 
              size, 
              className: `
                ${leftIcon ? 'pl-10' : ''}
                ${(rightIcon || showPasswordToggle || errorMessage || successMessage) ? 'pr-10' : ''}
                ${className}
              `
            })}
            ref={ref}
            id={inputId}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* 오른쪽 아이콘 영역 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* 상태 아이콘 */}
            {errorMessage && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {successMessage && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}

            {/* 패스워드 토글 */}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-foreground-muted hover:text-foreground transition-colors"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}

            {/* 커스텀 오른쪽 아이콘 */}
            {rightIcon && !errorMessage && !successMessage && (
              <div className="text-foreground-muted">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {/* 도움말 및 에러 메시지 */}
        {(helperText || errorMessage || successMessage) && (
          <div className="mt-2 text-sm">
            {errorMessage && (
              <p className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errorMessage}
              </p>
            )}
            {successMessage && !errorMessage && (
              <p className="text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {successMessage}
              </p>
            )}
            {helperText && !errorMessage && !successMessage && (
              <p className="text-foreground-muted">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }

// 특별한 용도의 Input 컴포넌트들

// 검색 입력
export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'leftIcon'>>(
  ({ placeholder = "검색...", ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      placeholder={placeholder}
      leftIcon={<div className="h-4 w-4">🔍</div>}
      {...props}
    />
  )
)

// 이메일 입력
export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ ...props }, ref) => (
    <Input
      ref={ref}
      type="email"
      autoComplete="email"
      {...props}
    />
  )
)

// 패스워드 입력
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'showPasswordToggle'>>(
  ({ ...props }, ref) => (
    <Input
      ref={ref}
      type="password"
      showPasswordToggle
      autoComplete="current-password"
      {...props}
    />
  )
)

// 숫자 입력
export const NumberInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'> & { min?: number; max?: number; step?: number }>(
  ({ min, max, step = 1, ...props }, ref) => (
    <Input
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step}
      {...props}
    />
  )
)