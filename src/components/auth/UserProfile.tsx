'use client'

import { useState } from 'react'

import { User, Settings, LogOut, Trophy, Coffee } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'

interface UserProfileProps {
  onClose?: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, signOut } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose?.()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const levelProgress = ((user.total_points % 100) / 100) * 100

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
      {/* User Info */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User size={32} className="text-amber-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{user.username}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Trophy size={16} className="text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Level {user.level}</span>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">다음 레벨까지</span>
          <span className="text-sm font-medium text-gray-900">
            {user.total_points % 100}/100 XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Coffee size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{user.total_points}</p>
          <p className="text-sm text-gray-600">총 포인트</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Trophy size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{user.level}</p>
          <p className="text-sm text-gray-600">현재 레벨</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        <button
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => {
            // TODO: 설정 페이지로 이동
            console.log('Settings clicked')
          }}
        >
          <Settings size={20} className="text-gray-500" />
          <span className="text-gray-700">설정</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">로그아웃 하시겠습니까?</h3>
            <p className="text-gray-600 mb-6">계정에서 로그아웃됩니다.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
