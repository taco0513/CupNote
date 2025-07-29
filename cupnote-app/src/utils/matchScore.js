// Match Score 계산 유틸리티

import { MATCH_SCORE_LEVELS, SCORE_GRADES } from '@/constants/tasting'

/**
 * 동적 Match Score 계산
 * @param {Object} tastingData - 테이스팅 데이터
 * @returns {Object} Match Score 결과
 */
export function calculateMatchScore(tastingData) {
  const { selected_flavors, sensory_expressions, roaster_notes } = tastingData

  if (!roaster_notes) {
    return null
  }

  // 감각 표현이 비어있으면 Level 1, 있으면 Level 2
  const hasSensoryExpressions = sensory_expressions && 
                                Object.values(sensory_expressions).some(arr => arr && arr.length > 0)
  
  const level = hasSensoryExpressions ? MATCH_SCORE_LEVELS.LEVEL2 : MATCH_SCORE_LEVELS.LEVEL1

  if (level === MATCH_SCORE_LEVELS.LEVEL1) {
    // 향미만 평가
    const flavorScore = calculateFlavorMatch(selected_flavors, roaster_notes)
    return {
      level: MATCH_SCORE_LEVELS.LEVEL1,
      score: flavorScore,
      details: {
        flavorScore,
        sensoryScore: null
      }
    }
  } else {
    // 향미 + 감각 평가
    const flavorScore = calculateFlavorMatch(selected_flavors, roaster_notes)
    const sensoryScore = calculateSensoryMatch(sensory_expressions, roaster_notes)
    const finalScore = Math.round((flavorScore * 0.5) + (sensoryScore * 0.5))
    
    return {
      level: MATCH_SCORE_LEVELS.LEVEL2,
      score: finalScore,
      details: {
        flavorScore,
        sensoryScore
      }
    }
  }
}

/**
 * 향미 매칭 계산
 * @param {Array} selectedFlavors - 선택된 향미들
 * @param {string} roasterNotes - 로스터 노트
 * @returns {number} 향미 매칭 점수 (0-100)
 */
export function calculateFlavorMatch(selectedFlavors, roasterNotes) {
  if (!selectedFlavors || selectedFlavors.length === 0) return 0
  if (!roasterNotes) return 0

  const roasterText = roasterNotes.toLowerCase()
  let matchCount = 0

  // 기본 매핑 테이블 (추후 DB에서 가져오기)
  const flavorMapping = {
    '딸기': ['strawberry', 'berry'],
    '체리': ['cherry'],
    '블루베리': ['blueberry', 'berry'],
    '사과': ['apple'],
    '레몬': ['lemon', 'citrus'],
    '오렌지': ['orange', 'citrus'],
    '자몽': ['grapefruit', 'citrus'],
    '초콜릿': ['chocolate', 'cocoa'],
    '캐러멜': ['caramel'],
    '꿀': ['honey'],
    '바닐라': ['vanilla'],
    '꽃': ['floral', 'flower'],
    '아몬드': ['almond', 'nut'],
    '헤이즐넛': ['hazelnut', 'nut']
  }

  selectedFlavors.forEach(flavor => {
    const englishTerms = flavorMapping[flavor] || [flavor]
    const found = englishTerms.some(term => 
      roasterText.includes(term.toLowerCase())
    )
    if (found) matchCount++
  })

  return Math.round((matchCount / selectedFlavors.length) * 100)
}

/**
 * 감각 매칭 계산 (기본 구현)
 * @param {Object} sensoryExpressions - 감각 표현들
 * @param {string} roasterNotes - 로스터 노트
 * @returns {number} 감각 매칭 점수 (0-100)
 */
export function calculateSensoryMatch(sensoryExpressions, roasterNotes) {
  // TODO: 실제 감각 매칭 알고리즘 구현
  // 현재는 기본값 반환
  return 75
}

/**
 * 점수에 따른 등급 반환
 * @param {number} score - 점수 (0-100)
 * @returns {Object} 등급 정보
 */
export function getScoreGrade(score) {
  if (score === null || score === undefined) return null

  for (const [key, grade] of Object.entries(SCORE_GRADES)) {
    if (score >= grade.min && score <= grade.max) {
      return { key, ...grade }
    }
  }
  
  return SCORE_GRADES.POOR
}

/**
 * 매치 스코어 텍스트 생성
 * @param {Object} matchScoreResult - calculateMatchScore 결과
 * @returns {string} 매치 스코어 설명 텍스트
 */
export function generateMatchScoreText(matchScoreResult) {
  if (!matchScoreResult) return '매치 스코어를 계산할 수 없습니다.'

  const { level, score, details } = matchScoreResult
  const grade = getScoreGrade(score)

  let text = `${grade.emoji} ${score}점 (${grade.label})\n\n`

  if (level === MATCH_SCORE_LEVELS.LEVEL1) {
    text += `향미 매칭: ${details.flavorScore}점\n`
    text += '* 감각 표현을 추가하면 더 정확한 매칭이 가능합니다.'
  } else {
    text += `향미 매칭: ${details.flavorScore}점\n`
    text += `감각 매칭: ${details.sensoryScore}점\n`
    text += `최종 점수: (${details.flavorScore} × 0.5) + (${details.sensoryScore} × 0.5) = ${score}점`
  }

  return text
}

/**
 * 매치 스코어 레벨 결정
 * @param {Object} tastingData - 테이스팅 데이터
 * @returns {string} 매치 스코어 레벨
 */
export function determineMatchScoreLevel(tastingData) {
  const { sensory_expressions } = tastingData
  
  if (!sensory_expressions || isEmptySensoryExpressions(sensory_expressions)) {
    return MATCH_SCORE_LEVELS.LEVEL1
  }
  
  return MATCH_SCORE_LEVELS.LEVEL2
}

/**
 * 감각 표현이 비어있는지 확인
 * @param {Object} sensoryExpressions - 감각 표현 객체
 * @returns {boolean} 비어있으면 true
 */
function isEmptySensoryExpressions(sensoryExpressions) {
  if (!sensoryExpressions) return true
  
  return !Object.values(sensoryExpressions).some(arr => 
    Array.isArray(arr) && arr.length > 0
  )
}