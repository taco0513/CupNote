/**
 * Unified Empty State Component
 * 빈 상태 표시에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}