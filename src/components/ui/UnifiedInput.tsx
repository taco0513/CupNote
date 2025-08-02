/**
 * Unified Input Component
 * 모든 입력 필드에 일관된 스타일을 제공합니다
 */
'use client'

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface UnifiedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
  fullWidth?: boolean
}

const UnifiedInput = forwardRef<HTMLInputElement, UnifiedInputProps>(({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const widthStyle = fullWidth ? 'w-full' : ''
  const errorStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-coffee-200/50 focus:ring-coffee-500 focus:border-coffee-500'

  return (
    <div className={`${widthStyle} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-coffee-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full px-3 py-2 
            ${icon ? 'pl-10' : ''}
            bg-white/80 backdrop-blur-sm border rounded-xl shadow-sm
            text-coffee-900 placeholder-coffee-400
            focus:outline-none focus:ring-2 focus:ring-offset-0 focus:shadow-md
            disabled:bg-coffee-50/50 disabled:cursor-not-allowed
            transition-all duration-200
            ${errorStyle}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-coffee-500">{helperText}</p>
      )}
    </div>
  )
})

UnifiedInput.displayName = 'UnifiedInput'

export default UnifiedInput