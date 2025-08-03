// Safe wrapper for NotificationBell to handle context errors

'use client'

import dynamic from 'next/dynamic'
import { Bell } from 'lucide-react'

// Fallback notification bell when context is not available
function FallbackNotificationBell() {
  return (
    <button
      className="relative p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100/50 rounded-xl transition-colors"
      aria-label="알림"
      disabled
    >
      <Bell className="h-5 w-5" />
    </button>
  )
}

// Dynamic import to handle context safely
const NotificationBell = dynamic(() => import('./NotificationBell'), {
  ssr: false,
  loading: () => <FallbackNotificationBell />
})

export default NotificationBell