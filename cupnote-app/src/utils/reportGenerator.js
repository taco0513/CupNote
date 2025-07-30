/**
 * Report Generation Utilities
 *
 * This module provides functions for generating different types of reports
 * from coffee tasting and QC data, including PDF and CSV exports.
 */

import {
  calculateScaComplianceScore,
  predictQualityScore,
  evaluateExtractionYield,
} from './scaCalculations'

/**
 * Generate comprehensive report data
 * @param {Object} sessionData - Complete session data
 * @returns {Object} Structured report data
 */
export function generateReportData(sessionData) {
  const {
    coffeeInfo = {},
    homeCafeData = {},
    proBrewingData = {},
    qcMeasurementData = {},
    sensorySliderData = {},
    personalCommentData = {},
    roasterNotesData = {},
  } = sessionData

  const reportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      reportType: 'pro-qc-comprehensive',
      version: '1.0.0',
    },

    coffee: {
      name: coffeeInfo.name || 'Unknown Coffee',
      origin: coffeeInfo.origin || 'Unknown Origin',
      roaster: coffeeInfo.roaster || 'Unknown Roaster',
      roastLevel: coffeeInfo.roast_level || 'Unknown',
      roastDate: coffeeInfo.roast_date || null,
      variety: coffeeInfo.variety || 'Unknown',
      process: coffeeInfo.process || 'Unknown',
      altitude: coffeeInfo.altitude || null,
      notes: coffeeInfo.notes || '',
    },

    brewing: {
      mode: sessionData.mode || 'pro',
      recipe: homeCafeData.recipe || {},
      proParameters: proBrewingData,
      method: proBrewingData.extraction_method || 'pourover',
      ratio: proBrewingData.brew_ratio || 16,
      temperature: proBrewingData.water_temp || 93,
      grindSize: proBrewingData.grind_size || 6,
      waterQuality: {
        tds: proBrewingData.water_tds || 150,
        ph: proBrewingData.water_ph || 7.0,
      },
      timing: {
        bloom: proBrewingData.bloom_time || 30,
        total: proBrewingData.total_time || '2:30',
      },
      equipment: {
        grinder: proBrewingData.grinder_model || null,
        filter: proBrewingData.filter_type || null,
        notes: proBrewingData.equipment_notes || '',
      },
    },

    qualityControl: {
      tds: {
        enabled: qcMeasurementData.tds_enabled || false,
        value: qcMeasurementData.tds_value || null,
        device: qcMeasurementData.tds_device || null,
      },
      extraction: {
        yield: qcMeasurementData.extraction_yield || null,
        status: qcMeasurementData.yield_status || null,
      },
      measurements: {
        brewVolume: qcMeasurementData.brew_volume || null,
        dripLoss: qcMeasurementData.drip_loss || null,
        roomTemp: qcMeasurementData.room_temp || null,
        humidity: qcMeasurementData.humidity || null,
      },
      predictions: {
        quality: qcMeasurementData.predicted_quality || null,
        confidence: null, // Will be calculated
      },
      notes: qcMeasurementData.qc_notes || '',
    },

    sensoryEvaluation: {
      scores: sensorySliderData || {},
      expressions: sensorySliderData.expressions || [],
      personalComments: personalCommentData.comment || '',
      personalRating: personalCommentData.rating || null,
      roasterNotes: roasterNotesData || {},
    },

    analysis: {
      scaCompliance: null, // Will be calculated
      overallQuality: null, // Will be calculated
      recommendations: [], // Will be calculated
      summary: '', // Will be generated
    },
  }

  // Calculate SCA compliance
  if (proBrewingData && Object.keys(proBrewingData).length > 0) {
    const brewingParams = {
      coffeeAmount: homeCafeData.recipe?.coffee_amount || 20,
      waterAmount: (homeCafeData.recipe?.coffee_amount || 20) * (proBrewingData.brew_ratio || 16),
      waterTemp: proBrewingData.water_temp,
      waterTds: proBrewingData.water_tds,
      waterPh: proBrewingData.water_ph,
    }

    reportData.analysis.scaCompliance = calculateScaComplianceScore(brewingParams)
  }

  // Calculate overall quality prediction
  if (qcMeasurementData && Object.keys(qcMeasurementData).length > 0) {
    const qualityParams = {
      tds: qcMeasurementData.tds_value,
      brewVolume: qcMeasurementData.brew_volume,
      coffeeAmount: homeCafeData.recipe?.coffee_amount,
      scaComplianceScore: reportData.analysis.scaCompliance?.score,
      extractionYield: qcMeasurementData.extraction_yield,
    }

    const qualityPrediction = predictQualityScore(qualityParams)
    reportData.analysis.overallQuality = qualityPrediction
    reportData.qualityControl.predictions.confidence = qualityPrediction.confidence?.percentage
  }

  // Generate recommendations
  if (reportData.analysis.scaCompliance?.recommendations) {
    reportData.analysis.recommendations = reportData.analysis.scaCompliance.recommendations
  }

  // Generate summary
  reportData.analysis.summary = generateSummaryText(reportData)

  return reportData
}

/**
 * Generate summary text for the report
 * @param {Object} reportData - Report data object
 * @returns {string} Summary text
 */
function generateSummaryText(reportData) {
  const parts = []

  // Coffee info
  parts.push(`${reportData.coffee.name} (${reportData.coffee.origin})`)

  // Brewing method
  parts.push(`${getMethodName(reportData.brewing.method)} 추출 (1:${reportData.brewing.ratio})`)

  // SCA compliance
  if (reportData.analysis.scaCompliance) {
    const score = reportData.analysis.scaCompliance.score
    parts.push(`SCA 준수율 ${score}%`)
  }

  // Quality prediction
  if (reportData.analysis.overallQuality) {
    const quality = reportData.analysis.overallQuality.score
    parts.push(`예상 품질 ${quality}/5.0`)
  }

  // Extraction status
  if (reportData.qualityControl.extraction.yield) {
    const yield_ = reportData.qualityControl.extraction.yield
    const status = reportData.qualityControl.extraction.status
    parts.push(`추출 수율 ${yield_}% (${status})`)
  }

  return parts.join(' | ')
}

/**
 * Get human-readable method name
 * @param {string} method - Extraction method code
 * @returns {string} Human-readable name
 */
function getMethodName(method) {
  const names = {
    pourover: 'Pour Over',
    immersion: 'Immersion',
    pressure: 'Pressure',
    'cold-brew': 'Cold Brew',
  }
  return names[method] || method
}

/**
 * Generate CSV content from report data
 * @param {Object} reportData - Report data object
 * @returns {string} CSV content
 */
export function generateCSV(reportData) {
  const rows = []

  // Header
  rows.push(['Category', 'Parameter', 'Value', 'Unit', 'Status'])

  // Coffee Information
  rows.push(['Coffee', 'Name', reportData.coffee.name, '', ''])
  rows.push(['Coffee', 'Origin', reportData.coffee.origin, '', ''])
  rows.push(['Coffee', 'Roaster', reportData.coffee.roaster, '', ''])
  rows.push(['Coffee', 'Roast Level', reportData.coffee.roastLevel, '', ''])

  // Brewing Parameters
  rows.push(['Brewing', 'Method', getMethodName(reportData.brewing.method), '', ''])
  rows.push(['Brewing', 'Ratio', `1:${reportData.brewing.ratio}`, '', ''])
  rows.push(['Brewing', 'Temperature', reportData.brewing.temperature, '°C', ''])
  rows.push(['Brewing', 'Grind Size', reportData.brewing.grindSize, '', ''])
  rows.push(['Brewing', 'Water TDS', reportData.brewing.waterQuality.tds, 'ppm', ''])
  rows.push(['Brewing', 'Water pH', reportData.brewing.waterQuality.ph, '', ''])

  // Quality Control
  if (reportData.qualityControl.tds.enabled) {
    rows.push(['QC', 'TDS', reportData.qualityControl.tds.value, '%', ''])
  }
  if (reportData.qualityControl.extraction.yield) {
    rows.push([
      'QC',
      'Extraction Yield',
      reportData.qualityControl.extraction.yield,
      '%',
      reportData.qualityControl.extraction.status,
    ])
  }
  if (reportData.qualityControl.measurements.brewVolume) {
    rows.push(['QC', 'Brew Volume', reportData.qualityControl.measurements.brewVolume, 'ml', ''])
  }

  // Analysis Results
  if (reportData.analysis.scaCompliance) {
    rows.push([
      'Analysis',
      'SCA Compliance',
      reportData.analysis.scaCompliance.score,
      '%',
      reportData.analysis.scaCompliance.grade.description,
    ])
  }
  if (reportData.analysis.overallQuality) {
    rows.push([
      'Analysis',
      'Overall Quality',
      reportData.analysis.overallQuality.score,
      '/5.0',
      reportData.analysis.overallQuality.description,
    ])
  }

  // Convert to CSV string
  return rows
    .map((row) =>
      row
        .map((cell) =>
          // Escape cells containing commas or quotes
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell,
        )
        .join(','),
    )
    .join('\n')
}

/**
 * Generate JSON export data
 * @param {Object} reportData - Report data object
 * @returns {string} JSON string
 */
export function generateJSON(reportData) {
  return JSON.stringify(reportData, null, 2)
}

/**
 * Download file with given content
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Generate filename with timestamp
 * @param {string} base - Base filename
 * @param {string} extension - File extension (without dot)
 * @returns {string} Filename with timestamp
 */
export function generateFilename(base, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)

  return `${base}_${timestamp}.${extension}`
}

/**
 * Export report in multiple formats
 * @param {Object} sessionData - Session data
 * @param {Array} formats - Array of format strings ('csv', 'json')
 */
export function exportReport(sessionData, formats = ['json']) {
  const reportData = generateReportData(sessionData)
  const baseFilename = `cupnote_pro_report_${reportData.coffee.name.replace(/[^a-zA-Z0-9]/g, '_')}`

  formats.forEach((format) => {
    switch (format) {
      case 'csv':
        const csvContent = generateCSV(reportData)
        const csvFilename = generateFilename(baseFilename, 'csv')
        downloadFile(csvContent, csvFilename, 'text/csv')
        break

      case 'json':
        const jsonContent = generateJSON(reportData)
        const jsonFilename = generateFilename(baseFilename, 'json')
        downloadFile(jsonContent, jsonFilename, 'application/json')
        break

      default:
        console.warn(`Unsupported export format: ${format}`)
    }
  })
}

/**
 * Generate PDF content (HTML string for PDF generation)
 * @param {Object} reportData - Report data object
 * @returns {string} HTML content for PDF
 */
export function generatePDFContent(reportData) {
  const timestamp = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CupNote Pro QC Report</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #1976D2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #1976D2;
            margin: 0;
            font-size: 28px;
        }
        
        .header .subtitle {
            color: #666;
            margin: 10px 0;
        }
        
        .coffee-info {
            background: #F8FBFF;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        .coffee-info h2 {
            color: #1976D2;
            margin-top: 0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
        }
        
        .info-label {
            font-weight: 600;
            color: #555;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section h3 {
            color: #1976D2;
            border-bottom: 1px solid #E3F2FD;
            padding-bottom: 5px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        
        .metric-card {
            background: #F8FBFF;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #E3F2FD;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #1976D2;
        }
        
        .metric-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        
        .compliance-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        
        .compliance-item {
            background: #F8FBFF;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #FFCDD2;
        }
        
        .compliance-item.compliant {
            border-color: #C8E6C9;
        }
        
        .recommendations {
            background: #FFFEF7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #FF9800;
        }
        
        .recommendations h4 {
            margin-top: 0;
            color: #F57C00;
        }
        
        .recommendation-item {
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-radius: 4px;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #E0E0E0;
            padding-top: 20px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CupNote Pro QC Report</h1>
        <div class="subtitle">${timestamp}</div>
    </div>
    
    <div class="coffee-info">
        <h2>${reportData.coffee.name}</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">원산지:</span>
                <span>${reportData.coffee.origin}</span>
            </div>
            <div class="info-item">
                <span class="info-label">로스터:</span>
                <span>${reportData.coffee.roaster}</span>
            </div>
            <div class="info-item">
                <span class="info-label">로스팅:</span>
                <span>${reportData.coffee.roastLevel}</span>
            </div>
            <div class="info-item">
                <span class="info-label">품종:</span>
                <span>${reportData.coffee.variety}</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h3>추출 파라미터</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">추출 방법:</span>
                <span>${getMethodName(reportData.brewing.method)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">비율:</span>
                <span>1:${reportData.brewing.ratio}</span>
            </div>
            <div class="info-item">
                <span class="info-label">온도:</span>
                <span>${reportData.brewing.temperature}°C</span>
            </div>
            <div class="info-item">
                <span class="info-label">분쇄도:</span>
                <span>${reportData.brewing.grindSize}</span>
            </div>
            <div class="info-item">
                <span class="info-label">물 TDS:</span>
                <span>${reportData.brewing.waterQuality.tds} ppm</span>
            </div>
            <div class="info-item">
                <span class="info-label">물 pH:</span>
                <span>${reportData.brewing.waterQuality.ph}</span>
            </div>
        </div>
    </div>
    
    ${
      reportData.analysis.scaCompliance
        ? `
    <div class="section">
        <h3>SCA 표준 준수 분석</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.analysis.scaCompliance.score}%</div>
                <div class="metric-label">SCA 준수율</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.analysis.scaCompliance.grade.letter}</div>
                <div class="metric-label">${reportData.analysis.scaCompliance.grade.description}</div>
            </div>
        </div>
        
        <div class="compliance-grid">
            ${Object.entries(reportData.analysis.scaCompliance.evaluations)
              .map(
                ([key, eval_]) => `
                <div class="compliance-item ${eval_.compliant ? 'compliant' : ''}">
                    <div style="font-weight: 600; margin-bottom: 5px;">${getComplianceLabel(key)}</div>
                    <div style="font-size: 12px;">${eval_.compliant ? '✓ 적합' : '⚠ 부적합'}</div>
                </div>
            `,
              )
              .join('')}
        </div>
    </div>
    `
        : ''
    }
    
    ${
      reportData.qualityControl.extraction.yield
        ? `
    <div class="section">
        <h3>추출 분석</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.qualityControl.extraction.yield}%</div>
                <div class="metric-label">추출 수율</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.qualityControl.extraction.status}</div>
                <div class="metric-label">추출 상태</div>
            </div>
        </div>
    </div>
    `
        : ''
    }
    
    ${
      reportData.analysis.overallQuality
        ? `
    <div class="section">
        <h3>품질 예측</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.analysis.overallQuality.score}/5.0</div>
                <div class="metric-label">전체 품질 점수</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.analysis.overallQuality.description}</div>
                <div class="metric-label">품질 등급</div>
            </div>
        </div>
    </div>
    `
        : ''
    }
    
    ${
      reportData.analysis.recommendations.length > 0
        ? `
    <div class="section">
        <div class="recommendations">
            <h4>개선 제안</h4>
            ${reportData.analysis.recommendations
              .map(
                (rec) => `
                <div class="recommendation-item">
                    <strong>${rec.category}:</strong> ${rec.action}
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">${rec.reason}</div>
                </div>
            `,
              )
              .join('')}
        </div>
    </div>
    `
        : ''
    }
    
    <div class="footer">
        <div>Generated by CupNote Pro QC System</div>
        <div>Report ID: ${reportData.metadata.version}_${Date.now()}</div>
    </div>
</body>
</html>
  `
}

/**
 * Get compliance label for display
 * @param {string} key - Compliance key
 * @returns {string} Display label
 */
function getComplianceLabel(key) {
  const labels = {
    ratio: '추출 비율',
    temperature: '물 온도',
    waterQuality: '물 품질',
  }
  return labels[key] || key
}

/**
 * Print PDF report (opens print dialog)
 * @param {Object} reportData - Report data object
 */
export function printPDFReport(reportData) {
  const htmlContent = generatePDFContent(reportData)

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}

export default {
  generateReportData,
  generateCSV,
  generateJSON,
  generatePDFContent,
  downloadFile,
  generateFilename,
  exportReport,
  printPDFReport,
}
