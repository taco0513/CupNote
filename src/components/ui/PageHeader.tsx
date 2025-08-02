/**
 * PageHeader Component - 하이브리드 디자인 시스템
 * 모든 페이지에서 일관된 헤더 스타일을 제공합니다
 */
'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  description,
  icon,
  action,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`text-center mb-8 md:mb-12 ${className}`}>
      <div className="inline-flex items-center space-x-3 mb-4">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center shadow-lg">
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">
          {title}
        </h1>
      </div>
      
      {description && (
        <p className="text-base md:text-lg text-coffee-600 max-w-2xl mx-auto px-4 mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}