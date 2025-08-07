'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import FilterPanel, { FilterOptions } from './FilterPanel'
import SearchBar from './SearchBar'
import { useNotification } from '../contexts/NotificationContext'
import { mapSupabaseError, logError } from '../lib/error-handler'
import { SupabaseStorage } from '../lib/supabase-storage'
import { CoffeeRecord } from '../types/coffee'

export default function CoffeeList() {
  const [records, setRecords] = useState<CoffeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { error } = useNotification()

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true)
      // Supabase에서 기록 로드
      const data = await SupabaseStorage.getRecords()
      setRecords(data)
    } catch (err: unknown) {
      const mappedError = mapSupabaseError(err)
      logError(mappedError, 'CoffeeList.loadRecords')
      error('기록 로드 실패', mappedError.userMessage)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // 외부에서 새 기록 추가시 목록 새로고침
  useEffect(() => {
    const handleRecordChange = () => {
      loadRecords()
    }

    // Supabase 변경사항 감지를 위한 커스텀 이벤트
    window.addEventListener('cupnote-record-added', handleRecordChange)
    window.addEventListener('cupnote-record-updated', handleRecordChange)
    window.addEventListener('cupnote-record-deleted', handleRecordChange)

    return () => {
      window.removeEventListener('cupnote-record-added', handleRecordChange)
      window.removeEventListener('cupnote-record-updated', handleRecordChange)
      window.removeEventListener('cupnote-record-deleted', handleRecordChange)
    }
  }, [loadRecords])

  // 검색 및 필터링된 결과
  const filteredRecords = useMemo(() => {
    let filtered = [...records]

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        record =>
          record.coffeeName.toLowerCase().includes(query) ||
          record.roastery?.toLowerCase().includes(query) ||
          record.origin?.toLowerCase().includes(query) ||
          record.taste.toLowerCase().includes(query) ||
          record.memo?.toLowerCase().includes(query) ||
          record.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 모드 필터링
    if (filters.mode) {
      filtered = filtered.filter(record => record.mode === filters.mode)
    }

    // 테이스팅 모드 필터링
    if (filters.tasteMode) {
      filtered = filtered.filter(record => record.tasteMode === filters.tasteMode)
    }

    // 평점 필터링
    if (filters.rating) {
      filtered = filtered.filter(record => (record.rating || 0) >= filters.rating!)
    }

    // 날짜 범위 필터링
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.createdAt)

        switch (filters.dateRange) {
          case 'today':
            return recordDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return recordDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            return recordDate >= monthAgo
          case 'custom':
            if (filters.customDateRange) {
              const start = new Date(filters.customDateRange.start)
              const end = new Date(filters.customDateRange.end)
              end.setHours(23, 59, 59, 999) // End of day
              return recordDate >= start && recordDate <= end
            }
            return true
          default:
            return true
        }
      })
    }

    // 이미지 필터링
    if (filters.hasImages) {
      filtered = filtered.filter(record => record.images && record.images.length > 0)
    }

    // 태그 필터링
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(record => {
        if (!record.tags || record.tags.length === 0) return false
        // Check if record has all the selected tags
        return filters.tags!.every(tag => record.tags!.includes(tag))
      })
    }

    // 정렬
    const sortBy = filters.sortBy || 'date'
    const sortOrder = filters.sortOrder || 'desc'

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.coffeeName.localeCompare(b.coffeeName)
          break
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0)
          break
        case 'matchScore':
          comparison = (a.matchScore?.overall || 0) - (b.matchScore?.overall || 0)
          break
        case 'updated':
          const aUpdated = a.updatedAt || a.createdAt
          const bUpdated = b.updatedAt || b.createdAt
          comparison = new Date(aUpdated).getTime() - new Date(bUpdated).getTime()
          break
        case 'imageCount':
          comparison = (a.images?.length || 0) - (b.images?.length || 0)
          break
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [records, searchQuery, filters])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">☕</div>
        <p className="text-gray-600 text-lg mb-2">아직 기록된 커피가 없어요</p>
        <p className="text-gray-500">첫 커피를 기록해보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 섹션 */}
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

      {/* 결과 개수 표시 */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          총 {filteredRecords.length}개의 기록
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

      {/* 커피 카드 목록 */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg mb-2">검색 결과가 없습니다</p>
          <p className="text-gray-500">다른 검색어나 필터를 시도해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredRecords.map(record => (
            <CoffeeCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

function CoffeeCard({ record }: { record: CoffeeRecord }) {
  const router = useRouter()
  
  const getModeDisplay = (mode?: string, tasteMode?: string) => {
    if (mode === 'cafe') return { icon: '🏪', text: 'Cafe', color: 'bg-blue-100 text-blue-800' }
    if (mode === 'homecafe')
      return { icon: '🏠', text: 'HomeCafe', color: 'bg-green-100 text-green-800' }

    // 기본 모드 (tasteMode 기반)
    if (tasteMode === 'simple')
      return { icon: '🌱', text: '편하게', color: 'bg-green-100 text-green-800' }
    return { icon: '🎯', text: '전문가', color: 'bg-blue-100 text-blue-800' }
  }

  const modeDisplay = getModeDisplay(record.mode, record.tasteMode)

  return (
    <div
      onClick={() => router.push(`/records/${record.id}`)}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
    >
      {/* 이미지가 있으면 표시 */}
      {record.images && record.images.length > 0 && (
        <div className="aspect-video relative">
          <img
            src={record.images[0]}
            alt={record.coffeeName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`${record.images && record.images.length > 0 ? 'p-4 md:p-6' : 'p-4 md:p-6'}`}>
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-coffee-800 flex-1 mr-2">
              {record.coffeeName}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${modeDisplay.color} whitespace-nowrap`}
            >
              {modeDisplay.icon} {modeDisplay.text}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {record.roastery} · {record.date}
            </p>
            {record.rating && (
              <div className="flex text-sm">
                {'⭐'.repeat(record.rating)}
                {'☆'.repeat(5 - record.rating)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {record.tasteMode === 'simple' ? '내가 느낀 맛' : '테이스팅 노트'}
            </p>
            <p className="text-gray-600 line-clamp-2">
              {(() => {
                // Handle different formats of taste data
                if (!record.taste) return '기록 없음'
                
                // If it's already a string
                if (typeof record.taste === 'string') {
                  // Try to parse if it looks like JSON
                  if (record.taste.startsWith('[') || record.taste.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(record.taste)
                      
                      // Handle complex flavor object structure
                      if (parsed.flavors && Array.isArray(parsed.flavors)) {
                        // Extract flavor names from complex structure
                        const flavorNames = parsed.flavors.map((f: any) => 
                          typeof f === 'string' ? f : f.name || f.flavor || ''
                        ).filter(Boolean)
                        return flavorNames.length > 0 ? flavorNames.join(', ') : '기록 없음'
                      }
                      
                      // Handle simple array
                      if (Array.isArray(parsed)) {
                        // Check if array contains objects or strings
                        const items = parsed.map((item: any) => 
                          typeof item === 'string' ? item : item.name || item.flavor || ''
                        ).filter(Boolean)
                        return items.length > 0 ? items.join(', ') : '기록 없음'
                      }
                      
                      // If it's an object with selectedFlavors property
                      if (parsed.selectedFlavors && Array.isArray(parsed.selectedFlavors)) {
                        return parsed.selectedFlavors.join(', ')
                      }
                      
                      // If parsed but can't find flavor data, return default message
                      return '맛 정보를 불러올 수 없음'
                    } catch {
                      // Not valid JSON, but don't show raw JSON to user
                      return '맛 정보를 불러올 수 없음'
                    }
                  }
                  // Not JSON, return as is
                  return record.taste
                }
                
                // If it's an array
                if (Array.isArray(record.taste)) {
                  const items = record.taste.map((item: any) => 
                    typeof item === 'string' ? item : item.name || item.flavor || ''
                  ).filter(Boolean)
                  return items.length > 0 ? items.join(', ') : '기록 없음'
                }
                
                // If it's an object
                if (typeof record.taste === 'object' && record.taste !== null) {
                  // Handle flavor object structure
                  if ('flavors' in record.taste && Array.isArray(record.taste.flavors)) {
                    const flavorNames = record.taste.flavors.map((f: any) => 
                      typeof f === 'string' ? f : f.name || f.flavor || ''
                    ).filter(Boolean)
                    return flavorNames.length > 0 ? flavorNames.join(', ') : '기록 없음'
                  }
                  
                  // Handle selectedFlavors property
                  if ('selectedFlavors' in record.taste && Array.isArray(record.taste.selectedFlavors)) {
                    return record.taste.selectedFlavors.join(', ')
                  }
                  
                  // If object but can't extract meaningful data, return default
                  return '맛 정보를 불러올 수 없음'
                }
                
                // Fallback - never show raw data
                return '맛 정보를 불러올 수 없음'
              })()}
            </p>
          </div>

          {record.origin && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">원산지</p>
              <p className="text-gray-600 text-sm">{record.origin}</p>
            </div>
          )}

          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {record.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                >
                  #{tag}
                </span>
              ))}
              {record.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                  +{record.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {record.memo && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 italic line-clamp-1">{record.memo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
