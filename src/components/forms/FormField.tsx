'use client'

import { forwardRef, ReactNode } from 'react'

interface FormFieldProps {
  label?: string
  error?: string | null
  required?: boolean
  helperText?: string
  className?: string
  children: ReactNode
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, helperText, className = '', children }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">{children}</div>

        {/* Error message */}
        {error && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Helper text */}
        {!error && helperText && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField
