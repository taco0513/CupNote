'use client'

import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
  })

  useEffect(() => {
    // 온라인/오프라인 상태 감지
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }))
    }

    // 연결 속도 감지 (Network Information API)
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        const slowTypes = ['slow-2g', '2g', '3g']

        setNetworkStatus(prev => ({
          ...prev,
          isSlowConnection: slowTypes.includes(connection.effectiveType),
          connectionType: connection.effectiveType || 'unknown',
        }))
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Network Information API 지원 시 연결 정보 업데이트
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateConnectionInfo)
      updateConnectionInfo() // 초기 설정
    }

    // 정리
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  return networkStatus
}

// 재시도 로직을 포함한 fetch 래퍼
export function useRetryFetch() {
  const { isOnline } = useNetworkStatus()

  const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<Response> => {
    let lastError: Error = new Error('네트워크 요청 실패')

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 오프라인 상태에서는 즉시 에러 발생
        if (!isOnline) {
          throw new Error('네트워크 연결을 확인해주세요.')
        }

        const response = await fetch(url, {
          ...options,
          // 타임아웃 설정
          signal: AbortSignal.timeout(15000), // 15초 타임아웃
        })

        // 성공 응답이면 반환
        if (response.ok) {
          return response
        }

        // 4xx 에러는 재시도하지 않음
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`클라이언트 오류: ${response.status} ${response.statusText}`)
        }

        // 5xx 에러는 재시도
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`)
      } catch (error) {
        lastError = error as Error

        // 마지막 시도였다면 에러 발생
        if (attempt === maxRetries) {
          break
        }

        // 재시도 전 대기 (지수 백오프)
        const waitTime = delay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    throw lastError
  }

  return { fetchWithRetry, isOnline }
}

// 연결 상태에 따른 데이터 동기화 훅
export function useDataSync() {
  const { isOnline } = useNetworkStatus()
  const [pendingOperations, setPendingOperations] = useState<Array<() => Promise<void>>>([])

  // 온라인 상태가 되면 대기 중인 작업들을 실행
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      const executePendingOperations = async () => {
        for (const operation of pendingOperations) {
          try {
            await operation()
          } catch (error) {
            console.error('Pending operation failed:', error)
          }
        }
        setPendingOperations([])
      }

      executePendingOperations()
    }
  }, [isOnline, pendingOperations])

  const addPendingOperation = (operation: () => Promise<void>) => {
    setPendingOperations(prev => [...prev, operation])
  }

  return {
    isOnline,
    pendingOperations: pendingOperations.length,
    addPendingOperation,
  }
}
