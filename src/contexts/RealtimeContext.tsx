'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { realtimeManager, RealtimeEvent, RealtimeEventType } from '../lib/realtime-manager'

interface RealtimeContextType {
  isConnected: boolean
  subscribe: (event: RealtimeEventType, callback: (event: RealtimeEvent) => void) => string
  unsubscribe: (subscriptionId: string) => boolean
  broadcastEvent: (channel: string, event: string, data: Record<string, any>) => Promise<void>
  connectionStatus: {
    connected: boolean
    channels: number
    subscriptions: number
    reconnectAttempts: number
  }
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    channels: 0,
    subscriptions: 0,
    reconnectAttempts: 0
  })

  useEffect(() => {
    // 연결 상태 모니터링
    const checkConnection = () => {
      const status = realtimeManager.getConnectionStatus()
      setIsConnected(status.connected)
      setConnectionStatus(status)
    }

    // 초기 상태 확인
    checkConnection()

    // 주기적 상태 확인 (30초마다)
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  const subscribe = useCallback((
    event: RealtimeEventType, 
    callback: (event: RealtimeEvent) => void
  ): string => {
    return realtimeManager.subscribe(event, callback)
  }, [])

  const unsubscribe = useCallback((subscriptionId: string): boolean => {
    return realtimeManager.unsubscribe(subscriptionId)
  }, [])

  const broadcastEvent = useCallback(async (
    channel: string, 
    event: string, 
    data: Record<string, any>
  ): Promise<void> => {
    await realtimeManager.broadcastEvent(channel, event, data)
  }, [])

  const value: RealtimeContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    broadcastEvent,
    connectionStatus
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

export default RealtimeContext