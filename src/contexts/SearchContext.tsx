/**
 * @document-ref SEARCH_SYSTEM.md#search-algorithm
 * @design-ref DESIGN_SYSTEM.md#state-management
 * @compliance-check 2025-08-02 - 검색 상태 관리 컨텍스트
 */
'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

// 검색 결과 타입
export interface SearchResult {
  id: string
  type: 'coffee' | 'roastery' | 'location'
  title: string
  subtitle?: string
  description: string
  score: number
  metadata: {
    date?: string
    rating?: number
    mode?: string
    tags?: string[]
  }
  highlightedFields: {
    title?: string
    description?: string
  }
}

// 필터 타입
export interface SearchFilters {
  dateRange?: {
    start: string
    end: string
  }
  ratingRange?: {
    min: number
    max: number
  }
  modes?: string[]
  tags?: string[]
  sortBy: 'relevance' | 'date' | 'rating'
  sortOrder: 'desc' | 'asc'
}

// 검색 상태
interface SearchState {
  query: string
  results: SearchResult[]
  filters: SearchFilters
  isLoading: boolean
  hasSearched: boolean
  totalResults: number
  searchHistory: string[]
  suggestions: string[]
  error: string | null
}

// 검색 액션
type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_RESULTS'; payload: { results: SearchResult[]; totalResults: number } }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'SET_SUGGESTIONS'; payload: string[] }
  | { type: 'CLEAR_SEARCH' }

// 초기 상태
const initialState: SearchState = {
  query: '',
  results: [],
  filters: {
    sortBy: 'relevance',
    sortOrder: 'desc'
  },
  isLoading: false,
  hasSearched: false,
  totalResults: 0,
  searchHistory: [],
  suggestions: [],
  error: null
}

// 리듀서
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
        error: null
      }
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload.results,
        totalResults: action.payload.totalResults,
        isLoading: false,
        hasSearched: true,
        error: null
      }
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case 'ADD_TO_HISTORY':
      const newHistory = [action.payload, ...state.searchHistory.filter(h => h !== action.payload)].slice(0, 10)
      return {
        ...state,
        searchHistory: newHistory
      }
    
    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: action.payload
      }
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        query: '',
        results: [],
        hasSearched: false,
        totalResults: 0,
        error: null
      }
    
    default:
      return state
  }
}

// 컨텍스트 타입
interface SearchContextType {
  state: SearchState
  search: (query: string) => Promise<void>
  updateFilters: (filters: Partial<SearchFilters>) => void
  clearSearch: () => void
  getSuggestions: (partialQuery: string) => Promise<void>
}

// 컨텍스트 생성
const SearchContext = createContext<SearchContextType | undefined>(undefined)

import { CoffeeRecordService } from '../lib/supabase-service'

// 검색 로직 (Supabase 연동)
async function performSearch(
  query: string, 
  filters: SearchFilters
): Promise<{ results: SearchResult[]; totalResults: number }> {
  
  try {
    // Supabase에서 실제 검색
    const searchFilters = {
      modes: filters.modes,
      ratingRange: filters.ratingRange,
      dateRange: filters.dateRange,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      limit: 20 // 한 번에 20개씩 로드
    }

    const records = await CoffeeRecordService.searchRecords(query, searchFilters)
    
    // CoffeeRecord를 SearchResult로 변환
    const results: SearchResult[] = records.map(record => {
      // 검색어 하이라이트
      const highlightQuery = (text: string, searchQuery: string) => {
        if (!searchQuery || !text) return text
        const regex = new RegExp(`(${searchQuery})`, 'gi')
        return text.replace(regex, '<mark>$1</mark>')
      }

      // 관련도 점수 계산 (match_score 활용)
      let score = record.match_score || 50
      
      // 검색어와의 매칭 정도에 따라 점수 조정
      if (query && query.trim()) {
        const lowerQuery = query.toLowerCase()
        const title = record.coffee_name?.toLowerCase() || ''
        const roastery = record.roastery?.toLowerCase() || ''
        const description = `${record.taste_notes || ''} ${record.personal_notes || ''}`.toLowerCase()
        
        if (title.includes(lowerQuery)) score += 20
        if (roastery.includes(lowerQuery)) score += 15
        if (description.includes(lowerQuery)) score += 10
        
        // 정확한 매칭에 보너스
        if (title === lowerQuery || roastery === lowerQuery) score += 30
      }

      // 최근성 보너스
      const createdDate = new Date(record.created_at)
      const now = new Date()
      const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysDiff <= 30) score += 10
      else if (daysDiff <= 90) score += 5

      // 태그 생성 (자동)
      const tags: string[] = []
      if (record.origin) tags.push(record.origin)
      if (record.roasting_level) tags.push(record.roasting_level)
      if (record.brewing_method) tags.push(record.brewing_method)

      return {
        id: record.id.toString(),
        type: 'coffee' as const,
        title: record.coffee_name || '알 수 없는 커피',
        subtitle: record.roastery || undefined,
        description: record.taste_notes || record.personal_notes || '기록된 노트가 없습니다.',
        score: Math.min(100, Math.max(0, Math.round(score))),
        metadata: {
          date: record.created_at,
          rating: record.rating || undefined,
          mode: record.mode,
          tags
        },
        highlightedFields: {
          title: query ? highlightQuery(record.coffee_name || '', query) : undefined,
          description: query ? highlightQuery(
            record.taste_notes || record.personal_notes || '', 
            query
          ) : undefined
        }
      }
    })

    // 점수순 정렬 (관련도순일 때)
    if (filters.sortBy === 'relevance') {
      results.sort((a, b) => filters.sortOrder === 'desc' ? b.score - a.score : a.score - b.score)
    }

    return {
      results,
      totalResults: results.length
    }
  } catch (error) {
    console.error('Search error:', error)
    throw new Error('검색 중 오류가 발생했습니다.')
  }
}

// 자동완성 로직 (Supabase 연동)
async function getSuggestions(partialQuery: string): Promise<string[]> {
  if (partialQuery.length < 2) return []
  
  try {
    return await CoffeeRecordService.getSearchSuggestions(partialQuery, 5)
  } catch (error) {
    console.error('Suggestions error:', error)
    // 에러 발생시 빈 배열 반환
    return []
  }
}

// 프로바이더 컴포넌트
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState)

  // 검색 기록 로드 (초기화시)
  useEffect(() => {
    const savedHistory = localStorage.getItem('cupnote-search-history')
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        history.forEach((query: string) => {
          dispatch({ type: 'ADD_TO_HISTORY', payload: query })
        })
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }, [])

  // 검색 기록 저장
  useEffect(() => {
    if (state.searchHistory.length > 0) {
      localStorage.setItem('cupnote-search-history', JSON.stringify(state.searchHistory))
    }
  }, [state.searchHistory])

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: 'CLEAR_SEARCH' })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const { results, totalResults } = await performSearch(query, state.filters)
      dispatch({ type: 'SET_RESULTS', payload: { results, totalResults } })
      dispatch({ type: 'ADD_TO_HISTORY', payload: query })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '검색 중 오류가 발생했습니다.' })
    }
  }, [state.filters])

  const updateFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
    
    // 필터 변경시 자동 재검색
    if (state.query && state.hasSearched) {
      search(state.query)
    }
  }, [state.query, state.hasSearched, search])

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' })
  }, [])

  const getSuggestionsCallback = useCallback(async (partialQuery: string) => {
    try {
      const suggestions = await getSuggestions(partialQuery)
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions })
    } catch (error) {
      console.error('Failed to get suggestions:', error)
    }
  }, [])

  const value: SearchContextType = {
    state,
    search,
    updateFilters,
    clearSearch,
    getSuggestions: getSuggestionsCallback
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

// 훅
export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}