'use client'

import { useState, useCallback } from 'react'
import { useNotification } from '../contexts/NotificationContext'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const { error } = useNotification()

  const validateField = useCallback(
    (field: string, value: any): string | null => {
      const rule = rules[field]
      if (!rule) return null

      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return '필수 입력 항목입니다.'
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null
      }

      // String validations
      if (typeof value === 'string') {
        // Min length validation
        if (rule.minLength && value.length < rule.minLength) {
          return `최소 ${rule.minLength}자 이상 입력해주세요.`
        }

        // Max length validation
        if (rule.maxLength && value.length > rule.maxLength) {
          return `최대 ${rule.maxLength}자까지 입력 가능합니다.`
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          return '올바른 형식으로 입력해주세요.'
        }
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value)
      }

      return null
    },
    [rules]
  )

  const validateForm = useCallback(
    (formData: { [key: string]: any }): boolean => {
      const newErrors: ValidationErrors = {}
      let hasErrors = false

      Object.keys(rules).forEach(field => {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
          hasErrors = true
        }
      })

      setErrors(newErrors)
      return !hasErrors
    },
    [rules, validateField]
  )

  const validateSingleField = useCallback(
    (field: string, value: any) => {
      const error = validateField(field, value)
      setErrors(prev => ({
        ...prev,
        [field]: error || '',
      }))
      return !error
    },
    [validateField]
  )

  const setFieldTouched = useCallback((field: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched,
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const getFieldError = useCallback(
    (field: string): string | null => {
      return (touched[field] && errors[field]) || null
    },
    [errors, touched]
  )

  const showFormErrors = useCallback(
    (formData: { [key: string]: any }) => {
      const isValid = validateForm(formData)
      if (!isValid) {
        const firstError = Object.values(errors).find(err => err)
        if (firstError) {
          error('입력 오류', firstError)
        }
      }
      return isValid
    },
    [validateForm, errors, error]
  )

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    getFieldError,
    showFormErrors,
    hasErrors: Object.values(errors).some(error => error !== ''),
  }
}

// Commonly used validation rules
export const commonRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    custom: (value: string) => {
      if (!value.includes('@')) return '올바른 이메일 주소를 입력해주세요.'
      return null
    },
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다.'
      return null
    },
  },
  username: {
    required: true,
    minLength: 2,
    maxLength: 20,
    custom: (value: string) => {
      if (!/^[a-zA-Z0-9가-힣_-]+$/.test(value)) {
        return '사용자명은 한글, 영문, 숫자, _, -만 사용 가능합니다.'
      }
      return null
    },
  },
  coffeeName: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  rating: {
    custom: (value: number) => {
      if (value && (value < 1 || value > 5)) return '평점은 1-5 사이의 값이어야 합니다.'
      return null
    },
  },
}
