/**
 * AppHeader Profile Button Component
 */
'use client'

import { User } from 'lucide-react'

interface AppHeaderProfileButtonProps {
  user: any
  setShowMobileMenu: (show: boolean) => void
}

export default function AppHeaderProfileButton({ 
  user, 
  setShowMobileMenu 
}: AppHeaderProfileButtonProps) {
  return (
    <button
      onClick={() => setShowMobileMenu(true)}
      className="p-2 rounded-lg hover:bg-coffee-50/80 active:bg-coffee-100/80 transition-colors"
      aria-label="프로필 메뉴"
    >
      {user ? (
        <div className="w-7 h-7 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-sm">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
        </div>
      ) : (
        <User className="h-5 w-5 text-coffee-600" />
      )}
    </button>
  )
}