// 시스템 알림 컨텍스트 - 전역 시스템 알림 상태 관리

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CupNoteNotification, NotificationSettings } from '../types/notification'
import { NotificationService } from '../lib/notification-service'
import { initializeDemoNotifications } from '../lib/demo-notification'

interface SystemNotificationContextValue {
  notifications: CupNoteNotification[]
  unreadCount: number
  settings: NotificationSettings
  refreshNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  updateSettings: (settings: NotificationSettings) => void
  requestPermission: () => Promise<NotificationPermission>
}

const SystemNotificationContext = createContext<SystemNotificationContextValue | undefined>(undefined)

export function useSystemNotifications() {
  const context = useContext(SystemNotificationContext)
  if (!context) {
    throw new Error('useSystemNotifications must be used within a SystemNotificationProvider')
  }
  return context
}

interface SystemNotificationProviderProps {
  children: ReactNode
}

export function SystemNotificationProvider({ children }: SystemNotificationProviderProps) {
  const [notifications, setNotifications] = useState<CupNoteNotification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(NotificationService.getDefaultSettings())

  // 알림 목록 새로고침
  const refreshNotifications = () => {
    setNotifications(NotificationService.getNotifications())
  }

  // 설정 새로고침
  const refreshSettings = () => {
    setSettings(NotificationService.getSettings())
  }

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(n => !n.read).length

  // 알림 읽음 처리
  const markAsRead = (id: string) => {
    NotificationService.markAsRead(id)
    refreshNotifications()
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    NotificationService.markAllAsRead()
    refreshNotifications()
  }

  // 알림 삭제
  const deleteNotification = (id: string) => {
    NotificationService.deleteNotification(id)
    refreshNotifications()
  }

  // 설정 업데이트
  const updateSettings = (newSettings: NotificationSettings) => {
    NotificationService.saveSettings(newSettings)
    refreshSettings()
  }

  // 브라우저 알림 권한 요청
  const requestPermission = async () => {
    return await NotificationService.requestNotificationPermission()
  }

  // 초기 로드 및 주기적 체크
  useEffect(() => {
    // 초기 데이터 로드
    refreshNotifications()
    refreshSettings()

    // 앱 시작 시 통계 체크
    NotificationService.checkStatsNotification()
    
    // 데모 알림 초기화 (첫 방문자용)
    initializeDemoNotifications()

    // 30분마다 알림 새로고침
    const refreshInterval = setInterval(() => {
      refreshNotifications()
    }, 30 * 60 * 1000) // 30분

    return () => {
      clearInterval(refreshInterval)
    }
  }, [])

  // 커피 기록 변경 감지 (뱃지 체크용)
  useEffect(() => {
    const handleRecordUpdate = () => {
      NotificationService.checkAchievements()
      refreshNotifications()
    }

    // 커피 기록 변경 이벤트 리스너
    window.addEventListener('cupnote-record-added', handleRecordUpdate)
    window.addEventListener('cupnote-record-updated', handleRecordUpdate)

    return () => {
      window.removeEventListener('cupnote-record-added', handleRecordUpdate)
      window.removeEventListener('cupnote-record-updated', handleRecordUpdate)
    }
  }, [])

  // 페이지 포커스 시 알림 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshNotifications()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const value: SystemNotificationContextValue = {
    notifications,
    unreadCount,
    settings,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    requestPermission
  }

  return (
    <SystemNotificationContext.Provider value={value}>
      {children}
    </SystemNotificationContext.Provider>
  )
}