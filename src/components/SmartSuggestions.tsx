'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Coffee, Clock, Star, TrendingUp } from 'lucide-react'

interface Suggestion {
  id: string
  type: 'coffee' | 'roaster' | 'flavor' | 'brewing' | 'cafe'
  text: string
  frequency?: number
  category?: string
  icon?: React.ReactNode
}

interface SmartSuggestionsProps {
  input: string
  onSelect: (suggestion: Suggestion) => void
  context?: 'coffee' | 'roaster' | 'flavor' | 'brewing' | 'general'
  maxSuggestions?: number
  className?: string
}

// 기본 제안 데이터 (실제로는 사용자 데이터 기반으로 생성)
const baseSuggestions: Suggestion[] = [
  // 커피 관련
  { id: '1', type: 'coffee', text: '에티오피아 예가체프', category: '원두', icon: <Coffee className="w-4 h-4" /> },
  { id: '2', type: 'coffee', text: '콜롬비아 수프리모', category: '원두', icon: <Coffee className="w-4 h-4" /> },
  { id: '3', type: 'coffee', text: '케냐 AA', category: '원두', icon: <Coffee className="w-4 h-4" /> },
  
  // 로스터 관련
  { id: '4', type: 'roaster', text: '테라로사', category: '로스터리', icon: <Star className="w-4 h-4" /> },
  { id: '5', type: 'roaster', text: '블루보틀', category: '로스터리', icon: <Star className="w-4 h-4" /> },
  { id: '6', type: 'roaster', text: '프리츠커피컴퍼니', category: '로스터리', icon: <Star className="w-4 h-4" /> },
  
  // 맛 관련
  { id: '7', type: 'flavor', text: '베리향', category: '향미', frequency: 85 },
  { id: '8', type: 'flavor', text: '초콜릿', category: '향미', frequency: 92 },
  { id: '9', type: 'flavor', text: '견과류', category: '향미', frequency: 78 },
  { id: '10', type: 'flavor', text: '꽃향', category: '향미', frequency: 65 },
  { id: '11', type: 'flavor', text: '시트러스', category: '향미', frequency: 88 },
  
  // 추출 방법
  { id: '12', type: 'brewing', text: 'V60', category: '추출', icon: <Clock className="w-4 h-4" /> },
  { id: '13', type: 'brewing', text: '케멕스', category: '추출', icon: <Clock className="w-4 h-4" /> },
  { id: '14', type: 'brewing', text: '아에로프레스', category: '추출', icon: <Clock className="w-4 h-4" /> },
  { id: '15', type: 'brewing', text: '프렌치프레스', category: '추출', icon: <Clock className="w-4 h-4" /> },
  
  // 카페
  { id: '16', type: 'cafe', text: '스타벅스', category: '카페' },
  { id: '17', type: 'cafe', text: '이디야커피', category: '카페' },
  { id: '18', type: 'cafe', text: '할리스커피', category: '카페' },
]

export default function SmartSuggestions({
  input,
  onSelect,
  context = 'general',
  maxSuggestions = 8,
  className = ''
}: SmartSuggestionsProps) {
  const [userHistory, setUserHistory] = useState<Suggestion[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // 사용자 입력 히스토리 로드 (localStorage에서)
  useEffect(() => {
    const savedHistory = localStorage.getItem('cupnote-suggestion-history')
    if (savedHistory) {
      try {
        setUserHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to parse suggestion history:', e)
      }
    }
  }, [])

  // 입력에 따른 제안 필터링 및 정렬
  const filteredSuggestions = useMemo(() => {
    if (!input.trim()) return []

    const query = input.toLowerCase().trim()
    
    // 컨텍스트에 따른 기본 필터링
    let contextFiltered = baseSuggestions
    if (context !== 'general') {
      contextFiltered = baseSuggestions.filter(s => s.type === context)
    }

    // 텍스트 매칭
    const matched = contextFiltered.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query)
    )

    // 사용자 히스토리와 매칭
    const historyMatched = userHistory.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query)
    )

    // 중복 제거 및 정렬
    const combined = [...historyMatched, ...matched].reduce((acc, current) => {
      const exists = acc.find(item => item.text === current.text)
      if (!exists) {
        acc.push(current)
      }
      return acc
    }, [] as Suggestion[])

    // 정렬: 히스토리 항목 우선, 그 다음 빈도, 마지막으로 알파벳 순
    return combined
      .sort((a, b) => {
        // 히스토리 항목 우선
        const aInHistory = userHistory.some(h => h.text === a.text)
        const bInHistory = userHistory.some(h => h.text === b.text)
        
        if (aInHistory && !bInHistory) return -1
        if (!aInHistory && bInHistory) return 1
        
        // 빈도순
        if (a.frequency && b.frequency) {
          return b.frequency - a.frequency
        }
        
        // 알파벳순
        return a.text.localeCompare(b.text)
      })
      .slice(0, maxSuggestions)
  }, [input, context, userHistory, maxSuggestions])

  // 입력 변화에 따른 가시성 제어
  useEffect(() => {
    setIsVisible(input.trim().length > 0 && filteredSuggestions.length > 0)
  }, [input, filteredSuggestions])

  // 제안 선택 처리
  const handleSelect = (suggestion: Suggestion) => {
    // 사용자 히스토리에 추가
    const updatedHistory = [
      suggestion,
      ...userHistory.filter(h => h.text !== suggestion.text)
    ].slice(0, 20) // 최대 20개까지 저장

    setUserHistory(updatedHistory)
    localStorage.setItem('cupnote-suggestion-history', JSON.stringify(updatedHistory))
    
    onSelect(suggestion)
    setIsVisible(false)
  }

  // 인기 태그 표시 (입력이 없을 때)
  const popularTags = useMemo(() => {
    if (input.trim()) return []
    
    return baseSuggestions
      .filter(s => s.frequency && s.frequency > 80)
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 6)
  }, [input])

  if (!isVisible && popularTags.length === 0) return null

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
        {/* 검색 결과 */}
        {filteredSuggestions.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Search className="w-3 h-3" />
              <span>검색 결과</span>
            </div>
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                {suggestion.icon}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.text}
                  </div>
                  {suggestion.category && (
                    <div className="text-xs text-gray-500">
                      {suggestion.category}
                    </div>
                  )}
                </div>
                {suggestion.frequency && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{suggestion.frequency}%</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* 인기 태그 */}
        {popularTags.length > 0 && (
          <div className="p-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <TrendingUp className="w-3 h-3" />
              <span>인기 태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleSelect(tag)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {tag.text}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 빈 상태 */}
        {filteredSuggestions.length === 0 && input.trim() && (
          <div className="p-4 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">'{input}'에 대한 제안을 찾을 수 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">직접 입력해서 새로운 항목을 만들어보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 자동완성 입력 필드 컴포넌트
interface SmartInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  context?: 'coffee' | 'roaster' | 'flavor' | 'brewing' | 'general'
  className?: string
}

export function SmartInput({
  value,
  onChange,
  placeholder = '검색하거나 입력하세요...',
  context = 'general',
  className = ''
}: SmartInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    onChange(suggestion.text)
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      
      {showSuggestions && (
        <SmartSuggestions
          input={value}
          onSelect={handleSuggestionSelect}
          context={context}
          className="absolute inset-x-0 top-full"
        />
      )}
    </div>
  )
}