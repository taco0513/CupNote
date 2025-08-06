/**
 * Realtime Manager - Supabase Realtime 통합 관리
 * 
 * CupNote의 실시간 기능을 통합 관리하는 중앙화된 시스템
 * - 커뮤니티 알림
 * - 실시간 통계 업데이트  
 * - 협업 기능
 * - 시스템 알림
 * 
 * @version 1.0.0
 * @since 2025-08-06
 */

import { supabase } from './supabase'
import { log } from './logger'

// ========================================
// 실시간 이벤트 타입 정의
// ========================================

export type RealtimeEventType = 
  | 'community_match'      // 커뮤니티 매칭 업데이트
  | 'achievement_unlock'   // 성취 달성 알림
  | 'new_record'          // 새로운 커피 기록
  | 'system_update'       // 시스템 업데이트
  | 'user_activity'       // 사용자 활동

export interface RealtimeEvent {
  id: string
  type: RealtimeEventType
  data: Record<string, any>
  user_id?: string
  created_at: string
  metadata?: {
    priority: 'low' | 'medium' | 'high'
    persistent: boolean
    expires_at?: string
  }
}

export interface RealtimeSubscription {
  id: string
  channel: string
  event: RealtimeEventType
  callback: (event: RealtimeEvent) => void
  active: boolean
}

// ========================================
// Realtime Manager 클래스
// ========================================

export class RealtimeManager {
  private static instance: RealtimeManager
  private subscriptions: Map<string, RealtimeSubscription> = new Map()
  private channels: Map<string, any> = new Map()
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  private constructor() {
    this.initialize()
  }

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  // ========================================
  // 초기화 및 연결 관리
  // ========================================

  private async initialize() {
    try {
      // Supabase 인증 상태 확인
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await this.connect()
      }

      // 인증 상태 변경 감지
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          this.connect()
        } else if (event === 'SIGNED_OUT') {
          this.disconnect()
        }
      })

    } catch (error) {
      log.error('RealtimeManager initialization failed:', error)
    }
  }

  private async connect() {
    try {
      log.info('RealtimeManager connecting...')
      
      // 기본 채널들 설정
      await Promise.all([
        this.setupUserChannel(),
        this.setupCommunityChannel(),
        this.setupSystemChannel()
      ])

      this.isConnected = true
      this.reconnectAttempts = 0
      
      log.info('RealtimeManager connected successfully')

    } catch (error) {
      log.error('RealtimeManager connection failed:', error)
      this.handleConnectionError()
    }
  }

  private disconnect() {
    log.info('RealtimeManager disconnecting...')
    
    // 모든 채널 정리
    this.channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    
    this.channels.clear()
    this.subscriptions.clear()
    this.isConnected = false
    
    log.info('RealtimeManager disconnected')
  }

  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000 // 지수 백오프
      
      setTimeout(() => {
        this.reconnectAttempts++
        log.info(`RealtimeManager reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, delay)
    } else {
      log.error('RealtimeManager max reconnection attempts reached')
    }
  }

  // ========================================
  // 채널 설정
  // ========================================

  private async setupUserChannel() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const channelName = `user_${user.id}`
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'achievement_unlock' }, (payload) => {
        this.handleEvent({
          id: payload.id || Date.now().toString(),
          type: 'achievement_unlock',
          data: payload,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
      })
      .on('broadcast', { event: 'new_record' }, (payload) => {
        this.handleEvent({
          id: payload.id || Date.now().toString(),
          type: 'new_record',
          data: payload,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
      })
      .subscribe()

    this.channels.set(channelName, channel)
  }

  private async setupCommunityChannel() {
    const channelName = 'community_global'
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coffee_records'
      }, (payload) => {
        this.handleEvent({
          id: Date.now().toString(),
          type: 'community_match',
          data: payload.new,
          created_at: new Date().toISOString(),
          metadata: { priority: 'low', persistent: false }
        })
      })
      .on('broadcast', { event: 'community_update' }, (payload) => {
        this.handleEvent({
          id: payload.id || Date.now().toString(),
          type: 'community_match',
          data: payload,
          created_at: new Date().toISOString()
        })
      })
      .subscribe()

    this.channels.set(channelName, channel)
  }

  private async setupSystemChannel() {
    const channelName = 'system_notifications'
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'system_update' }, (payload) => {
        this.handleEvent({
          id: payload.id || Date.now().toString(),
          type: 'system_update',
          data: payload,
          created_at: new Date().toISOString(),
          metadata: { priority: 'high', persistent: true }
        })
      })
      .subscribe()

    this.channels.set(channelName, channel)
  }

  // ========================================
  // 구독 관리
  // ========================================

  public subscribe(
    event: RealtimeEventType,
    callback: (event: RealtimeEvent) => void,
    options?: {
      channel?: string
      filter?: (event: RealtimeEvent) => boolean
    }
  ): string {
    const subscriptionId = `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel: options?.channel || 'default',
      event,
      callback: options?.filter ? 
        (event: RealtimeEvent) => options.filter!(event) && callback(event) : 
        callback,
      active: true
    }

    this.subscriptions.set(subscriptionId, subscription)
    
    log.info(`Realtime subscription created: ${subscriptionId}`, { event, channel: subscription.channel })
    
    return subscriptionId
  }

  public unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    
    if (subscription) {
      subscription.active = false
      this.subscriptions.delete(subscriptionId)
      
      log.info(`Realtime subscription removed: ${subscriptionId}`)
      return true
    }
    
    return false
  }

  public unsubscribeAll(event?: RealtimeEventType): void {
    const toRemove = Array.from(this.subscriptions.entries())
      .filter(([_, sub]) => !event || sub.event === event)
      .map(([id]) => id)

    toRemove.forEach(id => this.unsubscribe(id))
    
    log.info(`Removed ${toRemove.length} subscriptions`, { event })
  }

  // ========================================
  // 이벤트 처리
  // ========================================

  private handleEvent(event: RealtimeEvent) {
    log.debug('Realtime event received:', event)

    // 해당 이벤트 타입에 구독된 모든 콜백 실행
    this.subscriptions.forEach(subscription => {
      if (subscription.active && subscription.event === event.type) {
        try {
          subscription.callback(event)
        } catch (error) {
          log.error('Subscription callback error:', error, {
            subscriptionId: subscription.id,
            eventType: event.type
          })
        }
      }
    })
  }

  public async broadcastEvent(
    channel: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    const targetChannel = this.channels.get(channel)
    
    if (targetChannel) {
      await targetChannel.send({
        type: 'broadcast',
        event,
        ...data
      })
      
      log.info('Event broadcasted:', { channel, event })
    } else {
      log.warn('Channel not found for broadcast:', { channel, event })
    }
  }

  // ========================================
  // 상태 및 유틸리티
  // ========================================

  public getConnectionStatus(): {
    connected: boolean
    channels: number
    subscriptions: number
    reconnectAttempts: number
  } {
    return {
      connected: this.isConnected,
      channels: this.channels.size,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // 간단한 ping/pong 체크
      const testChannel = supabase.channel('health_check')
      await testChannel.subscribe()
      supabase.removeChannel(testChannel)
      
      return true
    } catch (error) {
      log.error('Realtime health check failed:', error)
      return false
    }
  }
}

// ========================================
// 편의 함수들
// ========================================

export const realtimeManager = RealtimeManager.getInstance()

// React Hook 형태의 편의 함수
export function useRealtime(
  event: RealtimeEventType,
  callback: (event: RealtimeEvent) => void,
  deps: React.DependencyList = []
) {
  const React = require('react')
  
  React.useEffect(() => {
    const subscriptionId = realtimeManager.subscribe(event, callback)
    
    return () => {
      realtimeManager.unsubscribe(subscriptionId)
    }
  }, deps)
}

// 특정 이벤트 발생 헬퍼
export async function notifyAchievementUnlock(achievementId: string, userId: string) {
  await realtimeManager.broadcastEvent(
    `user_${userId}`,
    'achievement_unlock',
    {
      achievement_id: achievementId,
      timestamp: new Date().toISOString()
    }
  )
}

export async function notifyNewRecord(recordId: string, coffeeData: any) {
  await realtimeManager.broadcastEvent(
    'community_global',
    'community_update',
    {
      record_id: recordId,
      coffee_data: coffeeData,
      timestamp: new Date().toISOString()
    }
  )
}

export default RealtimeManager