'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import EmptyState from './ui/EmptyState'
import FilterPanel, { FilterOptions } from './FilterPanel'
import LazyImage from './LazyImage'
import OptimizedCoffeeCard from './OptimizedCoffeeCard'
import SearchBar from './SearchBar'
import { CardGridSkeleton } from './SkeletonLoader'
import { useNotification } from '../contexts/NotificationContext'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { CacheService } from '../lib/cache-service'
import { mapSupabaseError, logError } from '../lib/error-handler'
import { QueryOptimizer, PaginatedResult } from '../lib/query-optimizer'
import { CoffeeRecord } from '../types/coffee'

const PAGE_SIZE = 20

export default function OptimizedCoffeeList() {
  const [result, setResult] = useState<PaginatedResult<CoffeeRecord>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    hasMore: false
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { error } = useNotification()
  
  // Performance monitoring
  usePerformanceMonitor('OptimizedCoffeeList')

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load records with pagination
  const loadRecords = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Build query filters
      const queryFilters: Record<string, any> = {}
      
      if (filters.mode) queryFilters.mode = filters.mode
      if (filters.rating) queryFilters.rating = filters.rating
      if (filters.hasImages) queryFilters.hasImages = true
      
      if (filters.dateRange === 'custom' && filters.customDateRange) {
        queryFilters.dateFrom = filters.customDateRange.start + 'T00:00:00Z'
        queryFilters.dateTo = filters.customDateRange.end + 'T23:59:59Z'
      } else if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        switch (filters.dateRange) {
          case 'today':
            queryFilters.dateFrom = today.toISOString()
            break
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            queryFilters.dateFrom = weekAgo.toISOString()
            break
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            queryFilters.dateFrom = monthAgo.toISOString()
            break
        }
      }

      // Get paginated data
      const newResult = await QueryOptimizer.getPaginatedRecords({
        page,
        pageSize: PAGE_SIZE,
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc',
        filters: queryFilters
      })

      // Apply client-side filtering for search and tags
      let filteredData = newResult.data
      
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase()
        filteredData = filteredData.filter(
          record =>
            record.coffeeName.toLowerCase().includes(query) ||
            record.roastery?.toLowerCase().includes(query) ||
            record.origin?.toLowerCase().includes(query) ||
            record.taste.toLowerCase().includes(query) ||
            record.memo?.toLowerCase().includes(query) ||
            record.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter(record => {
          if (!record.tags || record.tags.length === 0) return false
          return filters.tags!.every(tag => record.tags!.includes(tag))
        })
      }

      if (append) {
        setResult(prev => ({
          ...newResult,
          data: [...prev.data, ...filteredData]
        }))
      } else {
        setResult({
          ...newResult,
          data: filteredData
        })
      }
    } catch (err: unknown) {
      const mappedError = mapSupabaseError(err)
      logError(mappedError, 'OptimizedCoffeeList.loadRecords')
      error('기록 로드 실패', mappedError.userMessage)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters, debouncedSearchQuery, error])

  // Initial load
  useEffect(() => {
    loadRecords(1)
  }, [loadRecords])

  // Handle record changes
  useEffect(() => {
    const handleRecordChange = (event: CustomEvent) => {
      // Invalidate cache
      QueryOptimizer.invalidateRecordCache(event.detail?.recordId)
      // Reload current page
      loadRecords(result.page)
    }

    window.addEventListener('cupnote-record-added', handleRecordChange as any)
    window.addEventListener('cupnote-record-updated', handleRecordChange as any)
    window.addEventListener('cupnote-record-deleted', handleRecordChange as any)

    return () => {
      window.removeEventListener('cupnote-record-added', handleRecordChange as any)
      window.removeEventListener('cupnote-record-updated', handleRecordChange as any)
      window.removeEventListener('cupnote-record-deleted', handleRecordChange as any)
    }
  }, [result.page, loadRecords])

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && result.hasMore) {
      loadRecords(result.page + 1, true)
    }
  }

  if (loading && result.page === 1) {
    return (
      <div className="space-y-6">
        {/* Search and filter section skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Results info skeleton */}
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        
        {/* Cards skeleton */}
        <CardGridSkeleton count={6} />
      </div>
    )
  }

  if (result.data.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        {/* Search and filter section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </div>

        <EmptyState 
          title={searchQuery || Object.keys(filters).length > 0 ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
          description={searchQuery || Object.keys(filters).length > 0 ? '다른 검색어를 시도해보세요' : '첫 번째 커피를 기록해보세요'}
          variant={searchQuery || Object.keys(filters).length > 0 ? 'search' : 'coffee'}
          illustration={searchQuery || Object.keys(filters).length > 0 ? 'search' : 'coffee-cup'}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and filter section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <SearchBar onSearch={setSearchQuery} />
        </div>
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          총 {result.total}개의 기록
          {searchQuery && ` (검색: "${searchQuery}")`}
        </p>
        {(searchQuery || Object.keys(filters).length > 0) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setFilters({})
              setIsFilterOpen(false)
            }}
            className="text-coffee-600 hover:text-coffee-700 text-sm font-medium"
          >
            모든 필터 초기화
          </button>
        )}
      </div>

      {/* Coffee cards grid - 데스크탑 최적화 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {result.data.map(record => (
          <OptimizedCoffeeCard key={record.id} record={record} />
        ))}
      </div>

      {/* Load more button */}
      {result.hasMore && (
        <div className="text-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                로딩 중...
              </span>
            ) : (
              '더 보기'
            )}
          </button>
        </div>
      )}

      {loadingMore && <CardGridSkeleton count={3} />}
    </div>
  )
}

// Optimized coffee card with lazy loading - 데스크탑 향상
const OptimizedCoffeeCard = ({ record }: { record: CoffeeRecord }) => {
  const getModeDisplay = (mode?: string, tasteMode?: string) => {
    if (mode === 'cafe') return { icon: '☕', text: 'Cafe', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    if (mode === 'homecafe')
      return { icon: '🏠', text: 'HomeCafe', color: 'bg-green-100 text-green-800 border-green-200' }
    if (mode === 'lab')
      return { icon: '🧪', text: 'Lab', color: 'bg-purple-100 text-purple-800 border-purple-200' }

    if (tasteMode === 'simple')
      return { icon: '🌱', text: '편하게', color: 'bg-green-100 text-green-800 border-green-200' }
    return { icon: '🎯', text: '전문가', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  }

  const modeDisplay = getModeDisplay(record.mode, record.tasteMode)

  return (
    <a
      href={`/coffee/${record.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group hover:scale-[1.02] border border-coffee-100"
    >
      {/* Lazy loaded image - 데스크탑에서 더 큰 비율 */}
      {record.images && record.images.length > 0 && (
        <div className="aspect-video lg:aspect-[4/3] relative overflow-hidden">
          <LazyImage
            src={record.images[0]}
            alt={record.coffeeName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* 이미지 오버레이 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className={`${record.images && record.images.length > 0 ? 'p-4 lg:p-5 xl:p-6' : 'p-4 lg:p-5 xl:p-6'}`}>
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg lg:text-xl font-semibold text-coffee-800 flex-1 mr-2 group-hover:text-coffee-900 transition-colors">
              {record.coffeeName}
            </h3>
            <span
              className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium ${modeDisplay.color} whitespace-nowrap border`}
            >
              {modeDisplay.icon} {modeDisplay.text}
            </span>
          </div>
          
          {/* 로스터리, 원산지, 날짜 정보 - 데스크탑에서 더 자세하게 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm lg:text-base text-gray-700 font-medium">
                {record.roastery}
              </p>
              {record.rating && (
                <div className="flex text-sm lg:text-base">
                  {'⭐'.repeat(record.rating)}
                  {'☆'.repeat(5 - record.rating)}
                </div>
              )}
            </div>
            {record.origin && (
              <p className="text-sm text-gray-600">
                🌍 {record.origin}
              </p>
            )}
            <p className="text-sm text-gray-500">
              📅 {record.date}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* 테이스팅 노트 - 데스크탑에서 3줄까지 표시 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              {record.tasteMode === 'simple' ? '내가 느낀 맛' : '테이스팅 노트'}
            </p>
            <p className="text-sm lg:text-base text-gray-600 line-clamp-2 lg:line-clamp-3">
              {record.taste}
            </p>
          </div>

          {/* 태그 표시 - 데스크탑에서만 */}
          {record.tags && record.tags.length > 0 && (
            <div className="hidden lg:flex flex-wrap gap-1.5">
              {record.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 bg-coffee-50 text-coffee-700 text-xs rounded-full border border-coffee-200"
                >
                  #{tag}
                </span>
              ))}
              {record.tags.length > 3 && (
                <span className="px-2 py-0.5 text-coffee-600 text-xs">
                  +{record.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Match Score - 더 프리미엄한 디자인 */}
          {record.matchScore && (
            <div className="pt-3 border-t border-coffee-100">
              <div className="flex items-center gap-3">
                <span className="text-xs lg:text-sm font-medium text-gray-600">Match Score</span>
                <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-coffee-400 to-coffee-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${record.matchScore.overall}%` }}
                  />
                </div>
                <span className="text-sm lg:text-base font-bold text-coffee-700">
                  {record.matchScore.overall}%
                </span>
              </div>
            </div>
          )}

          {/* 추가 정보 - 데스크탑에서만 표시 */}
          <div className="hidden lg:flex items-center justify-between pt-3 border-t border-coffee-100">
            {record.memo && (
              <span className="text-xs text-gray-500">
                📝 메모 있음
              </span>
            )}
            {record.images && record.images.length > 1 && (
              <span className="text-xs text-gray-500">
                📷 {record.images.length}장
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}