#!/usr/bin/env node

// Test script for Enhanced Match Score v2.0
import { calculateMatchScore } from './src/lib/match-score.js'

// Test cases
const testCases = [
  {
    name: "완벽한 매칭 - 정확한 향미",
    userFlavors: ['초콜릿', '캐러멜', '견과류'],
    userExpressions: ['부드러운', '달콤한', '진한'],
    roasterNote: '다크 초콜릿과 캐러멜의 달콤함, 견과류의 고소함이 느껴지는 부드럽고 진한 커피',
    expectedScore: '>= 90'
  },
  {
    name: "퍼지 매칭 - 오타 허용",
    userFlavors: ['초콜렛', '카라멜', '너트'],
    userExpressions: ['부드러움', '달콤함', '진함'],
    roasterNote: '다크 초콜릿과 캐러멜의 달콤함, 견과류의 고소함이 느껴지는 부드럽고 진한 커피',
    expectedScore: '>= 85'
  },
  {
    name: "관련 향미 매칭",
    userFlavors: ['코코아', '토피', '아몬드'],
    userExpressions: ['크리미한', '단맛', '풍부한'],
    roasterNote: '다크 초콜릿과 캐러멜의 달콤함, 견과류의 고소함이 느껀지는 부드럽고 진한 커피',
    expectedScore: '>= 70'
  },
  {
    name: "부분 매칭",
    userFlavors: ['초콜릿', '꽃향기', '과일'],
    userExpressions: ['밝은', '상큼한', '가벼운'],
    roasterNote: '다크 초콜릿과 캐러멜의 달콤함, 견과류의 고소함이 느껴지는 부드럽고 진한 커피',
    expectedScore: '>= 40'
  },
  {
    name: "반대 특성",
    userFlavors: ['시트러스', '레몬', '산미'],
    userExpressions: ['신맛', '가벼운', '밝은'],
    roasterNote: '다크 초콜릿과 캐러멜의 달콤함, 견과류의 고소함이 느껴지는 부드럽고 진한 커피',
    expectedScore: '< 30'
  },
  {
    name: "한글 음성학적 유사도",
    userFlavors: ['초콜렛', '캐라멜', '견과'],
    userExpressions: ['부드러워', '달콤해', '진해'],
    roasterNote: '다크 초콜릿과 캐러멜의 달콤함, 견과류의 고소함이 느껴지는 부드럽고 진한 커피',
    expectedScore: '>= 80'
  }
]

console.log('=== Enhanced Match Score v2.0 Test ===\n')

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`)
  console.log(`User Flavors: ${testCase.userFlavors.join(', ')}`)
  console.log(`User Expressions: ${testCase.userExpressions.join(', ')}`)
  console.log(`Roaster Note: ${testCase.roasterNote}`)
  
  try {
    // Test with Enhanced algorithm (default)
    const enhancedResult = calculateMatchScore(
      testCase.userFlavors,
      testCase.userExpressions,
      testCase.roasterNote,
      true
    )
    
    // Test with Legacy algorithm for comparison
    const legacyResult = calculateMatchScore(
      testCase.userFlavors,
      testCase.userExpressions,
      testCase.roasterNote,
      false
    )
    
    console.log(`\nEnhanced Score: ${enhancedResult.finalScore}`)
    console.log(`Legacy Score: ${legacyResult.finalScore}`)
    console.log(`Expected: ${testCase.expectedScore}`)
    
    // Check if enhanced is better
    const improvement = enhancedResult.finalScore - legacyResult.finalScore
    console.log(`Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`)
    
    // Validate expectation
    const expected = testCase.expectedScore
    let passed = false
    if (expected.startsWith('>=')) {
      passed = enhancedResult.finalScore >= parseFloat(expected.slice(2))
    } else if (expected.startsWith('<')) {
      passed = enhancedResult.finalScore < parseFloat(expected.slice(1))
    }
    
    console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Message: ${enhancedResult.message}`)
    console.log('-'.repeat(60) + '\n')
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`)
    console.log('-'.repeat(60) + '\n')
  }
})

// Summary
console.log('=== Test Summary ===')
console.log('Enhanced Match Score v2.0 is ready for testing!')
console.log('The algorithm includes:')
console.log('- Fuzzy matching with Levenshtein distance')
console.log('- Korean phonetic similarity')
console.log('- Multi-layer flavor profiles')
console.log('- Context-aware matching')
console.log('- Backward compatibility')