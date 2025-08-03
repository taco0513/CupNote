/**
 * Unified Modal Component
 * 모든 모달에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode, useEffect } from 'react'

import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'small' | 'medium' | 'large' | 'full'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  className?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = ''
}: ModalProps) {
  const sizeStyles = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-5xl'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeOnBackdrop ? onClose : undefined}
        />

        {/* Modal Content */}
        <div className={`
          relative bg-white rounded-xl shadow-xl
          transform transition-all
          w-full
          ${sizeStyles[size]}
          ${className}
        `}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100">
              {title && (
                <h3 className="text-xl font-semibold text-neutral-800">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`mt-6 pt-6 border-t border-neutral-100 flex justify-end space-x-3 ${className}`}>
      {children}
    </div>
  )
}