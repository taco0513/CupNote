import { describe, it, expect } from 'vitest'

// 매치 점수 계산 유틸리티 함수
export function calculateMatchScore(
  userSelections: {
    flavors: string[]
    acidity: number
    sweetness: number
    body: number
    aftertaste: number
  },
  roasterNotes: {
    flavors: string[]
    acidity: number
    sweetness: number
    body: number
    aftertaste: number
  }
): number {
  // 향미 매칭 점수 (40%)
  const flavorScore = calculateFlavorMatch(userSelections.flavors, roasterNotes.flavors) * 0.4
  
  // 감각 매칭 점수 (60%)
  const sensoryScore = calculateSensoryMatch(
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
  ) * 0.6
  
  return Math.round(flavorScore + sensoryScore)
}

function calculateFlavorMatch(userFlavors: string[], roasterFlavors: string[]): number {
  if (roasterFlavors.length === 0) return 0
  
  const matches = userFlavors.filter(flavor => 
    roasterFlavors.includes(flavor)
  ).length
  
  const precision = matches / Math.max(userFlavors.length, 1)
  const recall = matches / roasterFlavors.length
  
  // F1 Score 변형 사용
  if (precision + recall === 0) return 0
  return (2 * precision * recall / (precision + recall)) * 100
}

function calculateSensoryMatch(
  userSensory: Record<string, number>,
  roasterSensory: Record<string, number>
): number {
  const attributes = ['acidity', 'sweetness', 'body', 'aftertaste']
  let totalDifference = 0
  
  attributes.forEach(attr => {
    const diff = Math.abs(userSensory[attr] - roasterSensory[attr])
    // 5점 척도에서 최대 차이는 4
    totalDifference += (1 - diff / 4)
  })
  
  return (totalDifference / attributes.length) * 100
}

describe('matchCalculator', () => {
  describe('calculateMatchScore', () => {
    it('완벽한 매치는 100점을 반환한다', () => {
      const userSelections = {
        flavors: ['chocolate', 'caramel', 'nutty'],
        acidity: 3,
        sweetness: 4,
        body: 3,
        aftertaste: 4
      }
      
      const roasterNotes = {
        flavors: ['chocolate', 'caramel', 'nutty'],
        acidity: 3,
        sweetness: 4,
        body: 3,
        aftertaste: 4
      }
      
      expect(calculateMatchScore(userSelections, roasterNotes)).toBe(100)
    })
    
    it('완전히 다른 선택은 낮은 점수를 반환한다', () => {
      const userSelections = {
        flavors: ['fruity', 'floral', 'citrus'],
        acidity: 5,
        sweetness: 1,
        body: 5,
        aftertaste: 1
      }
      
      const roasterNotes = {
        flavors: ['chocolate', 'caramel', 'nutty'],
        acidity: 1,
        sweetness: 5,
        body: 1,
        aftertaste: 5
      }
      
      expect(calculateMatchScore(userSelections, roasterNotes)).toBeLessThan(20)
    })
    
    it('부분적인 매치는 중간 점수를 반환한다', () => {
      const userSelections = {
        flavors: ['chocolate', 'fruity'],
        acidity: 3,
        sweetness: 3,
        body: 3,
        aftertaste: 3
      }
      
      const roasterNotes = {
        flavors: ['chocolate', 'caramel'],
        acidity: 4,
        sweetness: 4,
        body: 2,
        aftertaste: 4
      }
      
      const score = calculateMatchScore(userSelections, roasterNotes)
      expect(score).toBeGreaterThan(40)
      expect(score).toBeLessThan(80)
    })
  })
  
  describe('calculateFlavorMatch', () => {
    it('모든 향미가 일치하면 100점을 반환한다', () => {
      const score = calculateFlavorMatch(
        ['chocolate', 'caramel'],
        ['chocolate', 'caramel']
      )
      expect(score).toBe(100)
    })
    
    it('일부 향미만 일치하면 부분 점수를 반환한다', () => {
      const score = calculateFlavorMatch(
        ['chocolate', 'fruity', 'nutty'],
        ['chocolate', 'caramel']
      )
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThan(100)
    })
    
    it('일치하는 향미가 없으면 0점을 반환한다', () => {
      const score = calculateFlavorMatch(
        ['fruity', 'floral'],
        ['chocolate', 'caramel']
      )
      expect(score).toBe(0)
    })
    
    it('로스터 향미가 없으면 0점을 반환한다', () => {
      const score = calculateFlavorMatch(['chocolate'], [])
      expect(score).toBe(0)
    })
    
    it('사용자가 향미를 선택하지 않으면 0점을 반환한다', () => {
      const score = calculateFlavorMatch([], ['chocolate', 'caramel'])
      expect(score).toBe(0)
    })
  })
  
  describe('calculateSensoryMatch', () => {
    it('모든 감각이 일치하면 100점을 반환한다', () => {
      const score = calculateSensoryMatch(
        { acidity: 3, sweetness: 4, body: 3, aftertaste: 4 },
        { acidity: 3, sweetness: 4, body: 3, aftertaste: 4 }
      )
      expect(score).toBe(100)
    })
    
    it('하나의 속성만 다르면 부분 점수를 반환한다', () => {
      const score = calculateSensoryMatch(
        { acidity: 3, sweetness: 4, body: 3, aftertaste: 4 },
        { acidity: 5, sweetness: 4, body: 3, aftertaste: 4 }
      )
      // 4개 중 3개가 완벽히 일치하고, 1개가 2점 차이
      // (3 * 1 + 1 * 0.5) / 4 * 100 = 87.5
      expect(Math.round(score)).toBe(88)
    })
    
    it('모든 속성이 정반대면 낮은 점수를 반환한다', () => {
      const score = calculateSensoryMatch(
        { acidity: 1, sweetness: 1, body: 1, aftertaste: 1 },
        { acidity: 5, sweetness: 5, body: 5, aftertaste: 5 }
      )
      expect(score).toBe(0)
    })
  })
  
  describe('통합 시나리오', () => {
    it('커피 초보자의 일반적인 점수 범위', () => {
      // 초보자는 보통 대중적인 향미만 선택하고 감각 표현이 중간값에 집중
      const beginnerSelections = {
        flavors: ['chocolate', 'nutty'],
        acidity: 3,
        sweetness: 3,
        body: 3,
        aftertaste: 3
      }
      
      const specialtyCoffee = {
        flavors: ['blueberry', 'wine', 'chocolate', 'floral'],
        acidity: 4,
        sweetness: 2,
        body: 2,
        aftertaste: 5
      }
      
      const score = calculateMatchScore(beginnerSelections, specialtyCoffee)
      expect(score).toBeGreaterThan(30)
      expect(score).toBeLessThan(70)
    })
    
    it('전문가의 정확한 테이스팅 점수', () => {
      // 전문가는 복잡한 향미도 잘 구분하고 감각도 정확히 표현
      const expertSelections = {
        flavors: ['blueberry', 'wine', 'dark chocolate'],
        acidity: 4,
        sweetness: 2,
        body: 2,
        aftertaste: 5
      }
      
      const specialtyCoffee = {
        flavors: ['blueberry', 'wine', 'chocolate', 'floral'],
        acidity: 4,
        sweetness: 2,
        body: 2,
        aftertaste: 5
      }
      
      const score = calculateMatchScore(expertSelections, specialtyCoffee)
      expect(score).toBeGreaterThan(80)
    })
  })
})