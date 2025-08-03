'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { createPortal } from 'react-dom'

import { Button } from './Button'

interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
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

// Toast Container (Portal)
function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) {
  if (!toasts.length) return null

  const toastContent = (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )

  return createPortal(toastContent, document.body)
}

// Individual Toast Item
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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-l-green-500'
      case 'error': return 'border-l-red-500'
      case 'warning': return 'border-l-yellow-500'
      case 'info': return 'border-l-blue-500'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        bg-white rounded-lg shadow-lg border-l-4 ${getBorderColor()}
        p-4 min-w-80 max-w-md
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-gray-900 mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700">
            {toast.message}
          </p>
          
          {/* 액션 버튼 */}
          {toast.action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.action!.onClick()
                  handleRemove()
                }}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="flex-shrink-0 h-6 w-6 text-gray-400 hover:text-gray-600"
          aria-label="알림 닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 진행률 바 (duration이 있는 경우) */}
      {!toast.persistent && toast.duration && (
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } transition-all ease-linear`}
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

// CSS for progress bar animation
const toastStyles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = toastStyles
  document.head.appendChild(style)
}