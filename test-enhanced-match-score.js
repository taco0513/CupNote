/**
 * Enhanced Match Score v2.0 테스트 스크립트
 * 
 * 1단계 + 3단계 통합 테스트
 */

// 테스트용 모듈 Import (실제 파일에서는 ES modules로 작성됨)
import { 
  calculateEnhancedMatchScore,
  calculateMatchScore
} from './src/lib/match-score.js'

console.log('🧪 Enhanced Match Score v2.0 테스트 시작\n')

// 테스트 케이스 1: 높은 매치 예상 (citrus + chocolate)
console.log('=== 테스트 1: 높은 매치 예상 ===')
const test1 = {
  userFlavors: ['오렌지', '다크초콜릿', '바닐라'],
  userExpressions: ['상큼한', '부드러운', '달콤한'],
  roasterNote: 'bright citrusy with rich chocolate notes and smooth vanilla finish'
}

const result1 = calculateMatchScore(
  test1.userFlavors,
  test1.userExpressions,
  test1.roasterNote,
  true // Enhanced 알고리즘 사용
)

console.log('입력:')
console.log('  향미:', test1.userFlavors)
console.log('  감각:', test1.userExpressions)
console.log('  로스터 노트:', test1.roasterNote)
console.log('\n결과:')
console.log('  최종 점수:', result1.finalScore + '%')
console.log('  향미 점수:', result1.flavorScore + '%')
console.log('  감각 점수:', result1.sensoryScore + '%')
console.log('  메시지:', result1.message)
console.log('  매치된 향미:', result1.matchedFlavors)
console.log('  매치된 감각:', result1.matchedSensory)
console.log('  신뢰도:', result1.confidence ? Math.round(result1.confidence * 100) + '%' : 'N/A')
console.log('  알고리즘:', result1.algorithm)

console.log('\n=== 테스트 2: 중간 매치 예상 ===')
const test2 = {
  userFlavors: ['견과류', '캐러멜', '스모키'],
  userExpressions: ['묵직한', '고소한', '복합적인'],
  roasterNote: 'light floral with delicate sweetness and clean finish'
}

const result2 = calculateMatchScore(
  test2.userFlavors,
  test2.userExpressions,
  test2.roasterNote,
  true
)

console.log('입력:')
console.log('  향미:', test2.userFlavors)
console.log('  감각:', test2.userExpressions)
console.log('  로스터 노트:', test2.roasterNote)
console.log('\n결과:')
console.log('  최종 점수:', result2.finalScore + '%')
console.log('  향미 점수:', result2.flavorScore + '%')
console.log('  감각 점수:', result2.sensoryScore + '%')
console.log('  메시지:', result2.message)
console.log('  매치된 향미:', result2.matchedFlavors)
console.log('  매치된 감각:', result2.matchedSensory)
console.log('  신뢰도:', result2.confidence ? Math.round(result2.confidence * 100) + '%' : 'N/A')

console.log('\n=== 테스트 3: 레거시 vs Enhanced 비교 ===')
const test3 = {
  userFlavors: ['블루베리', '초콜릿향', '꿀'],
  userExpressions: ['발랄한', '크리미한', '균형잡힌'],
  roasterNote: 'berry notes with chocolate undertones and honey sweetness'
}

const legacyResult = calculateMatchScore(
  test3.userFlavors,
  test3.userExpressions,
  test3.roasterNote,
  false // 레거시 알고리즘
)

const enhancedResult = calculateMatchScore(
  test3.userFlavors,
  test3.userExpressions,
  test3.roasterNote,
  true // Enhanced 알고리즘
)

console.log('입력:')
console.log('  향미:', test3.userFlavors)
console.log('  감각:', test3.userExpressions)
console.log('  로스터 노트:', test3.roasterNote)

console.log('\n레거시 결과:')
console.log('  최종 점수:', legacyResult.finalScore + '%')
console.log('  향미/감각:', legacyResult.flavorScore + '%/' + legacyResult.sensoryScore + '%')
console.log('  메시지:', legacyResult.message)

console.log('\nEnhanced 결과:')
console.log('  최종 점수:', enhancedResult.finalScore + '%')
console.log('  향미/감각:', enhancedResult.flavorScore + '%/' + enhancedResult.sensoryScore + '%')
console.log('  메시지:', enhancedResult.message)
console.log('  신뢰도:', enhancedResult.confidence ? Math.round(enhancedResult.confidence * 100) + '%' : 'N/A')

console.log('\n개선 효과:')
console.log('  점수 차이:', (enhancedResult.finalScore - legacyResult.finalScore) + '점')
console.log('  향상률:', Math.round(((enhancedResult.finalScore - legacyResult.finalScore) / legacyResult.finalScore) * 100) + '%')

console.log('\n🎉 Enhanced Match Score v2.0 테스트 완료!')