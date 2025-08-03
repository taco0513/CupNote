/**
 * Toast Notification Component - 하이브리드 디자인 시스템
 * 미니멀한 구조 + 프리미엄 비주얼
 */
'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Coffee } from 'lucide-react'
import { createPortal } from 'react-dom'

interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'coffee'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000, // 기본 5초
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // 자동 제거 (persistent가 아닌 경우)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container (Portal) - 하이브리드 스타일
function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !toasts.length) return null

  const toastContent = (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md md:max-w-lg">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )

  return createPortal(toastContent, document.body)
}

// Individual Toast Item - 하이브리드 디자인
function ToastItem({ 
  toast, 
  onRemove 
}: { 
  toast: Toast
  onRemove: (id: string) => void 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // 등장 애니메이션
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'coffee':
        return <Coffee className="h-5 w-5 text-coffee-600" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50/95 border-green-200/50 text-green-800'
      case 'error':
        return 'bg-red-50/95 border-red-200/50 text-red-800'
      case 'warning':
        return 'bg-amber-50/95 border-amber-200/50 text-amber-800'
      case 'info':
        return 'bg-blue-50/95 border-blue-200/50 text-blue-800'
      case 'coffee':
        return 'bg-coffee-50/95 border-coffee-200/50 text-coffee-800'
    }
  }

  const getProgressColor = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-amber-500'
      case 'info': return 'bg-blue-500'
      case 'coffee': return 'bg-coffee-500'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${getStyles()}
        backdrop-blur-md rounded-2xl shadow-xl border
        p-4 min-w-[320px] max-w-md
        hover:shadow-2xl hover:scale-[1.02] cursor-pointer
      `}
      role="alert"
      aria-live="polite"
      onClick={handleRemove}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 - 하이브리드 스타일 */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
            {getIcon()}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-semibold text-sm mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-sm opacity-90">
            {toast.message}
          </p>
          
          {/* 액션 버튼 - 하이브리드 스타일 */}
          {toast.action && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toast.action!.onClick()
                  handleRemove()
                }}
                className="text-xs font-medium underline hover:no-underline transition-all"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        {/* 닫기 버튼 - 미니멀 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-white/40 flex items-center justify-center transition-colors"
          aria-label="알림 닫기"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 진행률 바 - 미니멀 애니메이션 */}
      {!toast.persistent && toast.duration && (
        <div className="mt-3 h-0.5 bg-white/30 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all ease-linear rounded-full`}
            style={{
              animation: `shrink ${toast.duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Convenience hooks
export function useSuccessToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ type: 'success', message, ...options })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ type: 'error', message, ...options })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ type: 'warning', message, ...options })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ type: 'info', message, ...options })
  }, [addToast])
}

export function useCoffeeToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ type: 'coffee', message, ...options })
  }, [addToast])
}

// CSS for progress bar animation
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style')
  style.id = 'toast-styles'
  style.textContent = `
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `
  document.head.appendChild(style)
}