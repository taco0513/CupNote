'use client'

import { useState, useEffect, ReactNode } from 'react'

// 버튼 클릭 애니메이션
interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function AnimatedButton({ children, onClick, className = '', disabled = false }: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    
    setIsPressed(true)
    
    // 리플 효과 생성
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple = { id: Date.now(), x, y }
    
    setRipples(prev => [...prev, newRipple])
    
    // 리플 효과 제거
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <button
      className={`
        relative overflow-hidden transition-all duration-200 ease-out
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      
      {/* 리플 효과 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: 'ripple 0.6s ease-out'
          }}
        />
      ))}
    </button>
  )
}

// 카드 호버 애니메이션
interface AnimatedCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hoverable = true, 
  clickable = false,
  onClick 
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${hoverable ? 'hover:scale-105 hover:shadow-xl' : ''}
        ${clickable ? 'cursor-pointer active:scale-95' : ''}
        ${isHovered ? 'shadow-lg' : 'shadow-sm'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  )
}

// 입력 필드 포커스 애니메이션
interface AnimatedInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: string
}

export function AnimatedInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  error
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  const labelClassName = `
    absolute left-3 transition-all duration-200 ease-out pointer-events-none
    ${isFocused || hasValue 
      ? 'top-1 text-xs text-primary transform scale-90' 
      : 'top-1/2 text-base text-gray-500 transform -translate-y-1/2'
    }
  `

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? placeholder : ''}
        className={`
          w-full px-3 pt-6 pb-2 border rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300 focus:border-primary'}
        `}
      />
      <label className={labelClassName}>
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  )
}

// 성공/에러 애니메이션
interface AnimatedFeedbackProps {
  type: 'success' | 'error' | 'loading'
  message: string
  className?: string
}

export function AnimatedFeedback({ type, message, className = '' }: AnimatedFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce-once">
            <span className="text-white text-lg">✓</span>
          </div>
        )
      case 'error':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-shake">
            <span className="text-white text-lg">✗</span>
          </div>
        )
      case 'loading':
        return (
          <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        )
    }
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${type === 'success' ? 'bg-green-50 text-green-800' : ''}
        ${type === 'error' ? 'bg-red-50 text-red-800' : ''}
        ${type === 'loading' ? 'bg-blue-50 text-blue-800' : ''}
        ${className}
      `}
    >
      {getIcon()}
      <span className="font-medium">{message}</span>
    </div>
  )
}

// 숫자 카운터 애니메이션
interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  className?: string
  suffix?: string
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 1000, 
  className = '',
  suffix = '' 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // easeOut 애니메이션
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.round(from + (to - from) * easeOut)
      
      setCount(currentCount)

      if (now < endTime) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [from, to, duration])

  return (
    <span className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

// 진행률 바 애니메이션
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className = '',
  showLabel = false,
  color = 'primary'
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage])

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>진행률</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    </div>
  )
}