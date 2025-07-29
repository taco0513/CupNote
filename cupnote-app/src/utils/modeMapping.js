/**
 * Mode-Based Attribute Mapping System
 * 
 * This module provides attribute configurations for different tasting modes
 * to ensure each mode has appropriate sensory evaluation criteria.
 */

/**
 * Cafe Mode Attributes - Simple and accessible for casual users
 */
export const cafeAttributes = [
  {
    key: 'sweetness',
    label: '단맛',
    icon: '🍯',
    description: '커피의 단맛 정도',
    min: 1,
    max: 5,
    step: 0.5,
    unit: '',
    color: '#FFB74D'
  },
  {
    key: 'bitterness',
    label: '쓴맛',
    icon: '🌰',
    description: '커피의 쓴맛 정도',
    min: 1,
    max: 5,
    step: 0.5,
    unit: '',
    color: '#8D6E63'
  },
  {
    key: 'acidity',
    label: '산미',
    icon: '🍋',
    description: '커피의 산미 정도',
    min: 1,
    max: 5,
    step: 0.5,
    unit: '',
    color: '#FFC107'
  },
  {
    key: 'body',
    label: '바디감',
    icon: '🥛',
    description: '커피의 묵직함과 질감',
    min: 1,
    max: 5,
    step: 0.5,
    unit: '',
    color: '#A1887F'
  },
  {
    key: 'aroma',
    label: '향',
    icon: '🌸',
    description: '커피의 향 강도',
    min: 1,
    max: 5,
    step: 0.5,
    unit: '',
    color: '#E1BEE7'
  },
  {
    key: 'aftertaste',
    label: '후미',
    icon: '✨',
    description: '커피를 마신 후 남는 맛',
    min: 1,
    max: 5,
    step: 0.5,
    unit: '',
    color: '#B39DDB'
  }
]

/**
 * Home Cafe Mode Attributes - More detailed for enthusiasts
 */
export const homeCafeAttributes = [
  {
    key: 'sweetness',
    label: '단맛',
    icon: '🍯',
    description: '커피의 자연스러운 단맛',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#FFB74D'
  },
  {
    key: 'acidity',
    label: '산미',
    icon: '🍋',
    description: '커피의 산도와 밝기',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#FFC107'
  },
  {
    key: 'bitterness',
    label: '쓴맛',
    icon: '🌰',
    description: '커피의 쓴맛 강도',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#8D6E63'
  },
  {
    key: 'body',
    label: '바디감',
    icon: '🥛',
    description: '입안에서 느껴지는 무게감',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#A1887F'
  },
  {
    key: 'aroma',
    label: '향 강도',
    icon: '🌸',
    description: '향의 강도와 복합성',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#E1BEE7'
  },
  {
    key: 'flavor',
    label: '풍미',
    icon: '🎨',
    description: '커피의 전체적인 풍미',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#81C784'
  },
  {
    key: 'aftertaste',
    label: '후미',
    icon: '✨',
    description: '마신 후 지속되는 맛',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#B39DDB'
  },
  {
    key: 'balance',
    label: '밸런스',
    icon: '⚖️',
    description: '전체적인 맛의 균형',
    min: 1,
    max: 10,
    step: 0.5,
    unit: '',
    color: '#4FC3F7'
  }
]

/**
 * Pro Mode Attributes - SCA standard evaluation criteria
 */
export const proAttributes = [
  {
    key: 'fragrance_aroma',
    label: 'Fragrance/Aroma',
    icon: '🌸',
    description: 'SCA 향미 평가 - 건커피 향과 우린커피 향',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#E1BEE7',
    scaStandard: true,
    weight: 15
  },
  {
    key: 'flavor',
    label: 'Flavor',
    icon: '🎨',
    description: 'SCA 풍미 평가 - 전체적인 맛 특성',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#81C784',
    scaStandard: true,
    weight: 15
  },
  {
    key: 'aftertaste',
    label: 'Aftertaste',
    icon: '✨',
    description: 'SCA 후미 평가 - 삼킨 후 지속되는 맛',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#B39DDB',
    scaStandard: true,
    weight: 15
  },
  {
    key: 'acidity',
    label: 'Acidity',
    icon: '🍋',
    description: 'SCA 산미 평가 - 산미의 강도와 질',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#FFC107',
    scaStandard: true,
    weight: 15
  },
  {
    key: 'body',
    label: 'Body',
    icon: '🥛',
    description: 'SCA 바디 평가 - 촉각적 느낌과 무게감',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#A1887F',
    scaStandard: true,
    weight: 15
  },
  {
    key: 'balance',
    label: 'Balance',
    icon: '⚖️',
    description: 'SCA 밸런스 평가 - 맛 요소들의 조화',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#4FC3F7',
    scaStandard: true,
    weight: 15
  },
  {
    key: 'uniformity',
    label: 'Uniformity',
    icon: '🔄',
    description: 'SCA 균일성 평가 - 여러 컵의 일관성',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#90A4AE',
    scaStandard: true,
    weight: 10
  },
  {
    key: 'clean_cup',
    label: 'Clean Cup',
    icon: '💎',
    description: 'SCA 컵 클린함 평가 - 잡맛 없는 깔끔함',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#26C6DA',
    scaStandard: true,
    weight: 10
  },
  {
    key: 'sweetness',
    label: 'Sweetness',
    icon: '🍯',
    description: 'SCA 단맛 평가 - 자연스러운 단맛',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#FFB74D',
    scaStandard: true,
    weight: 10
  },
  {
    key: 'overall',
    label: 'Overall',
    icon: '🏆',
    description: 'SCA 전체 평가 - 커핑자의 종합 점수',
    min: 6.0,
    max: 10.0,
    step: 0.25,
    unit: 'pts',
    color: '#FF7043',
    scaStandard: true,
    weight: 15
  }
]

/**
 * Mode-based attribute mapping function
 * @param {string} mode - The current tasting mode (cafe, homecafe, pro)
 * @returns {Array} Array of attribute configurations for the specified mode
 */
export function getAttributesForMode(mode) {
  switch (mode) {
    case 'cafe':
      return cafeAttributes
    case 'homecafe':
      return homeCafeAttributes
    case 'pro':
      return proAttributes
    default:
      return homeCafeAttributes // Default fallback
  }
}

/**
 * Get mode-specific configuration
 * @param {string} mode - The current tasting mode
 * @returns {Object} Configuration object for the specified mode
 */
export function getModeConfig(mode) {
  const configs = {
    cafe: {
      title: 'Cafe 모드 평가',
      subtitle: '간단하고 직관적인 커피 평가',
      maxScore: 5,
      scoreFormat: '0.0',
      showAverage: true,
      showTotal: false,
      colorScheme: 'warm',
      icon: '☕',
      description: '카페에서 즐기는 커피를 간단하게 평가하는 모드입니다.'
    },
    homecafe: {
      title: 'Home Cafe 모드 평가',
      subtitle: '상세한 홈카페 커피 분석',
      maxScore: 10,
      scoreFormat: '0.0',
      showAverage: true,
      showTotal: true,
      colorScheme: 'balanced',
      icon: '🏠',
      description: '홈카페에서 더 자세한 분석을 통해 커피를 평가하는 모드입니다.'
    },
    pro: {
      title: 'Pro 모드 평가 (SCA 기준)',
      subtitle: 'SCA 표준 커핑 프로토콜',
      maxScore: 10,
      scoreFormat: '0.00',
      showAverage: false,
      showTotal: true,
      showScaScore: true,
      colorScheme: 'professional',
      icon: '🎯',
      description: 'SCA(Specialty Coffee Association) 표준에 따른 전문가급 커피 평가 모드입니다.'
    }
  }
  
  return configs[mode] || configs.homecafe
}

/**
 * Calculate total score for Pro mode (SCA scoring)
 * @param {Object} scores - Score values for each attribute
 * @returns {Object} Calculated total score and grade
 */
export function calculateScaScore(scores) {
  if (!scores || Object.keys(scores).length === 0) {
    return {
      total: 0,
      grade: 'N/A',
      classification: '평가 없음',
      color: '#9E9E9E'
    }
  }
  
  const attributes = proAttributes
  let weightedTotal = 0
  let totalWeight = 0
  
  attributes.forEach(attr => {
    const score = scores[attr.key]
    if (score && score > 0) {
      weightedTotal += score * attr.weight
      totalWeight += attr.weight
    }
  })
  
  if (totalWeight === 0) {
    return {
      total: 0,
      grade: 'N/A',
      classification: '평가 없음',
      color: '#9E9E9E'
    }
  }
  
  const finalScore = (weightedTotal / totalWeight).toFixed(2)
  const numericScore = parseFloat(finalScore)
  
  // SCA grading system
  let grade, classification, color
  
  if (numericScore >= 9.0) {
    grade = 'Outstanding'
    classification = '탁월함'
    color = '#2E7D32'
  } else if (numericScore >= 8.5) {
    grade = 'Excellent'
    classification = '우수함'
    color = '#388E3C'
  } else if (numericScore >= 8.0) {
    grade = 'Very Good'
    classification = '매우 좋음'
    color = '#689F38'
  } else if (numericScore >= 7.5) {
    grade = 'Good'
    classification = '좋음'
    color: '#AFB42B'
  } else if (numericScore >= 7.0) {
    grade = 'Fair'
    classification = '보통'
    color = '#FF8F00'
  } else if (numericScore >= 6.0) {
    grade = 'Below Standard'
    classification = '기준 미달'
    color = '#F57C00'
  } else {
    grade = 'Poor'
    classification: '낮음'
    color = '#D32F2F'
  }
  
  return {
    total: finalScore,
    grade,
    classification,
    color,
    breakdown: {
      weightedTotal: weightedTotal.toFixed(2),
      totalWeight,
      averageScore: (weightedTotal / totalWeight).toFixed(2)
    }
  }
}

/**
 * Get color scheme for mode
 * @param {string} scheme - Color scheme name
 * @returns {Object} Color configuration
 */
export function getColorScheme(scheme) {
  const schemes = {
    warm: {
      primary: '#7C5842',
      secondary: '#A0796A',
      accent: '#FFB74D',
      background: '#FFF8F0'
    },
    balanced: {
      primary: '#4CAF50',
      secondary: '#66BB6A',
      accent: '#81C784',
      background: '#F1F8E9'
    },
    professional: {
      primary: '#1976D2',
      secondary: '#42A5F5',
      accent: '#2196F3',
      background: '#E3F2FD'
    }
  }
  
  return schemes[scheme] || schemes.balanced
}

/**
 * Validate score values for a given mode
 * @param {Object} scores - Score values to validate
 * @param {string} mode - Current mode
 * @returns {Object} Validation result with errors
 */
export function validateScores(scores, mode) {
  const attributes = getAttributesForMode(mode)
  const errors = {}
  let isValid = true
  
  attributes.forEach(attr => {
    const score = scores[attr.key]
    
    if (score !== undefined && score !== null && score !== '') {
      const numScore = parseFloat(score)
      
      if (isNaN(numScore)) {
        errors[attr.key] = '유효한 숫자를 입력하세요'
        isValid = false
      } else if (numScore < attr.min || numScore > attr.max) {
        errors[attr.key] = `${attr.min} ~ ${attr.max} 범위의 값을 입력하세요`
        isValid = false
      }
    }
  })
  
  return { isValid, errors }
}

/**
 * Convert scores between different modes
 * @param {Object} scores - Original scores
 * @param {string} fromMode - Source mode
 * @param {string} toMode - Target mode
 * @returns {Object} Converted scores
 */
export function convertScoresBetweenModes(scores, fromMode, toMode) {
  if (fromMode === toMode) return scores
  
  const fromAttributes = getAttributesForMode(fromMode)
  const toAttributes = getAttributesForMode(toMode)
  const convertedScores = {}
  
  // Find matching attributes and convert scale
  toAttributes.forEach(toAttr => {
    const fromAttr = fromAttributes.find(attr => attr.key === toAttr.key)
    
    if (fromAttr && scores[fromAttr.key] !== undefined) {
      const originalScore = parseFloat(scores[fromAttr.key])
      
      // Convert scale: normalize to 0-1, then scale to target range
      const normalized = (originalScore - fromAttr.min) / (fromAttr.max - fromAttr.min)
      const converted = normalized * (toAttr.max - toAttr.min) + toAttr.min
      
      convertedScores[toAttr.key] = parseFloat(converted.toFixed(2))
    }
  })
  
  return convertedScores
}

/**
 * Get default scores for a mode
 * @param {string} mode - Current mode
 * @returns {Object} Default score values
 */
export function getDefaultScores(mode) {
  const attributes = getAttributesForMode(mode)
  const defaultScores = {}
  
  attributes.forEach(attr => {
    // Set default to middle value for most attributes
    const midValue = (attr.min + attr.max) / 2
    defaultScores[attr.key] = parseFloat(midValue.toFixed(2))
  })
  
  return defaultScores
}

export default {
  getAttributesForMode,
  getModeConfig,
  calculateScaScore,
  getColorScheme,
  validateScores,
  convertScoresBetweenModes,
  getDefaultScores,
  cafeAttributes,
  homeCafeAttributes,
  proAttributes
}