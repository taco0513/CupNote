/**
 * Unified Alert Component
 * 알림 메시지에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react'

interface AlertProps {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  onClose?: () => void
  className?: string
}

export default function Alert({
  children,
  variant = 'info',
  title,
  onClose,
  className = ''
}: AlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: 'text-blue-800',
      content: 'text-blue-700'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: 'text-green-800',
      content: 'text-green-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      title: 'text-yellow-800',
      content: 'text-yellow-700'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      title: 'text-red-800',
      content: 'text-red-700'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={`
      relative flex p-4 rounded-lg border
      ${styles.container}
      ${className}
    `}>
      <div className="flex-shrink-0">
        {styles.icon}
      </div>
      <div className="ml-3 flex-1">
        {title && (
          <h3 className={`text-sm font-medium mb-1 ${styles.title}`}>
            {title}
          </h3>
        )}
        <div className={`text-sm ${styles.content}`}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${styles.content}`}
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}