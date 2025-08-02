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

// 검색 로직 (임시 구현)
async function performSearch(
  query: string, 
  filters: SearchFilters
): Promise<{ results: SearchResult[]; totalResults: number }> {
  
  // 시뮬레이션을 위한 임시 데이터
  await new Promise(resolve => setTimeout(resolve, 300)) // 300ms 딜레이
  
  // 실제로는 Supabase에서 검색
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'coffee',
      title: '케냐 AA 키리냐가',
      subtitle: '테라로사',
      description: '밝은 산미와 블랙커런트 향이 특징적인 케냐 원두. 시트러스한 뒷맛이 깔끔하게 마무리됩니다.',
      score: 95,
      metadata: {
        date: '2025-01-28',
        rating: 4.5,
        mode: 'HomeCafe',
        tags: ['산미', '과일향', '케냐']
      },
      highlightedFields: {
        title: query ? `<mark>${query}</mark>` : '케냐 AA 키리냐가',
        description: '밝은 산미와 블랙커런트 향이 특징적인 케냐 원두'
      }
    },
    {
      id: '2',
      type: 'coffee',
      title: '콜롬비아 수프리모',
      subtitle: '블루보틀',
      description: '균형잡힌 바디감과 초콜릿 노트. 견과류의 고소함과 카라멜 단맛이 조화롭습니다.',
      score: 88,
      metadata: {
        date: '2025-01-25',
        rating: 4.2,
        mode: 'Cafe',
        tags: ['균형', '초콜릿', '콜롬비아']
      },
      highlightedFields: {
        title: '콜롬비아 수프리모',
        description: '균형잡힌 바디감과 초콜릿 노트'
      }
    },
    {
      id: '3',
      type: 'roastery',
      title: '테라로사',
      subtitle: '로스터리',
      description: '강릉에 본점을 둔 스페셜티 커피 로스터리. 다양한 싱글 오리진과 블렌드를 제공합니다.',
      score: 82,
      metadata: {
        tags: ['로스터리', '강릉', '스페셜티']
      },
      highlightedFields: {
        title: '테라로사',
        description: '강릉에 본점을 둔 스페셜티 커피 로스터리'
      }
    }
  ]

  // 쿼리가 있으면 필터링
  const filteredResults = query 
    ? mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : mockResults

  // 필터 적용
  let finalResults = filteredResults

  if (filters.modes && filters.modes.length > 0) {
    finalResults = finalResults.filter(result => 
      result.metadata.mode && filters.modes!.includes(result.metadata.mode)
    )
  }

  if (filters.ratingRange) {
    finalResults = finalResults.filter(result =>
      result.metadata.rating && 
      result.metadata.rating >= filters.ratingRange!.min &&
      result.metadata.rating <= filters.ratingRange!.max
    )
  }

  // 정렬
  finalResults.sort((a, b) => {
    switch (filters.sortBy) {
      case 'date':
        const dateA = new Date(a.metadata.date || 0).getTime()
        const dateB = new Date(b.metadata.date || 0).getTime()
        return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      
      case 'rating':
        const ratingA = a.metadata.rating || 0
        const ratingB = b.metadata.rating || 0
        return filters.sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB
      
      default: // relevance
        return filters.sortOrder === 'desc' ? b.score - a.score : a.score - b.score
    }
  })

  return {
    results: finalResults,
    totalResults: finalResults.length
  }
}

// 자동완성 로직
async function getSuggestions(partialQuery: string): Promise<string[]> {
  if (partialQuery.length < 2) return []
  
  // 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const mockSuggestions = [
    '케냐 AA 키리냐가',
    '콜롬비아 수프리모',
    '에티오피아 예가체프',
    '과테말라 안티구아',
    '테라로사',
    '블루보틀',
    '스타벅스 리저브'
  ]

  return mockSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(partialQuery.toLowerCase())
  ).slice(0, 5)
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