/**
 * AppHeader Action Buttons Component
 */
'use client'

import { Search } from 'lucide-react'
import SafeNotificationBell from '../notifications/SafeNotificationBell'

interface AppHeaderActionsProps {
  showSearch: boolean
  user: any
  handleSearchClick: () => void
}

export default function AppHeaderActions({ 
  showSearch, 
  user, 
  handleSearchClick 
}: AppHeaderActionsProps) {
  return (
    <>
      {/* 검색 버튼 */}
      {showSearch && (
        <button
          onClick={handleSearchClick}
          className="p-2 rounded-lg hover:bg-coffee-50/80 active:bg-coffee-100/80 transition-colors"
          aria-label="검색"
        >
          <Search className="h-5 w-5 text-coffee-600" />
        </button>
      )}

      {/* 알림 벨 (로그인된 사용자만) */}
      {user && <SafeNotificationBell />}
    </>
  )
}