'use client'

import { useState, useEffect } from 'react'

import MultiTagSearch from './MultiTagSearch'
import { SupabaseStorage } from '../lib/supabase-storage'
import { CoffeeMode, TasteMode } from '../types/coffee'

export interface FilterOptions {
  mode?: CoffeeMode
  tasteMode?: TasteMode
  rating?: number
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'custom'
  customDateRange?: { start: string; end: string }
  sortBy?: 'date' | 'name' | 'rating' | 'matchScore' | 'updated' | 'imageCount'
  sortOrder?: 'asc' | 'desc'
  hasImages?: boolean
  tags?: string[]
}

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  isOpen: boolean
  onToggle: () => void
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}: FilterPanelProps) {
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    // Load all available tags from records
    const loadTags = async () => {
      try {
        const records = await SupabaseStorage.getRecords()
        const tagSet = new Set<string>()
        records.forEach(record => {
          record.tags?.forEach(tag => tagSet.add(tag))
        })
        setAllTags(Array.from(tagSet).sort())
      } catch (error) {
        console.error('Failed to load tags:', error)
      }
    }
    loadTags()
  }, [])

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="relative">
      {/* 필터 토글 버튼 */}
      <button
        onClick={onToggle}
        className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-coffee-200/50 rounded-xl shadow-sm hover:bg-white/90 hover:shadow-md transition-all duration-200"
      >
        <svg
          className="w-5 h-5 text-coffee-600 btn-icon-gap"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
        필터
        {Object.values(filters).some(v => v !== undefined) && (
          <span className="ml-2 px-2 py-1 bg-coffee-600 text-white text-xs rounded-full">
            {Object.values(filters).filter(v => v !== undefined).length}
          </span>
        )}
      </button>

      {/* 필터 패널 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-10 card-padding">
          <div className="space-y-4">
            {/* 모드 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">모드</label>
              <select
                value={filters.mode || ''}
                onChange={e => handleFilterChange('mode', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="">전체</option>
                <option value="cafe">🏪 Cafe</option>
                <option value="homecafe">🏠 HomeCafe</option>
              </select>
            </div>

            {/* 테이스팅 모드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">테이스팅 모드</label>
              <select
                value={filters.tasteMode || ''}
                onChange={e => handleFilterChange('tasteMode', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="">전체</option>
                <option value="simple">🌱 편하게</option>
                <option value="professional">🎯 전문가</option>
              </select>
            </div>

            {/* 평점 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최소 평점</label>
              <select
                value={filters.rating || ''}
                onChange={e =>
                  handleFilterChange(
                    'rating',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="">전체</option>
                <option value="5">⭐⭐⭐⭐⭐ 5점 이상</option>
                <option value="4">⭐⭐⭐⭐ 4점 이상</option>
                <option value="3">⭐⭐⭐ 3점 이상</option>
                <option value="2">⭐⭐ 2점 이상</option>
                <option value="1">⭐ 1점 이상</option>
              </select>
            </div>

            {/* 날짜 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <select
                value={filters.dateRange || 'all'}
                onChange={e => {
                  handleFilterChange('dateRange', e.target.value)
                  if (e.target.value !== 'custom') {
                    handleFilterChange('customDateRange', undefined)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="all">전체</option>
                <option value="today">오늘</option>
                <option value="week">이번 주</option>
                <option value="month">이번 달</option>
                <option value="custom">직접 선택</option>
              </select>
              
              {filters.dateRange === 'custom' && (
                <div className="mt-2 space-y-2">
                  <input
                    type="date"
                    value={filters.customDateRange?.start || ''}
                    onChange={e => 
                      handleFilterChange('customDateRange', {
                        ...filters.customDateRange,
                        start: e.target.value,
                        end: filters.customDateRange?.end || e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="시작일"
                  />
                  <input
                    type="date"
                    value={filters.customDateRange?.end || ''}
                    onChange={e => 
                      handleFilterChange('customDateRange', {
                        ...filters.customDateRange,
                        start: filters.customDateRange?.start || e.target.value,
                        end: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="종료일"
                  />
                </div>
              )}
            </div>

            {/* 정렬 옵션 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy || 'date'}
                  onChange={e => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                >
                  <option value="date">날짜순</option>
                  <option value="name">이름순</option>
                  <option value="rating">평점순</option>
                  <option value="matchScore">매치 스코어순</option>
                  <option value="updated">최근 수정순</option>
                  <option value="imageCount">이미지 개수순</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={e => handleFilterChange('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
              </div>
            </div>

            {/* 이미지 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasImages || false}
                  onChange={e => handleFilterChange('hasImages', e.target.checked || undefined)}
                  className="mr-2 text-coffee-600 focus:ring-coffee-500 rounded"
                />
                <span className="text-sm text-gray-600">이미지가 있는 기록만 표시</span>
              </label>
            </div>

            {/* 태그 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">태그 검색</label>
              <MultiTagSearch
                tags={filters.tags || []}
                onTagsChange={tags => handleFilterChange('tags', tags.length > 0 ? tags : undefined)}
                placeholder="태그 입력 후 Enter"
                allAvailableTags={allTags}
              />
            </div>

            {/* 필터 초기화 */}
            <button
              onClick={() => onFiltersChange({})}
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
