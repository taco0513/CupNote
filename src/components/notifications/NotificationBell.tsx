// 알림 벨 컴포넌트 - AppHeader에 표시되는 알림 아이콘

'use client'

import { useState } from 'react'
import { Bell, BellDot } from 'lucide-react'
import { useSystemNotifications } from '../../contexts/SystemNotificationContext'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const { unreadCount } = useSystemNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100/50 rounded-xl transition-colors"
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellDot className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        
        {/* 읽지 않은 알림 개수 표시 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 콘텐츠 */}
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}