/**
 * Fuzzy Matching Utilities for Enhanced Match Score System
 * 
 * 1단계: 고급 텍스트 매칭
 * - Levenshtein distance 기반 유사도
 * - 한글 음성학적 유사성  
 * - 컨텍스트 기반 매칭 강화
 * 
 * @version 2.0.0
 * @since 2025-08-02
 */

export interface FuzzyMatchResult {
  keyword: string
  userSelection: string
  similarity: number      // 0-1 유사도 점수
  confidence: number      // 매칭 신뢰도
  matchType: 'exact' | 'fuzzy' | 'phonetic' | 'contextual'
  explanation: string     // 매칭 이유 설명
}

/**
 * Levenshtein Distance 계산 (편집 거리)
 */
export const calculateLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion  
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * 문자열 유사도 계산 (0-1 범위)
 */
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1.0
  if (str1.length === 0 || str2.length === 0) return 0.0
  
  const distance = calculateLevenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  const maxLength = Math.max(str1.length, str2.length)
  
  return 1 - (distance / maxLength)
}

/**
 * 한글 자모 분해 유틸리티
 */
const decomposeHangul = (char: string): string[] => {
  const code = char.charCodeAt(0) - 0xAC00
  if (code < 0 || code > 11171) return [char] // 한글이 아닌 경우
  
  const initial = Math.floor(code / 588)
  const medial = Math.floor((code % 588) / 28)
  const final = code % 28
  
  const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
  const medials = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
  const finals = ['','ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
  
  return [initials[initial], medials[medial], finals[final]].filter(Boolean)
}

/**
 * 한글 음성학적 유사성 계산
 */
export const calculatePhoneticSimilarity = (korean1: string, korean2: string): number => {
  if (korean1 === korean2) return 1.0
  
  // 각 문자를 자모로 분해
  const decomposed1 = korean1.split('').flatMap(decomposeHangul)
  const decomposed2 = korean2.split('').flatMap(decomposeHangul)
  
  // 자모 레벨에서 유사성 계산
  const jamo1 = decomposed1.join('')
  const jamo2 = decomposed2.join('')
  
  return calculateStringSimilarity(jamo1, jamo2)
}

/**
 * 부분 문자열 매칭 점수
 */
export const calculateSubstringMatch = (target: string, query: string): number => {
  const targetLower = target.toLowerCase()
  const queryLower = query.toLowerCase()
  
  if (targetLower.includes(queryLower)) {
    // 완전 포함: 길이 비율로 점수 계산
    return Math.min(1.0, queryLower.length / targetLower.length + 0.5)
  }
  
  if (queryLower.includes(targetLower)) {
    // 역방향 포함
    return Math.min(1.0, targetLower.length / queryLower.length + 0.3)
  }
  
  return 0
}

/**
 * 컨텍스트 기반 보너스 점수
 */
export const calculateContextBonus = (
  keyword: string, 
  userSelection: string, 
  roasterNote: string
): number => {
  let bonus = 0
  
  // 같은 문장에서 함께 나타나는 경우
  const sentences = roasterNote.split(/[.!?]/)
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(keyword.toLowerCase()) && 
        sentence.toLowerCase().includes(userSelection.toLowerCase())) {
      bonus += 0.2
    }
  }
  
  // 인접한 단어들과의 관계
  const words = roasterNote.toLowerCase().split(/\s+/)
  const keywordIndex = words.findIndex(word => word.includes(keyword.toLowerCase()))
  const selectionIndex = words.findIndex(word => word.includes(userSelection.toLowerCase()))
  
  if (keywordIndex >= 0 && selectionIndex >= 0) {
    const distance = Math.abs(keywordIndex - selectionIndex)
    if (distance <= 2) {
      bonus += 0.15 * (3 - distance) / 3 // 가까울수록 높은 점수
    }
  }
  
  return Math.min(0.3, bonus) // 최대 30% 보너스
}

/**
 * 종합 유사도 계산
 */
export const calculateOverallSimilarity = (
  keyword: string,
  userSelection: string,
  roasterNote: string = ''
): FuzzyMatchResult => {
  
  // 1. 정확 매칭 체크
  if (keyword.toLowerCase() === userSelection.toLowerCase()) {
    return {
      keyword,
      userSelection,
      similarity: 1.0,
      confidence: 1.0,
      matchType: 'exact',
      explanation: '정확히 일치'
    }
  }
  
  // 2. 부분 문자열 매칭
  const substringScore = calculateSubstringMatch(keyword, userSelection)
  if (substringScore > 0.7) {
    return {
      keyword,
      userSelection,
      similarity: substringScore,
      confidence: 0.9,
      matchType: 'exact',
      explanation: '부분 문자열 매칭'
    }
  }
  
  // 3. 편집 거리 기반 유사도
  const stringSimilarity = calculateStringSimilarity(keyword, userSelection)
  
  // 4. 한글 음성학적 유사도
  const phoneticSimilarity = calculatePhoneticSimilarity(keyword, userSelection)
  
  // 5. 컨텍스트 보너스
  const contextBonus = roasterNote ? calculateContextBonus(keyword, userSelection, roasterNote) : 0
  
  // 6. 종합 점수 계산
  const finalSimilarity = Math.min(1.0, 
    stringSimilarity * 0.5 + 
    phoneticSimilarity * 0.3 + 
    contextBonus * 0.2
  )
  
  // 7. 매칭 타입 결정
  let matchType: FuzzyMatchResult['matchType'] = 'fuzzy'
  let explanation = '퍼지 매칭'
  
  if (phoneticSimilarity > stringSimilarity) {
    matchType = 'phonetic'
    explanation = '음성학적 유사성'
  }
  
  if (contextBonus > 0.1) {
    matchType = 'contextual'
    explanation = '문맥적 매칭'
  }
  
  // 8. 신뢰도 계산
  const confidence = Math.min(1.0, finalSimilarity + (contextBonus * 0.5))
  
  return {
    keyword,
    userSelection,
    similarity: finalSimilarity,
    confidence,
    matchType,
    explanation
  }
}

/**
 * 다중 키워드에 대한 최적 매칭 찾기
 */
export const findBestMatches = (
  keywords: string[],
  userSelections: string[],
  roasterNote: string = '',
  threshold: number = 0.6
): FuzzyMatchResult[] => {
  
  const results: FuzzyMatchResult[] = []
  const usedSelections = new Set<string>()
  
  // 각 키워드에 대해 최적 매칭 찾기
  for (const keyword of keywords) {
    let bestMatch: FuzzyMatchResult | null = null
    
    for (const selection of userSelections) {
      if (usedSelections.has(selection)) continue
      
      const match = calculateOverallSimilarity(keyword, selection, roasterNote)
      
      if (match.similarity >= threshold && 
          (!bestMatch || match.similarity > bestMatch.similarity)) {
        bestMatch = match
      }
    }
    
    if (bestMatch) {
      results.push(bestMatch)
      usedSelections.add(bestMatch.userSelection)
    }
  }
  
  return results.sort((a, b) => b.similarity - a.similarity)
}

/**
 * 매칭 결과 디버깅 정보
 */
export const getMatchingDebugInfo = (results: FuzzyMatchResult[]): string => {
  if (results.length === 0) return '매칭된 항목이 없습니다.'
  
  return results.map(result => 
    `${result.userSelection} → ${result.keyword} (${Math.round(result.similarity * 100)}%, ${result.explanation})`
  ).join('\n')
}