/**
 * Unified Select Component
 * 모든 선택 필드에 일관된 스타일을 제공합니다
 */
'use client'

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  icon?: ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder = '선택하세요',
  fullWidth = false,
  icon,
  className = '',
  ...props
}, ref) => {
  const widthStyle = fullWidth ? 'w-full' : ''
  const errorStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:ring-accent-warm'

  return (
    <div className={`${widthStyle} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            block w-full px-3 py-2 pr-8
            ${icon ? 'pl-10' : ''}
            bg-white border rounded-lg
            text-neutral-900
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            appearance-none
            ${errorStyle}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select