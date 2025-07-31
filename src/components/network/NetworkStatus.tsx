'use client'

import { useEffect, useState } from 'react'

import { WifiOff, Wifi, Signal } from 'lucide-react'

import { useNotification } from '../../contexts/NotificationContext'
import { useNetworkStatus, useDataSync } from '../../hooks/useNetworkStatus'

export default function NetworkStatus() {
  const { isOnline, isSlowConnection, connectionType } = useNetworkStatus()
  const { pendingOperations } = useDataSync()
  const { warning, info } = useNotification()
  const [showStatus, setShowStatus] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에만 렌더링
  useEffect(() => {
    setMounted(true)
  }, [])

  // 네트워크 상태 변화 감지
  useEffect(() => {
    if (!isOnline && !wasOffline) {
      // 오프라인이 된 경우
      setWasOffline(true)
      setShowStatus(true)
      warning('오프라인 상태', '인터넷 연결을 확인해주세요.')
    } else if (isOnline && wasOffline) {
      // 다시 온라인이 된 경우
      setWasOffline(false)
      info('온라인 복구', '인터넷 연결이 복구되었습니다.')

      if (pendingOperations > 0) {
        info('데이터 동기화', `${pendingOperations}개의 대기 중인 작업을 처리 중입니다.`)
      }

      // 3초 후 상태바 숨김
      setTimeout(() => setShowStatus(false), 3000)
    }
  }, [isOnline, wasOffline, pendingOperations, warning, info])

  // 느린 연결 경고
  useEffect(() => {
    if (isOnline && isSlowConnection) {
      warning('느린 연결', '연결 상태가 느립니다. 데이터 사용량을 확인해주세요.')
    }
  }, [isSlowConnection, warning])

  // 마운트되기 전에는 렌더링하지 않음
  if (!mounted) {
    return null
  }

  if (!showStatus && isOnline) {
    return null
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showStatus ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`px-4 py-2 text-white text-sm font-medium text-center flex items-center justify-center space-x-2 ${
          isOnline ? (isSlowConnection ? 'bg-yellow-500' : 'bg-green-500') : 'bg-red-500'
        }`}
      >
        {isOnline ? (
          <>
            {isSlowConnection ? <Signal className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            <span>
              {isSlowConnection ? `느린 연결 (${connectionType})` : '온라인 상태'}
              {pendingOperations > 0 && ` • ${pendingOperations}개 동기화 중`}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>오프라인 상태</span>
            {pendingOperations > 0 && (
              <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                {pendingOperations}개 대기 중
              </span>
            )}
          </>
        )}
      </div>

      {/* 닫기 버튼 - 오프라인일 때만 표시 */}
      {!isOnline && (
        <button
          onClick={() => setShowStatus(false)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
        >
          ×
        </button>
      )}
    </div>
  )
}

// 간단한 연결 상태 표시기 (하단 우측)
export function ConnectionIndicator() {
  const { isOnline, isSlowConnection } = useNetworkStatus()
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에만 렌더링
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOnline || isSlowConnection) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, isSlowConnection])

  // 마운트되기 전에는 렌더링하지 않음
  if (!mounted) {
    return null
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-40">
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-white text-xs font-medium shadow-lg ${
          !isOnline ? 'bg-red-500' : isSlowConnection ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      >
        {!isOnline ? (
          <WifiOff className="h-3 w-3" />
        ) : isSlowConnection ? (
          <Signal className="h-3 w-3" />
        ) : (
          <Wifi className="h-3 w-3" />
        )}
        <span>{!isOnline ? '오프라인' : isSlowConnection ? '느린 연결' : '온라인'}</span>
      </div>
    </div>
  )
}
