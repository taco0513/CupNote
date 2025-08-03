import { describe, it, expect, vi, beforeEach } from 'vitest'

import { 
  FLAVOR_MATCHING, 
  SENSORY_MATCHING,
  calculateMatchScore,
  calculateFlavorMatching,
  calculateSensoryMatching,
  generateMatchInsights
} from '../match-score'

// Mock the community-match module
vi.mock('../community-match', () => ({
  calculateCommunityMatchScoreWithData: vi.fn().mockResolvedValue({
    score: 85,
    insights: ['커뮤니티 평균보다 높은 점수입니다.'],
    category: 'high'
  })
}))

// Mock enhanced dictionaries
vi.mock('../enhanced-dictionaries', () => ({
  ENHANCED_FLAVOR_PROFILES: {
    citrus: { category: 'fruity', variations: ['오렌지', '레몬'], intensity: 0.8 },
    chocolate: { category: 'sweet', variations: ['초콜릿', '다크초콜릿'], intensity: 0.9 }
  },
  ENHANCED_SENSORY_PROFILES: {
    bright: { category: 'acidity', variations: ['상큼한', '발랄한'], intensity: 0.7 },
    smooth: { category: 'body', variations: ['부드러운', '실키한'], intensity: 0.8 }
  },
  INTENSITY_MULTIPLIERS: {
    high: 1.2,
    medium: 1.0,
    low: 0.8
  }
}))

// Mock fuzzy matching
vi.mock('../fuzzy-matching', () => ({
  findBestMatches: vi.fn((input: string, dictionary: string[]) => [
    { match: dictionary[0] || input, score: 0.9, confidence: 'high' }
  ])
}))

describe('match-score', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FLAVOR_MATCHING dictionary', () => {
    it('should have citrus flavor mappings', () => {
      expect(FLAVOR_MATCHING.citrus).toContain('오렌지')
      expect(FLAVOR_MATCHING.citrus).toContain('레몬')
      expect(FLAVOR_MATCHING.citrus).toContain('시트러스')
    })

    it('should have chocolate flavor mappings', () => {
      expect(FLAVOR_MATCHING.chocolate).toContain('초콜릿향')
      expect(FLAVOR_MATCHING.chocolate).toContain('다크초콜릿')
      expect(FLAVOR_MATCHING.chocolate).toContain('코코아')
    })

    it('should have nutty flavor mappings', () => {
      expect(FLAVOR_MATCHING.nutty).toContain('견과류')
      expect(FLAVOR_MATCHING.nutty).toContain('아몬드')
      expect(FLAVOR_MATCHING.nutty).toContain('헤이즐넛')
    })

    it('should have berry flavor mappings', () => {
      expect(FLAVOR_MATCHING.berry).toContain('딸기')
      expect(FLAVOR_MATCHING.berry).toContain('블루베리')
      expect(FLAVOR_MATCHING.berry).toContain('베리류')
    })
  })

  describe('SENSORY_MATCHING dictionary', () => {
    it('should have acidity sensory mappings', () => {
      expect(SENSORY_MATCHING.bright).toContain('상큼한')
      expect(SENSORY_MATCHING.bright).toContain('발랄한')
      expect(SENSORY_MATCHING.citrusy).toContain('시트러스 같은')
    })

    it('should have body sensory mappings', () => {
      expect(SENSORY_MATCHING.smooth).toContain('부드러운')
      expect(SENSORY_MATCHING.smooth).toContain('실키한')
      expect(SENSORY_MATCHING.full).toContain('묵직한')
    })

    it('should have sweetness sensory mappings', () => {
      expect(SENSORY_MATCHING.sweet).toContain('달콤한')
      expect(SENSORY_MATCHING.rich).toContain('농밀한')
    })

    it('should have balance sensory mappings', () => {
      expect(SENSORY_MATCHING.balanced).toContain('조화로운')
      expect(SENSORY_MATCHING.complex).toContain('복잡한')
    })
  })

  describe('calculateFlavorMatching', () => {
    it('should calculate flavor matching score correctly', () => {
      const userTaste = '오렌지와 초콜릿 맛이 나요'
      const roasterNote = 'citrus and chocolate notes'
      
      const score = calculateFlavorMatching(userTaste, roasterNote)
      
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle empty inputs gracefully', () => {
      const score = calculateFlavorMatching('', '')
      expect(score).toBe(0)
    })

    it('should handle single input being empty', () => {
      const score1 = calculateFlavorMatching('맛있어요', '')
      const score2 = calculateFlavorMatching('', 'tasty')
      
      expect(score1).toBeGreaterThanOrEqual(0)
      expect(score2).toBeGreaterThanOrEqual(0)
    })

    it('should find exact flavor matches', () => {
      const userTaste = '오렌지 맛'
      const roasterNote = 'orange flavor'
      
      const score = calculateFlavorMatching(userTaste, roasterNote)
      expect(score).toBeGreaterThan(50) // Should have good match
    })
  })

  describe('calculateSensoryMatching', () => {
    it('should calculate sensory matching score correctly', () => {
      const userTaste = '상큼하고 부드러운 맛'
      const roasterNote = 'bright and smooth'
      
      const score = calculateSensoryMatching(userTaste, roasterNote)
      
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle empty inputs gracefully', () => {
      const score = calculateSensoryMatching('', '')
      expect(score).toBe(0)
    })

    it('should find exact sensory matches', () => {
      const userTaste = '상큼한 맛'
      const roasterNote = 'bright flavor'
      
      const score = calculateSensoryMatching(userTaste, roasterNote)
      expect(score).toBeGreaterThan(30) // Should have decent match
    })
  })

  describe('calculateMatchScore', () => {
    it('should calculate overall match score', async () => {
      const result = await calculateMatchScore({
        userTaste: '오렌지와 초콜릿 맛이 상큼하고 부드러워요',
        roasterNote: 'citrus and chocolate, bright and smooth',
        coffeeName: 'Test Coffee',
        roastery: 'Test Roastery'
      })
      
      expect(result).toHaveProperty('overall')
      expect(result).toHaveProperty('flavorMatching')
      expect(result).toHaveProperty('sensoryMatching')
      expect(result).toHaveProperty('communityScore')
      expect(result).toHaveProperty('insights')
      
      expect(result.overall).toBeGreaterThanOrEqual(0)
      expect(result.overall).toBeLessThanOrEqual(100)
      expect(Array.isArray(result.insights)).toBe(true)
    })

    it('should handle missing roaster note', async () => {
      const result = await calculateMatchScore({
        userTaste: '달콤한 맛',
        roasterNote: '',
        coffeeName: 'Test Coffee',
        roastery: 'Test Roastery'
      })
      
      expect(result.overall).toBeGreaterThanOrEqual(0)
      expect(result.flavorMatching).toBe(0) // No roaster note to match
    })

    it('should handle missing user taste', async () => {
      const result = await calculateMatchScore({
        userTaste: '',
        roasterNote: 'chocolate and vanilla',
        coffeeName: 'Test Coffee',
        roastery: 'Test Roastery'
      })
      
      expect(result.overall).toBeGreaterThanOrEqual(0)
      expect(result.flavorMatching).toBe(0) // No user taste to match
    })

    it('should weight different factors correctly', async () => {
      const result = await calculateMatchScore({
        userTaste: '복잡하고 균형잡힌 맛',
        roasterNote: 'complex and balanced',
        coffeeName: 'Premium Coffee',
        roastery: 'Specialty Roastery'
      })
      
      // Should have good scores when descriptions match well
      expect(result.overall).toBeGreaterThan(60)
      expect(result.sensoryMatching).toBeGreaterThan(50)
    })
  })

  describe('generateMatchInsights', () => {
    it('should generate insights for high scores', () => {
      const insights = generateMatchInsights({
        overall: 90,
        flavorMatching: 85,
        sensoryMatching: 95,
        communityScore: 88
      })
      
      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
      
      // Should contain positive feedback for high scores
      const hasPositiveInsight = insights.some(insight => 
        insight.includes('뛰어남') || insight.includes('훌륭') || insight.includes('일치')
      )
      expect(hasPositiveInsight).toBe(true)
    })

    it('should generate insights for low scores', () => {
      const insights = generateMatchInsights({
        overall: 30,
        flavorMatching: 25,
        sensoryMatching: 35,
        communityScore: 32
      })
      
      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
      
      // Should contain improvement suggestions for low scores
      const hasImprovementSuggestion = insights.some(insight => 
        insight.includes('개선') || insight.includes('주의') || insight.includes('다른')
      )
      expect(hasImprovementSuggestion).toBe(true)
    })

    it('should generate insights for medium scores', () => {
      const insights = generateMatchInsights({
        overall: 65,
        flavorMatching: 60,
        sensoryMatching: 70,
        communityScore: 65
      })
      
      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
    })

    it('should handle edge case scores', () => {
      const insights = generateMatchInsights({
        overall: 0,
        flavorMatching: 0,
        sensoryMatching: 0,
        communityScore: 0
      })
      
      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
    })
  })

  describe('Score Validation', () => {
    it('should always return scores between 0 and 100', async () => {
      const testCases = [
        { userTaste: '완전히 다른 맛', roasterNote: 'totally different flavor' },
        { userTaste: '정확히 같은 맛', roasterNote: '정확히 같은 맛' },
        { userTaste: '오렌지 초콜릿 바닐라 견과류', roasterNote: 'orange chocolate vanilla nutty' }
      ]
      
      for (const testCase of testCases) {
        const result = await calculateMatchScore({
          ...testCase,
          coffeeName: 'Test',
          roastery: 'Test'
        })
        
        expect(result.overall).toBeGreaterThanOrEqual(0)
        expect(result.overall).toBeLessThanOrEqual(100)
        expect(result.flavorMatching).toBeGreaterThanOrEqual(0)
        expect(result.flavorMatching).toBeLessThanOrEqual(100)
        expect(result.sensoryMatching).toBeGreaterThanOrEqual(0)
        expect(result.sensoryMatching).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const result = await calculateMatchScore({
        userTaste: null as any,
        roasterNote: undefined as any,
        coffeeName: 'Test',
        roastery: 'Test'
      })
      
      expect(result).toHaveProperty('overall')
      expect(result.overall).toBeGreaterThanOrEqual(0)
    })

    it('should handle very long input strings', async () => {
      const longString = 'a'.repeat(10000)
      
      const result = await calculateMatchScore({
        userTaste: longString,
        roasterNote: longString,
        coffeeName: 'Test',
        roastery: 'Test'
      })
      
      expect(result).toHaveProperty('overall')
      expect(result.overall).toBeGreaterThanOrEqual(0)
    })
  })
})