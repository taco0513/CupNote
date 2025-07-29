/**
 * SCA (Specialty Coffee Association) Standard Calculations
 * 
 * This module provides calculation functions based on SCA standards
 * for coffee brewing, extraction, and quality assessment.
 */

/**
 * SCA Standard Ranges
 */
export const SCA_STANDARDS = {
  // Brewing ratios (coffee:water)
  BREW_RATIO: {
    MIN: 15,
    MAX: 17,
    OPTIMAL: 16
  },
  
  // Water temperature (Celsius)
  WATER_TEMP: {
    MIN: 90,
    MAX: 96,
    OPTIMAL: 93
  },
  
  // Water quality
  WATER_TDS: {
    MIN: 75,
    MAX: 250,
    OPTIMAL: 150
  },
  
  WATER_PH: {
    MIN: 6.5,
    MAX: 7.5,
    OPTIMAL: 7.0
  },
  
  // TDS (Total Dissolved Solids) in brewed coffee
  COFFEE_TDS: {
    MIN: 1.15,
    MAX: 1.45,
    OPTIMAL: 1.30
  },
  
  // Extraction yield percentage
  EXTRACTION_YIELD: {
    MIN: 18,
    MAX: 22,
    OPTIMAL: 20
  },
  
  // Brewing time ranges by method (seconds)
  BREW_TIME: {
    POUROVER: { MIN: 150, MAX: 360 }, // 2:30 - 6:00
    IMMERSION: { MIN: 240, MAX: 480 }, // 4:00 - 8:00
    ESPRESSO: { MIN: 25, MAX: 35 },    // 0:25 - 0:35
    COLD_BREW: { MIN: 43200, MAX: 86400 } // 12-24 hours
  }
}

/**
 * Calculate extraction yield based on TDS, brew volume, and coffee amount
 * Formula: Extraction Yield = (TDS × Brew Volume) ÷ Coffee Amount
 * 
 * @param {number} tds - Total Dissolved Solids percentage (1.15-1.45)
 * @param {number} brewVolume - Final brew volume in ml
 * @param {number} coffeeAmount - Coffee dose in grams
 * @returns {number} Extraction yield percentage
 */
export function calculateExtractionYield(tds, brewVolume, coffeeAmount) {
  if (!tds || !brewVolume || !coffeeAmount || coffeeAmount === 0) {
    return 0
  }
  
  return (tds * brewVolume) / coffeeAmount
}

/**
 * Evaluate extraction yield status based on SCA standards
 * 
 * @param {number} yieldPercentage - Extraction yield percentage
 * @returns {Object} Status object with classification and description
 */
export function evaluateExtractionYield(yieldPercentage) {
  const { MIN, MAX } = SCA_STANDARDS.EXTRACTION_YIELD
  
  if (yieldPercentage < MIN) {
    return {
      status: 'under',
      classification: '미추출',
      description: 'Under-extracted. Consider finer grind or longer brew time.',
      severity: 'warning'
    }
  } else if (yieldPercentage >= MIN && yieldPercentage <= MAX) {
    return {
      status: 'optimal',
      classification: '적정',
      description: 'Optimal extraction range. Well-balanced extraction.',
      severity: 'success'
    }
  } else {
    return {
      status: 'over',
      classification: '과추출',
      description: 'Over-extracted. Consider coarser grind or shorter brew time.',
      severity: 'warning'
    }
  }
}

/**
 * Calculate brew ratio (coffee:water)
 * 
 * @param {number} coffeeAmount - Coffee dose in grams
 * @param {number} waterAmount - Water amount in ml (assuming 1ml = 1g)
 * @returns {number} Brew ratio (e.g., 16 for 1:16)
 */
export function calculateBrewRatio(coffeeAmount, waterAmount) {
  if (!coffeeAmount || coffeeAmount === 0) {
    return 0
  }
  
  return waterAmount / coffeeAmount
}

/**
 * Evaluate brew ratio against SCA standards
 * 
 * @param {number} ratio - Brew ratio
 * @returns {Object} Evaluation result
 */
export function evaluateBrewRatio(ratio) {
  const { MIN, MAX, OPTIMAL } = SCA_STANDARDS.BREW_RATIO
  
  if (ratio < MIN) {
    return {
      compliant: false,
      status: 'too_strong',
      description: `Too strong (1:${ratio.toFixed(1)}). SCA recommends 1:${MIN}-1:${MAX}.`
    }
  } else if (ratio >= MIN && ratio <= MAX) {
    return {
      compliant: true,
      status: 'optimal',
      description: `SCA compliant (1:${ratio.toFixed(1)}). Optimal range achieved.`
    }
  } else {
    return {
      compliant: false,
      status: 'too_weak',
      description: `Too weak (1:${ratio.toFixed(1)}). SCA recommends 1:${MIN}-1:${MAX}.`
    }
  }
}

/**
 * Evaluate water temperature against SCA standards
 * 
 * @param {number} temperature - Water temperature in Celsius
 * @returns {Object} Evaluation result
 */
export function evaluateWaterTemperature(temperature) {
  const { MIN, MAX, OPTIMAL } = SCA_STANDARDS.WATER_TEMP
  
  if (temperature < MIN) {
    return {
      compliant: false,
      status: 'too_cold',
      description: `Too cold (${temperature}°C). SCA recommends ${MIN}-${MAX}°C.`
    }
  } else if (temperature >= MIN && temperature <= MAX) {
    return {
      compliant: true,
      status: 'optimal',
      description: `SCA compliant (${temperature}°C). Optimal extraction temperature.`
    }
  } else {
    return {
      compliant: false,
      status: 'too_hot',
      description: `Too hot (${temperature}°C). SCA recommends ${MIN}-${MAX}°C.`
    }
  }
}

/**
 * Evaluate water quality (TDS and pH) against SCA standards
 * 
 * @param {number} waterTds - Water TDS in ppm
 * @param {number} waterPh - Water pH level
 * @returns {Object} Evaluation result
 */
export function evaluateWaterQuality(waterTds, waterPh) {
  const tdsStandard = SCA_STANDARDS.WATER_TDS
  const phStandard = SCA_STANDARDS.WATER_PH
  
  const tdsCompliant = waterTds >= tdsStandard.MIN && waterTds <= tdsStandard.MAX
  const phCompliant = waterPh >= phStandard.MIN && waterPh <= phStandard.MAX
  
  return {
    compliant: tdsCompliant && phCompliant,
    tds: {
      compliant: tdsCompliant,
      value: waterTds,
      range: `${tdsStandard.MIN}-${tdsStandard.MAX} ppm`,
      status: tdsCompliant ? 'optimal' : 'out_of_range'
    },
    ph: {
      compliant: phCompliant,
      value: waterPh,
      range: `${phStandard.MIN}-${phStandard.MAX}`,
      status: phCompliant ? 'optimal' : 'out_of_range'
    },
    overall: {
      status: tdsCompliant && phCompliant ? 'optimal' : 'needs_adjustment',
      description: tdsCompliant && phCompliant 
        ? 'Water quality meets SCA standards.'
        : 'Water quality adjustment recommended for optimal extraction.'
    }
  }
}

/**
 * Calculate overall SCA compliance score
 * 
 * @param {Object} brewingData - Brewing parameters
 * @returns {Object} Compliance score and breakdown
 */
export function calculateScaComplianceScore(brewingData) {
  const {
    coffeeAmount,
    waterAmount,
    waterTemp,
    waterTds,
    waterPh
  } = brewingData
  
  let totalScore = 0
  let maxScore = 0
  const evaluations = {}
  
  // Brew ratio evaluation (33.33% weight)
  if (coffeeAmount && waterAmount) {
    const ratio = calculateBrewRatio(coffeeAmount, waterAmount)
    const ratioEval = evaluateBrewRatio(ratio)
    evaluations.ratio = ratioEval
    
    if (ratioEval.compliant) totalScore += 33.33
    maxScore += 33.33
  }
  
  // Water temperature evaluation (33.33% weight)
  if (waterTemp) {
    const tempEval = evaluateWaterTemperature(waterTemp)
    evaluations.temperature = tempEval
    
    if (tempEval.compliant) totalScore += 33.33
    maxScore += 33.33
  }
  
  // Water quality evaluation (33.34% weight)
  if (waterTds && waterPh) {
    const waterEval = evaluateWaterQuality(waterTds, waterPh)
    evaluations.waterQuality = waterEval
    
    if (waterEval.compliant) totalScore += 33.34
    maxScore += 33.34
  }
  
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  
  return {
    score: percentage,
    totalScore,
    maxScore,
    evaluations,
    grade: getComplianceGrade(percentage),
    recommendations: generateRecommendations(evaluations)
  }
}

/**
 * Get compliance grade based on percentage score
 * 
 * @param {number} percentage - Compliance percentage (0-100)
 * @returns {Object} Grade information
 */
export function getComplianceGrade(percentage) {
  if (percentage >= 90) {
    return {
      letter: 'A',
      level: 'excellent',
      description: '우수',
      color: '#4CAF50'
    }
  } else if (percentage >= 70) {
    return {
      letter: 'B',
      level: 'good',
      description: '양호',
      color: '#2196F3'
    }
  } else if (percentage >= 50) {
    return {
      letter: 'C',
      level: 'average',
      description: '보통',
      color: '#FF9800'
    }
  } else {
    return {
      letter: 'D',
      level: 'needs_improvement',
      description: '개선 필요',
      color: '#F44336'
    }
  }
}

/**
 * Generate recommendations based on evaluation results
 * 
 * @param {Object} evaluations - Evaluation results
 * @returns {Array} Array of recommendation objects
 */
export function generateRecommendations(evaluations) {
  const recommendations = []
  
  // Ratio recommendations
  if (evaluations.ratio && !evaluations.ratio.compliant) {
    if (evaluations.ratio.status === 'too_strong') {
      recommendations.push({
        category: 'ratio',
        priority: 'medium',
        action: 'Increase water amount or decrease coffee dose',
        reason: 'Current ratio is too strong for SCA standards'
      })
    } else if (evaluations.ratio.status === 'too_weak') {
      recommendations.push({
        category: 'ratio',
        priority: 'medium',
        action: 'Decrease water amount or increase coffee dose',
        reason: 'Current ratio is too weak for SCA standards'
      })
    }
  }
  
  // Temperature recommendations
  if (evaluations.temperature && !evaluations.temperature.compliant) {
    if (evaluations.temperature.status === 'too_cold') {
      recommendations.push({
        category: 'temperature',
        priority: 'high',
        action: 'Increase water temperature to 90-96°C',
        reason: 'Low temperature leads to under-extraction'
      })
    } else if (evaluations.temperature.status === 'too_hot') {
      recommendations.push({
        category: 'temperature',
        priority: 'high',
        action: 'Decrease water temperature to 90-96°C',
        reason: 'High temperature can cause over-extraction and bitter flavors'
      })
    }
  }
  
  // Water quality recommendations
  if (evaluations.waterQuality && !evaluations.waterQuality.compliant) {
    if (!evaluations.waterQuality.tds.compliant) {
      recommendations.push({
        category: 'water_tds',
        priority: 'medium',
        action: 'Adjust water TDS to 75-250 ppm range',
        reason: 'Water mineral content affects extraction and flavor'
      })
    }
    
    if (!evaluations.waterQuality.ph.compliant) {
      recommendations.push({
        category: 'water_ph',
        priority: 'medium',
        action: 'Adjust water pH to 6.5-7.5 range',
        reason: 'Water acidity affects extraction efficiency and taste balance'
      })
    }
  }
  
  return recommendations
}

/**
 * Calculate predicted quality score based on brewing parameters and TDS
 * 
 * @param {Object} params - Brewing parameters and measurements
 * @returns {Object} Quality prediction
 */
export function predictQualityScore(params) {
  const {
    tds,
    brewVolume,
    coffeeAmount,
    scaComplianceScore,
    extractionYield
  } = params
  
  let baseScore = 3.0 // Starting from middle quality
  let factors = []
  
  // TDS and extraction yield factor
  if (tds && brewVolume && coffeeAmount) {
    const extractionYieldValue = extractionYield || calculateExtractionYield(tds, brewVolume, coffeeAmount)
    const yieldEval = evaluateExtractionYield(extractionYieldValue)
    
    if (yieldEval.status === 'optimal') {
      baseScore += 0.5
      factors.push('Optimal extraction yield')
    } else if (yieldEval.status === 'under' || yieldEval.status === 'over') {
      baseScore -= 0.3
      factors.push('Sub-optimal extraction yield')
    }
  }
  
  // SCA compliance factor
  if (scaComplianceScore !== undefined) {
    const compliance = scaComplianceScore / 100
    if (compliance >= 0.9) {
      baseScore += 0.5
      factors.push('Excellent SCA compliance')
    } else if (compliance >= 0.7) {
      baseScore += 0.3
      factors.push('Good SCA compliance')
    } else if (compliance < 0.5) {
      baseScore -= 0.3
      factors.push('Poor SCA compliance')
    }
  }
  
  // Ensure score is within valid range (1.0 - 5.0)
  const finalScore = Math.max(1.0, Math.min(5.0, baseScore))
  
  return {
    score: parseFloat(finalScore.toFixed(1)),
    factors,
    description: getQualityDescription(finalScore),
    confidence: calculatePredictionConfidence(params)
  }
}

/**
 * Get quality description based on score
 * 
 * @param {number} score - Quality score (1-5)
 * @returns {string} Quality description
 */
export function getQualityDescription(score) {
  if (score >= 4.5) return '탁월한 품질'
  if (score >= 4.0) return '우수한 품질'
  if (score >= 3.5) return '좋은 품질'
  if (score >= 3.0) return '보통 품질'
  if (score >= 2.5) return '개선 필요'
  return '품질 개선 필요'
}

/**
 * Calculate prediction confidence based on available data
 * 
 * @param {Object} params - Available brewing parameters
 * @returns {Object} Confidence assessment
 */
export function calculatePredictionConfidence(params) {
  let dataPoints = 0
  let totalPoints = 5 // TDS, compliance, temp, ratio, timing
  
  if (params.tds) dataPoints++
  if (params.scaComplianceScore !== undefined) dataPoints++
  if (params.waterTemp) dataPoints++
  if (params.coffeeAmount && params.waterAmount) dataPoints++
  if (params.brewTime) dataPoints++
  
  const percentage = Math.round((dataPoints / totalPoints) * 100)
  
  return {
    percentage,
    level: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
    description: percentage >= 80 
      ? '높은 신뢰도' 
      : percentage >= 60 
      ? '중간 신뢰도' 
      : '낮은 신뢰도 - 더 많은 데이터 필요'
  }
}

/**
 * Format time in MM:SS format from seconds
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatBrewTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Parse time string (MM:SS) to seconds
 * 
 * @param {string} timeString - Time in MM:SS format
 * @returns {number} Time in seconds
 */
export function parseBrewTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return 0
  
  const parts = timeString.split(':')
  if (parts.length !== 2) return 0
  
  const minutes = parseInt(parts[0], 10) || 0
  const seconds = parseInt(parts[1], 10) || 0
  
  return (minutes * 60) + seconds
}

/**
 * Validate brew time against method-specific SCA standards
 * 
 * @param {number} timeInSeconds - Brew time in seconds
 * @param {string} method - Brewing method
 * @returns {Object} Validation result
 */
export function validateBrewTime(timeInSeconds, method = 'pourover') {
  const standard = SCA_STANDARDS.BREW_TIME[method.toUpperCase()]
  
  if (!standard) {
    return {
      valid: true,
      status: 'unknown_method',
      description: 'No time standard available for this method'
    }
  }
  
  if (timeInSeconds < standard.MIN) {
    return {
      valid: false,
      status: 'too_fast',
      description: `Too fast (${formatBrewTime(timeInSeconds)}). Recommended: ${formatBrewTime(standard.MIN)}-${formatBrewTime(standard.MAX)}`
    }
  } else if (timeInSeconds > standard.MAX) {
    return {
      valid: false,
      status: 'too_slow',
      description: `Too slow (${formatBrewTime(timeInSeconds)}). Recommended: ${formatBrewTime(standard.MIN)}-${formatBrewTime(standard.MAX)}`
    }
  } else {
    return {
      valid: true,
      status: 'optimal',
      description: `Optimal timing (${formatBrewTime(timeInSeconds)}). Within SCA standards.`
    }
  }
}