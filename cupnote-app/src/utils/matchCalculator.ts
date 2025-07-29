// 매치 점수 계산 유틸리티
export interface TastingSelections {
  flavors: string[]
  acidity: number
  sweetness: number
  body: number
  aftertaste: number
}

export interface RoasterNotes {
  flavors: string[]
  acidity: number
  sweetness: number
  body: number
  aftertaste: number
}

export interface MatchResult {
  totalScore: number
  flavorScore: number
  sensoryScore: number
  details: {
    flavorMatches: string[]
    sensoryDifferences: {
      acidity: number
      sweetness: number
      body: number
      aftertaste: number
    }
  }
}

export function calculateMatchScore(
  userSelections: TastingSelections,
  roasterNotes: RoasterNotes
): number {
  const result = calculateDetailedMatch(userSelections, roasterNotes)
  return result.totalScore
}

export function calculateDetailedMatch(
  userSelections: TastingSelections,
  roasterNotes: RoasterNotes
): MatchResult {
  // 향미 매칭 점수 (40%)
  const flavorResult = calculateFlavorMatch(userSelections.flavors, roasterNotes.flavors)
  const flavorScore = flavorResult.score * 0.4
  
  // 감각 매칭 점수 (60%)
  const sensoryResult = calculateSensoryMatch(
    {
      acidity: userSelections.acidity,
      sweetness: userSelections.sweetness,
      body: userSelections.body,
      aftertaste: userSelections.aftertaste
    },
    {
      acidity: roasterNotes.acidity,
      sweetness: roasterNotes.sweetness,
      body: roasterNotes.body,
      aftertaste: roasterNotes.aftertaste
    }
  )
  const sensoryScore = sensoryResult.score * 0.6
  
  return {
    totalScore: Math.round(flavorScore + sensoryScore),
    flavorScore: Math.round(flavorResult.score),
    sensoryScore: Math.round(sensoryResult.score),
    details: {
      flavorMatches: flavorResult.matches,
      sensoryDifferences: sensoryResult.differences
    }
  }
}

function calculateFlavorMatch(
  userFlavors: string[],
  roasterFlavors: string[]
): { score: number; matches: string[] } {
  if (roasterFlavors.length === 0) {
    return { score: 0, matches: [] }
  }
  
  const matches = userFlavors.filter(flavor => 
    roasterFlavors.includes(flavor)
  )
  
  const precision = matches.length / Math.max(userFlavors.length, 1)
  const recall = matches.length / roasterFlavors.length
  
  // F1 Score 변형 사용
  let score = 0
  if (precision + recall > 0) {
    score = (2 * precision * recall / (precision + recall)) * 100
  }
  
  return { score, matches }
}

function calculateSensoryMatch(
  userSensory: Record<string, number>,
  roasterSensory: Record<string, number>
): { score: number; differences: Record<string, number> } {
  const attributes = ['acidity', 'sweetness', 'body', 'aftertaste']
  let totalDifference = 0
  const differences: Record<string, number> = {}
  
  attributes.forEach(attr => {
    const diff = Math.abs(userSensory[attr] - roasterSensory[attr])
    differences[attr] = userSensory[attr] - roasterSensory[attr]
    // 5점 척도에서 최대 차이는 4
    totalDifference += (1 - diff / 4)
  })
  
  const score = (totalDifference / attributes.length) * 100
  
  return { score, differences }
}

// 레벨 계산 함수
export function calculateUserLevel(averageScore: number, tastingCount: number): {
  level: string
  title: string
  nextLevel: string
  progress: number
} {
  const levels = [
    { threshold: 0, level: 'beginner', title: '커피 입문자' },
    { threshold: 30, level: 'amateur', title: '커피 애호가' },
    { threshold: 50, level: 'intermediate', title: '커피 감별사' },
    { threshold: 70, level: 'advanced', title: '커피 전문가' },
    { threshold: 85, level: 'expert', title: '커피 마스터' },
    { threshold: 95, level: 'master', title: '커피 그랜드마스터' }
  ]
  
  // 테이스팅 횟수도 고려한 종합 점수
  const experienceBonus = Math.min(tastingCount * 0.1, 10) // 최대 10점 보너스
  const totalScore = averageScore + experienceBonus
  
  let currentLevel = levels[0]
  let nextLevel = levels[1]
  
  for (let i = 0; i < levels.length; i++) {
    if (totalScore >= levels[i].threshold) {
      currentLevel = levels[i]
      nextLevel = levels[i + 1] || levels[i]
    }
  }
  
  const progress = nextLevel === currentLevel 
    ? 100 
    : ((totalScore - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevel: nextLevel.title,
    progress: Math.round(progress)
  }
}

// 향미 카테고리 분류
export const flavorCategories = {
  fruity: ['berry', 'citrus', 'tropical', 'stone fruit', 'apple', 'grape'],
  floral: ['jasmine', 'rose', 'lavender', 'chamomile', 'hibiscus'],
  sweet: ['chocolate', 'caramel', 'honey', 'vanilla', 'brown sugar', 'molasses'],
  nutty: ['almond', 'hazelnut', 'walnut', 'peanut', 'cashew'],
  spicy: ['cinnamon', 'clove', 'pepper', 'cardamom', 'ginger'],
  herbal: ['tea', 'mint', 'grass', 'tobacco', 'sage'],
  other: ['woody', 'earthy', 'smoky', 'butter', 'creamy']
}

// 향미 추천 함수
export function recommendFlavors(
  selectedFlavors: string[],
  allAvailableFlavors: string[]
): string[] {
  if (selectedFlavors.length === 0) {
    // 처음 사용자를 위한 기본 추천
    return ['chocolate', 'caramel', 'nutty', 'fruity']
  }
  
  // 선택된 향미의 카테고리 파악
  const selectedCategories = new Set<string>()
  
  Object.entries(flavorCategories).forEach(([category, flavors]) => {
    if (selectedFlavors.some(selected => flavors.includes(selected))) {
      selectedCategories.add(category)
    }
  })
  
  // 같은 카테고리의 다른 향미 추천
  const recommendations: string[] = []
  
  selectedCategories.forEach(category => {
    const categoryFlavors = flavorCategories[category as keyof typeof flavorCategories]
    const unselectedFlavors = categoryFlavors.filter(
      flavor => !selectedFlavors.includes(flavor) && allAvailableFlavors.includes(flavor)
    )
    recommendations.push(...unselectedFlavors.slice(0, 2))
  })
  
  return recommendations.slice(0, 4)
}