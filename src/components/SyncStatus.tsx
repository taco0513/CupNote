'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { offlineSync } from '../lib/offline-sync'
import { offlineStorage } from '../lib/offline-storage'
import { useAuth } from '../contexts/AuthContext'

export default function SyncStatus() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const updateStatus = async () => {
      setIsOnline(navigator.onLine)

      if (user) {
        const hasPending = await offlineSync.hasPendingChanges()
        if (hasPending) {
          const pending = await offlineStorage.getPendingRecords(user.id)
          setPendingCount(pending.length)
        } else {
          setPendingCount(0)
        }
      }
    }

    updateStatus()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      updateStatus()
    }
    const handleOffline = () => {
      setIsOnline(false)
      updateStatus()
    }

    // Listen for sync events
    const handleSyncComplete = () => {
      setIsSyncing(false)
      updateStatus()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('cupnote-sync-complete', handleSyncComplete)

    // Check sync status periodically
    const interval = setInterval(() => {
      const status = offlineSync.getSyncStatus()
      setIsSyncing(status.inProgress)
      updateStatus()
    }, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('cupnote-sync-complete', handleSyncComplete)
      clearInterval(interval)
    }
  }, [user])

  const handleManualSync = async () => {
    setIsSyncing(true)
    await offlineSync.sync()
  }

  if (!user) return null

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={handleManualSync}
        disabled={!isOnline || isSyncing}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
          transition-all duration-300 backdrop-blur-sm
          ${
            isOnline
              ? pendingCount > 0
                ? 'bg-yellow-100/90 text-yellow-800 hover:bg-yellow-200/90'
                : 'bg-green-100/90 text-green-800 hover:bg-green-200/90'
              : 'bg-gray-100/90 text-gray-600'
          }
          ${isSyncing ? 'animate-pulse' : ''}
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        {isOnline ? (
          isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>동기화 중...</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <Cloud className="h-4 w-4" />
              <span>{pendingCount}개 대기중</span>
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4" />
              <span>동기화됨</span>
            </>
          )
        ) : (
          <>
            <CloudOff className="h-4 w-4" />
            <span>오프라인</span>
          </>
        )}
      </button>
    </div>
  )
}
