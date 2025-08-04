/**
 * @document-ref SEARCH_SYSTEM.md#search-interface-design
 * @design-ref DESIGN_SYSTEM.md#component-patterns
 * @compliance-check 2025-08-02 - 검색 페이지 컨텐츠 구현
 */
'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Search, Filter, ArrowLeft, Clock, Sparkles } from 'lucide-react'

import { useSearch } from '../../contexts/SearchContext'
import Navigation from '../Navigation'
import PageLayout from '../ui/PageLayout'
// Animation hooks removed for simpler UI

export default function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, search, clearSearch, getSuggestions, updateFilters } = useSearch()
  
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Animation hooks removed for simpler UI

  // URL에서 초기 쿼리 읽기
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
      search(urlQuery)
    }
  }, [searchParams, search])

  // 검색어 변경 핸들러
  const handleQueryChange = async (value: string) => {
    setQuery(value)
    
    if (value.length >= 2) {
      setShowSuggestions(true)
      await getSuggestions(value)
    } else {
      setShowSuggestions(false)
    }
  }

  // 검색 실행
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      search(searchQuery)
      setShowSuggestions(false)
      
      // URL 업데이트
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('q', searchQuery)
      router.push(newUrl.pathname + newUrl.search)
    }
  }

  // 제안 선택
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  // 검색 기록 클릭
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    handleSearch(historyQuery)
  }

  return (
    <>
      <Navigation showBackButton currentPage="home" />
      <PageLayout showHeader={false}>
        {/* 검색 헤더 */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-coffee-200/30 -mx-4 -mt-6 md:-mx-0 md:-mt-8 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              {/* 검색 입력 */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="커피 이름, 로스터리, 맛 검색..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-coffee-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800 placeholder-coffee-400 transition-all duration-200"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-coffee-400" />
                
                {/* 자동완성 제안 */}
                {showSuggestions && state.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-sm border border-coffee-200/50 rounded-xl shadow-lg z-10 animate-fade-in">
                    {state.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-coffee-50/50 first:rounded-t-xl last:rounded-b-xl transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <Search className="h-4 w-4 text-coffee-400" />
                          <span className="text-coffee-800">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 필터 버튼 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-coffee-500 text-white border-coffee-500 shadow-lg' 
                    : 'bg-white/80 backdrop-blur-sm text-coffee-600 border-coffee-200/50 hover:bg-white/90 hover:shadow-md'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* 필터 패널 */}
            {showFilters && (
              <div className="px-4 pb-4 border-t border-coffee-100/50 animate-slide-in-bottom">
                <div className="pt-4 space-y-4">
                  <h3 className="font-semibold text-coffee-800">필터</h3>
              
              {/* 모드 필터 */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  기록 모드
                </label>
                <div className="flex space-x-2">
                  {['cafe', 'homecafe'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        const currentModes = state.filters.modes || []
                        const newModes = currentModes.includes(mode)
                          ? currentModes.filter(m => m !== mode)
                          : [...currentModes, mode]
                        
                        // 필터 업데이트
                        updateFilters({ modes: newModes })
                      }}
                      className={`px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                        state.filters.modes?.includes(mode)
                          ? 'bg-coffee-500 text-white border-coffee-500 shadow-md'
                          : 'border-coffee-200/50 text-coffee-600 hover:bg-coffee-50/50'
                      }`}
                    >
                      {mode === 'cafe' ? 'Cafe' : 'HomeCafe'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 정렬 */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  정렬
                </label>
                <select 
                  value={state.filters.sortBy}
                  onChange={(e) => updateFilters({ 
                    sortBy: e.target.value as 'relevance' | 'date' | 'rating' 
                  })}
                  className="w-full px-3 py-2 border border-coffee-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white/80 backdrop-blur-sm text-coffee-700"
                >
                  <option value="relevance">관련도순</option>
                  <option value="date">날짜순</option>
                  <option value="rating">평점순</option>
                </select>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {!state.hasSearched ? (
            // 검색 전 상태
            <div className="space-y-6">
              {/* 검색 기록 */}
              {state.searchHistory.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-coffee-800 flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-coffee-500" />
                    <span>최근 검색</span>
                  </h2>
                  <div className="space-y-2">
                    {state.searchHistory.slice(0, 5).map((historyQuery, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(historyQuery)}
                        className="w-full text-left p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-coffee-200/30 hover:border-coffee-300/50 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-coffee-400" />
                          <span className="text-coffee-800">{historyQuery}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 검색어 */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-coffee-800 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-coffee-500" />
                  <span>인기 검색어</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {['케냐', '에티오피아', '콜롬비아', '테라로사', '블루보틀', '산미', '초콜릿'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleHistoryClick(tag)}
                      className="px-3 py-2 bg-coffee-100/80 text-coffee-700 rounded-full text-sm hover:bg-coffee-200/80 transition-all duration-200 backdrop-blur-sm"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : state.isLoading ? (
            // 로딩 상태
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-coffee-200/30 shadow-sm">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-coffee-200/50 rounded w-3/4"></div>
                    <div className="h-3 bg-coffee-200/50 rounded w-1/2"></div>
                    <div className="h-3 bg-coffee-200/50 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : state.error ? (
            // 에러 상태
            <div className="text-center py-12">
              <div className="text-coffee-500 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">검색 중 오류가 발생했습니다</p>
                <p className="text-sm mt-2">{state.error}</p>
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-4 py-2 bg-coffee-500 text-white rounded-xl hover:bg-coffee-600 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                다시 시도
              </button>
            </div>
          ) : state.results.length === 0 ? (
            // 결과 없음
            <div className="text-center py-12">
              <div className="text-coffee-500 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">검색 결과가 없습니다</p>
                <p className="text-sm mt-2">다른 검색어를 시도해보세요</p>
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="px-4 py-2 bg-coffee-100/80 text-coffee-700 rounded-xl hover:bg-coffee-200/80 transition-all duration-200 backdrop-blur-sm"
              >
                필터 조정하기
              </button>
            </div>
          ) : (
            // 검색 결과
            <div className="space-y-4">
              {/* 결과 개수 */}
              <div className="text-sm text-coffee-600">
                <span className="font-semibold text-coffee-500">{state.totalResults}</span>개의 결과
              </div>

              {/* 결과 목록 */}
              <div className="space-y-3">
                {state.results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => router.push(`/coffee/${result.id}`)}
                    className="w-full text-left p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-coffee-200/30 hover:border-coffee-300/50 hover:bg-white/90 transition-all duration-200 hover:shadow-lg animate-fade-in active:scale-[0.99]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 
                            className="font-semibold text-coffee-800"
                            dangerouslySetInnerHTML={{ __html: result.highlightedFields.title || result.title }}
                          />
                          {result.subtitle && (
                            <span className="text-sm text-coffee-500">· {result.subtitle}</span>
                          )}
                        </div>
                        <p 
                          className="text-coffee-600 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: result.highlightedFields.description || result.description }}
                        />
                        
                        {/* 메타데이터 */}
                        <div className="flex items-center space-x-4 mt-3 text-xs text-coffee-500">
                          {result.metadata.date && (
                            <span>{new Date(result.metadata.date).toLocaleDateString('ko-KR')}</span>
                          )}
                          {result.metadata.rating && (
                            <span>⭐ {result.metadata.rating}</span>
                          )}
                          {result.metadata.mode && (
                            <span className="px-2 py-1 bg-coffee-100/80 rounded text-coffee-700">{result.metadata.mode}</span>
                          )}
                        </div>

                        {/* 태그 */}
                        {result.metadata.tags && result.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.metadata.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-coffee-500/10 text-coffee-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* 점수 */}
                      <div className="text-xs text-coffee-400 ml-4">
                        {result.score}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </PageLayout>
    </>
  )
}