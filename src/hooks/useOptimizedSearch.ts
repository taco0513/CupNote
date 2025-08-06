/**
 * 최적화된 검색 훅
 * - 디바운싱
 * - 캐싱
 * - 성능 최적화
 */
'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { SearchResult, SearchFilters } from '../contexts/SearchContext'

// 검색 캐시 타입
interface SearchCache {
  [key: string]: {
    results: SearchResult[]
    timestamp: number
    totalResults: number
  }
}

// 캐시 만료 시간 (5분)
const CACHE_EXPIRY = 5 * 60 * 1000

export function useOptimizedSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchCache = useRef<SearchCache>({})
  const abortController = useRef<AbortController | null>(null)

  // 캐시 키 생성
  const getCacheKey = useCallback((query: string, filters: SearchFilters) => {
    return `${query}_${JSON.stringify(filters)}`
  }, [])

  // 캐시에서 결과 가져오기
  const getCachedResult = useCallback((key: string) => {
    const cached = searchCache.current[key]
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY
    if (isExpired) {
      delete searchCache.current[key]
      return null
    }
    
    return cached
  }, [])

  // 캐시에 결과 저장
  const setCachedResult = useCallback((key: string, results: SearchResult[], totalResults: number) => {
    searchCache.current[key] = {
      results,
      totalResults,
      timestamp: Date.now()
    }
  }, [])

  // 실제 검색 수행
  const performSearch = useCallback(async (
    query: string,
    filters: SearchFilters
  ): Promise<{ results: SearchResult[], totalResults: number }> => {
    // 빈 쿼리 처리
    if (!query.trim()) {
      return { results: [], totalResults: 0 }
    }

    // 캐시 확인
    const cacheKey = getCacheKey(query, filters)
    const cached = getCachedResult(cacheKey)
    if (cached) {
      return cached
    }

    // 이전 요청 취소
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()

    try {
      setIsLoading(true)
      setError(null)

      // 검색 서비스 동적 import
      const { CoffeeRecordService } = await import('../lib/supabase-service')
      
      const searchResults = await CoffeeRecordService.searchRecords(
        query,
        filters,
        { signal: abortController.current.signal }
      )

      // 결과 캐싱
      setCachedResult(cacheKey, searchResults.results, searchResults.totalResults)

      return searchResults
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error
      }
      
      console.error('❌ Search error:', error)
      setError(error.message || '검색 중 오류가 발생했습니다')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [getCacheKey, getCachedResult, setCachedResult])

  // 디바운스된 검색
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout

    return (
      query: string,
      filters: SearchFilters,
      callback: (results: SearchResult[], totalResults: number) => void,
      delay: number = 300
    ) => {
      clearTimeout(timeoutId)
      
      timeoutId = setTimeout(async () => {
        try {
          const { results, totalResults } = await performSearch(query, filters)
          callback(results, totalResults)
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            callback([], 0)
          }
        }
      }, delay)
    }
  }, [performSearch])

  // 캐시 정리
  const clearCache = useCallback(() => {
    searchCache.current = {}
  }, [])

  // 캐시 통계
  const getCacheStats = useCallback(() => {
    const cache = searchCache.current
    const keys = Object.keys(cache)
    const validEntries = keys.filter(key => {
      const entry = cache[key]
      return Date.now() - entry.timestamp < CACHE_EXPIRY
    })

    return {
      totalEntries: keys.length,
      validEntries: validEntries.length,
      hitRate: validEntries.length / Math.max(keys.length, 1)
    }
  }, [])

  return {
    isLoading,
    error,
    performSearch,
    debouncedSearch,
    clearCache,
    getCacheStats
  }
}

export default useOptimizedSearch