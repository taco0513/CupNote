/**
 * MobileInput - 모바일 최적화 입력 컴포넌트
 * 48px+ 터치 타겟, 네이티브 키보드 최적화, 접근성 완벽 지원
 */
'use client'

import { ReactNode, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface MobileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  success?: string
  size?: 'md' | 'lg'
  variant?: 'outlined' | 'filled' | 'underlined'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  clearable?: boolean
  showPasswordToggle?: boolean
  floating?: boolean
  required?: boolean
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  label,
  hint,
  error,
  success,
  size = 'md',
  variant = 'outlined',
  leftIcon,
  rightIcon,
  clearable = false,
  showPasswordToggle = false,  
  floating = false,
  required = false,
  className,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(value || '')
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const currentValue = value !== undefined ? value : internalValue
  const hasValue = Boolean(currentValue && String(currentValue).length > 0)
  const hasError = Boolean(error)
  const hasSuccess = Boolean(success) && !hasError
  const isPassword = type === 'password' || showPasswordToggle
  const actualType = isPassword && showPassword ? 'text' : type

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const handleClear = () => {
    const input = inputRef.current || (ref as React.RefObject<HTMLInputElement>)?.current
    if (input) {
      const event = new Event('input', { bubbles: true })
      input.value = ''
      input.dispatchEvent(event)
      
      if (value === undefined) {
        setInternalValue('')
      }
      
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: input,
      } as React.ChangeEvent<HTMLInputElement>
      
      onChange?.(syntheticEvent)
      input.focus()
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Container styles based on variant
  const containerStyles = cn(
    'relative flex flex-col',
    {
      'mb-1': !hint && !error && !success,
      'mb-6': hint || error || success,
    }
  )

  // Input wrapper styles
  const wrapperStyles = cn(
    'relative flex items-center overflow-hidden transition-all duration-200',
    
    // Size styles - mobile touch friendly
    {
      'min-h-[48px]': size === 'md',   // Android recommended
      'min-h-[52px]': size === 'lg',   // Comfortable
    },
    
    // Variant styles
    {
      // Outlined - clear boundaries
      'rounded-xl border-2 bg-white/95': variant === 'outlined',
      'border-coffee-200/50': variant === 'outlined' && !isFocused && !hasError && !hasSuccess,
      'border-coffee-500': variant === 'outlined' && isFocused && !hasError && !hasSuccess,
      'border-red-400': variant === 'outlined' && hasError,
      'border-green-400': variant === 'outlined' && hasSuccess,
      
      // Filled - prominent background
      'rounded-xl border border-transparent bg-coffee-50/80': variant === 'filled',
      'ring-2 ring-coffee-500 ring-offset-1': variant === 'filled' && isFocused && !hasError && !hasSuccess,
      'ring-2 ring-red-400 ring-offset-1': variant === 'filled' && hasError,
      'ring-2 ring-green-400 ring-offset-1': variant === 'filled' && hasSuccess,
      
      // Underlined - minimal footprint
      'border-0 border-b-2 rounded-none bg-transparent': variant === 'underlined',
      'border-coffee-200': variant === 'underlined' && !isFocused && !hasError && !hasSuccess,
      'border-coffee-500': variant === 'underlined' && isFocused && !hasError && !hasSuccess,
      'border-red-400': variant === 'underlined' && hasError,
      'border-green-400': variant === 'underlined' && hasSuccess,
    },
    
    // Disabled state
    {
      'opacity-50 cursor-not-allowed': disabled,
    }
  )

  // Input styles
  const inputStyles = cn(
    'flex-1 bg-transparent outline-none transition-all duration-200',
    'text-coffee-800 placeholder:text-coffee-400',
    'disabled:cursor-not-allowed',
    
    // Size-based padding
    {
      'px-4 py-3 text-base': size === 'md',
      'px-5 py-4 text-lg': size === 'lg',
    },
    
    // Adjust padding for icons
    {
      'pl-12': leftIcon && size === 'md',
      'pl-14': leftIcon && size === 'lg',
      'pr-12': (rightIcon || clearable || showPasswordToggle) && size === 'md',
      'pr-14': (rightIcon || clearable || showPasswordToggle) && size === 'lg',
    },
    
    // Floating label adjustments
    {
      'pt-6 pb-2': floating && hasValue && size === 'md',
      'pt-7 pb-3': floating && hasValue && size === 'lg',
    }
  )

  // Label styles
  const labelStyles = cn(
    'block transition-all duration-200 font-medium',
    
    // Floating label behavior
    floating ? cn(
      'absolute left-4 pointer-events-none',
      {
        // Floating up when focused or has value
        'top-2 text-xs text-coffee-500': (isFocused || hasValue) && size === 'md',
        'top-3 text-sm text-coffee-500': (isFocused || hasValue) && size === 'lg',
        
        // Normal position when empty
        'top-1/2 -translate-y-1/2 text-base text-coffee-400': !isFocused && !hasValue && size === 'md',
        'top-1/2 -translate-y-1/2 text-lg text-coffee-400': !isFocused && !hasValue && size === 'lg',
      }
    ) : cn(
      'mb-2 text-sm text-coffee-700',
      {
        'text-red-600': hasError,
        'text-green-600': hasSuccess,
      }
    )
  )

  // Icon styles
  const iconStyles = cn(
    'absolute top-1/2 -translate-y-1/2 pointer-events-none text-coffee-400',
    {
      'w-5 h-5': size === 'md',
      'w-6 h-6': size === 'lg',
    }
  )

  const leftIconStyles = cn(iconStyles, 'left-4')
  const rightIconStyles = cn(iconStyles, 'right-4 pointer-events-auto cursor-pointer')

  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className={wrapperStyles}>
        {/* Left icon */}
        {leftIcon && (
          <div className={leftIconStyles}>
            {leftIcon}
          </div>
        )}

        {/* Input element */}
        <input
          ref={inputRef || ref}
          type={actualType}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputStyles}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hint ? `${props.id}-hint` : 
            error ? `${props.id}-error` : 
            success ? `${props.id}-success` : undefined
          }
          {...props}
        />

        {/* Right side icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {/* Clear button */}
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-coffee-400 hover:text-coffee-600 transition-colors"
              aria-label="Clear input"
            >
              <X className={cn('w-4 h-4', { 'w-5 h-5': size === 'lg' })} />
            </button>
          )}

          {/* Password toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-coffee-400 hover:text-coffee-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className={cn('w-4 h-4', { 'w-5 h-5': size === 'lg' })} />
              ) : (
                <Eye className={cn('w-4 h-4', { 'w-5 h-5': size === 'lg' })} />
              )}
            </button>
          )}

          {/* Status icons */}
          {hasError && (
            <AlertCircle className={cn('w-4 h-4 text-red-500', { 'w-5 h-5': size === 'lg' })} />
          )}
          {hasSuccess && !hasError && (
            <CheckCircle className={cn('w-4 h-4 text-green-500', { 'w-5 h-5': size === 'lg' })} />
          )}

          {/* Custom right icon */}
          {rightIcon && (
            <div className="text-coffee-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Help text */}
      {hint && !error && !success && (
        <p id={`${props.id}-hint`} className="mt-2 text-sm text-coffee-500">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${props.id}-error`} className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && !error && (
        <p id={`${props.id}-success`} className="mt-2 text-sm text-green-600 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          {success}
        </p>
      )}
    </div>
  )
})

MobileInput.displayName = 'MobileInput'

// Mobile Textarea component
interface MobileTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  success?: string
  size?: 'md' | 'lg'
  variant?: 'outlined' | 'filled'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  autoResize?: boolean
  required?: boolean
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(({
  label,
  hint,
  error,
  success,
  size = 'md',
  variant = 'outlined',
  resize = 'vertical',
  autoResize = false,
  required = false,
  className,
  onInput,
  ...props
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasError = Boolean(error)
  const hasSuccess = Boolean(success) && !hasError

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      const textarea = e.currentTarget
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
    onInput?.(e)
  }

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [autoResize, props.value])

  const containerStyles = cn(
    'relative flex flex-col',
    {
      'mb-1': !hint && !error && !success,
      'mb-6': hint || error || success,
    }
  )

  const textareaStyles = cn(
    'w-full bg-white/95 text-coffee-800 placeholder:text-coffee-400',
    'transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50',
    
    // Size styles
    {
      'min-h-[96px] px-4 py-3 text-base': size === 'md',   // 6 lines minimum
      'min-h-[120px] px-5 py-4 text-lg': size === 'lg',   // 6 lines minimum
    },
    
    // Variant styles
    {
      'rounded-xl border-2': variant === 'outlined',
      'border-coffee-200/50 focus:border-coffee-500': variant === 'outlined' && !hasError && !hasSuccess,
      'border-red-400 focus:border-red-500': variant === 'outlined' && hasError,
      'border-green-400 focus:border-green-500': variant === 'outlined' && hasSuccess,
      
      'rounded-xl border border-transparent bg-coffee-50/80': variant === 'filled',
      'focus:ring-2 focus:ring-coffee-500 focus:ring-offset-1': variant === 'filled' && !hasError && !hasSuccess,
      'focus:ring-2 focus:ring-red-400 focus:ring-offset-1': variant === 'filled' && hasError,
      'focus:ring-2 focus:ring-green-400 focus:ring-offset-1': variant === 'filled' && hasSuccess,
    },
    
    // Resize styles
    {
      'resize-none': resize === 'none',
      'resize-y': resize === 'vertical',
      'resize-x': resize === 'horizontal', 
      'resize': resize === 'both',
    },
    
    className
  )

  const labelStyles = cn(
    'block mb-2 text-sm font-medium',
    {
      'text-coffee-700': !hasError && !hasSuccess,
      'text-red-600': hasError,
      'text-green-600': hasSuccess,
    }
  )

  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef || ref}
        className={textareaStyles}
        onInput={handleInput}
        aria-invalid={hasError}
        aria-describedby={
          hint ? `${props.id}-hint` : 
          error ? `${props.id}-error` : 
          success ? `${props.id}-success` : undefined
        }
        {...props}
      />

      {/* Help text */}
      {hint && !error && !success && (
        <p id={`${props.id}-hint`} className="mt-2 text-sm text-coffee-500">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${props.id}-error`} className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && !error && (
        <p id={`${props.id}-success`} className="mt-2 text-sm text-green-600 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          {success}
        </p>
      )}
    </div>
  )
})

MobileTextarea.displayName = 'MobileTextarea'

export default MobileInput