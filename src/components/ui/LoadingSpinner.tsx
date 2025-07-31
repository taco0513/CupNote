'use client'

import { Coffee } from 'lucide-react'

interface LoadingSpinnerProps {
  variant?: 'default' | 'coffee'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullscreen?: boolean
  overlay?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const colorClasses = {
  primary: 'text-amber-600',
  white: 'text-white',
  gray: 'text-gray-500',
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

export default function LoadingSpinner({
  variant = 'default',
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  overlay = false,
  className = '',
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {variant === 'coffee' ? (
          // Coffee theme spinner
          <div className="relative">
            <Coffee className={`${sizeClasses[size]} text-coffee-600 animate-bounce`} />
            <div
              className={`absolute inset-0 ${sizeClasses[size]} border-2 border-coffee-200 border-t-coffee-600 rounded-full animate-spin`}
            />
          </div>
        ) : (
          // Default SVG spinner
          <svg
            className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {text && (
          <p
            className={`${textSizeClasses[size]} ${
              variant === 'coffee' ? 'text-coffee-600' : colorClasses[color]
            } font-medium`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
        {content}
      </div>
    )
  }

  return content
}

// Inline loading spinner (for buttons, etc.)
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div
      className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
    />
  )
}

// Skeleton loader for content placeholders
export function SkeletonLoader({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
        </div>
      ))}
    </div>
  )
}

// Button loading state
export function LoadingButton({
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: {
  loading?: boolean
  children: React.ReactNode
  disabled?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <button disabled={loading || disabled} className={`relative ${className}`} {...props}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
    </button>
  )
}

// Card skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border border-coffee-100 animate-pulse ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}