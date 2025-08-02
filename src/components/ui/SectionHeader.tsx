/**
 * Unified Section Header Component
 * 페이지 내 섹션 헤더에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function SectionHeader({
  title,
  description,
  icon,
  action,
  className = ''
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-accent-warm/10 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
            {description && (
              <p className="text-sm text-neutral-600 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}