// 알림 드롭다운 - 알림 목록을 표시하는 드롭다운

'use client'

import { Coffee, Award, BarChart3, Info, CheckCheck, Settings, ArrowRight, Bell } from 'lucide-react'
import { useSystemNotifications } from '../../contexts/SystemNotificationContext'
import { CupNoteNotification } from '../../types/notification'
import Link from 'next/link'

interface NotificationDropdownProps {
  onClose: () => void
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSystemNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-4 w-4 text-amber-500" />
      case 'stats':
        return <BarChart3 className="h-4 w-4 text-blue-500" />
      case 'system':
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-amber-50 border-amber-200'
      case 'stats':
        return 'bg-blue-50 border-blue-200'
      case 'system':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleNotificationClick = (notification: CupNoteNotification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    
    onClose()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-coffee-200/30 overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-coffee-100 bg-gradient-to-r from-coffee-50 to-amber-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-coffee-800">알림</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-coffee-600 hover:text-coffee-800 flex items-center space-x-1"
              >
                <CheckCheck className="h-3 w-3" />
                <span>모두 읽음</span>
              </button>
            )}
            <Link href="/settings#notifications" onClick={onClose}>
              <Settings className="h-4 w-4 text-coffee-500 hover:text-coffee-700" />
            </Link>
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-coffee-600 mt-1">
            {unreadCount}개의 읽지 않은 알림
          </p>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-coffee-300 mx-auto mb-2" />
            <p className="text-coffee-500 text-sm">새로운 알림이 없습니다</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-3 rounded-xl mb-2 border cursor-pointer transition-all duration-200
                  ${notification.read ? 'bg-white border-gray-100' : getTypeColor(notification.type)}
                  ${notification.actionUrl ? 'hover:scale-[1.02] hover:shadow-md' : ''}
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                      {notification.actionUrl && (
                        <ArrowRight className="h-3 w-3 text-coffee-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 10 && (
              <div className="p-3 text-center border-t border-coffee-100">
                <Link href="/settings#notifications" onClick={onClose}>
                  <button className="text-coffee-600 text-sm hover:text-coffee-800">
                    모든 알림 보기 ({notifications.length})
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

