'use client'

import { forwardRef, InputHTMLAttributes, useState, useCallback } from 'react'
import FormField from './FormField'

interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string | null
  helperText?: string
  required?: boolean
  onValidatedChange?: (value: string, isValid: boolean) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showValidationIcon?: boolean
  className?: string
  inputClassName?: string
}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      onValidatedChange,
      onBlur,
      validateOnChange = true,
      validateOnBlur = true,
      showValidationIcon = true,
      className = '',
      inputClassName = '',
      type = 'text',
      value,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)

    const isValid = !error && hasInteracted
    const showError = error && hasInteracted
    const showSuccess = isValid && showValidationIcon && value

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value

        if (validateOnChange) {
          setHasInteracted(true)
        }

        onValidatedChange?.(newValue, !error)
      },
      [onValidatedChange, error, validateOnChange]
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false)

        if (validateOnBlur) {
          setHasInteracted(true)
        }

        onBlur?.(e)
      },
      [onBlur, validateOnBlur]
    )

    const handleFocus = useCallback(() => {
      setFocused(true)
    }, [])

    const inputClasses = `
      w-full px-4 py-3 border rounded-lg transition-all duration-200
      ${
        showError
          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
          : showSuccess
            ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200'
            : focused
              ? 'border-amber-500 bg-white focus:ring-amber-200'
              : 'border-gray-300 bg-white hover:border-gray-400'
      }
      focus:outline-none focus:ring-2
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${showValidationIcon && (showError || showSuccess) ? 'pr-12' : 'pr-4'}
      ${inputClassName}
    `.trim()

    return (
      <FormField
        label={label}
        error={showError ? error : null}
        required={required}
        helperText={helperText}
        className={className}
      >
        <div className="relative">
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={inputClasses}
            aria-invalid={showError || undefined}
            aria-describedby={
              showError
                ? `${props.id || 'input'}-error`
                : helperText
                  ? `${props.id || 'input'}-help`
                  : undefined
            }
            {...props}
          />

          {showValidationIcon && (showError || showSuccess) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {showError ? (
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : showSuccess ? (
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </div>
          )}
        </div>
      </FormField>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'

export default ValidatedInput
