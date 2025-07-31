'use client'

import { useNotification } from '@/contexts/NotificationContext'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const NotificationItem = ({ notification }: { notification: any }) => {
  const { removeNotification } = useNotification()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Enter animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeNotification(notification.id)
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getStyles = () => {
    const baseStyles = 'border-l-4 bg-white shadow-lg rounded-lg'
    switch (notification.type) {
      case 'success':
        return `${baseStyles} border-green-400`
      case 'error':
        return `${baseStyles} border-red-400`
      case 'warning':
        return `${baseStyles} border-yellow-400`
      case 'info':
        return `${baseStyles} border-blue-400`
      default:
        return `${baseStyles} border-gray-400`
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-4
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`${getStyles()} p-4 pr-12 relative max-w-sm w-full`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 pr-6">{notification.title}</h4>
            {notification.message && (
              <p className="text-sm text-gray-600 mt-1 pr-6">{notification.message}</p>
            )}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="text-sm font-medium text-coffee-600 hover:text-coffee-700 mt-2 focus:outline-none focus:underline"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotificationContainer() {
  const { notifications } = useNotification()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 max-h-screen overflow-y-auto">
      <div className="flex flex-col items-end">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}
