#!/usr/bin/env node

/**
 * Performance Audit Script
 * Uses Lighthouse to measure Core Web Vitals and performance metrics
 */

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import fs from 'fs'
import path from 'path'

const CONFIG = {
  // Production server audit (now working)
  urls: [
    'http://localhost:3003',
    'http://localhost:3003/mode-selection',
    'http://localhost:3003/stats'
  ],
  lighthouse: {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: 0, // Will be set dynamically
  },
  chrome: {
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  }
}

async function runAudit(url, chrome) {
  console.log(`🔍 Auditing: ${url}`)
  
  try {
    const runnerResult = await lighthouse(url, {
      ...CONFIG.lighthouse,
      port: chrome.port,
    })

    const { lhr } = runnerResult
    
    return {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        pwa: lhr.categories.pwa ? Math.round(lhr.categories.pwa.score * 100) : 'N/A'
      },
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
        firstInputDelay: lhr.audits['max-potential-fid']?.numericValue || 0,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
        speedIndex: lhr.audits['speed-index'].numericValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].numericValue
      },
      diagnostics: {
        unminifiedCSS: lhr.audits['unminified-css']?.score === 1,
        unusedCSS: lhr.audits['unused-css-rules']?.score === 1,
        modernImageFormats: lhr.audits['modern-image-formats']?.score === 1,
        efficientImages: lhr.audits['uses-optimized-images']?.score === 1,
        textCompression: lhr.audits['uses-text-compression']?.score === 1
      },
      opportunities: lhr.audits['diagnostics']?.details?.items || [],
      rawReport: lhr
    }
  } catch (error) {
    console.error(`❌ Error auditing ${url}:`, error.message)
    return null
  }
}

function generateReport(results) {
  const validResults = results.filter(r => r !== null)
  
  if (validResults.length === 0) {
    console.log('❌ No valid audit results')
    return
  }

  console.log('\n' + '='.repeat(80))
  console.log('🎯 CUPNOTE PERFORMANCE AUDIT REPORT')
  console.log('='.repeat(80))
  
  // Overall summary
  const avgScores = {
    performance: Math.round(validResults.reduce((sum, r) => sum + r.scores.performance, 0) / validResults.length),
    accessibility: Math.round(validResults.reduce((sum, r) => sum + r.scores.accessibility, 0) / validResults.length),
    bestPractices: Math.round(validResults.reduce((sum, r) => sum + r.scores.bestPractices, 0) / validResults.length),
    seo: Math.round(validResults.reduce((sum, r) => sum + r.scores.seo, 0) / validResults.length)
  }

  console.log('\n📊 OVERALL SCORES (Average):')
  console.log(`Performance:     ${getScoreColor(avgScores.performance)}${avgScores.performance}/100${getColorReset()}`)
  console.log(`Accessibility:   ${getScoreColor(avgScores.accessibility)}${avgScores.accessibility}/100${getColorReset()}`)
  console.log(`Best Practices:  ${getScoreColor(avgScores.bestPractices)}${avgScores.bestPractices}/100${getColorReset()}`)
  console.log(`SEO:             ${getScoreColor(avgScores.seo)}${avgScores.seo}/100${getColorReset()}`)

  // Core Web Vitals
  console.log('\n⚡ CORE WEB VITALS:')
  validResults.forEach(result => {
    console.log(`\n📄 ${result.url}:`)
    console.log(`  LCP: ${formatMetric(result.metrics.largestContentfulPaint, 'ms', 2500, 4000)}`)
    console.log(`  FID: ${formatMetric(result.metrics.firstInputDelay, 'ms', 100, 300)}`)
    console.log(`  CLS: ${formatMetric(result.metrics.cumulativeLayoutShift, '', 0.1, 0.25)}`)
    console.log(`  FCP: ${formatMetric(result.metrics.firstContentfulPaint, 'ms', 1800, 3000)}`)
  })

  // Performance diagnostics
  console.log('\n🔧 OPTIMIZATION OPPORTUNITIES:')
  const commonIssues = {}
  
  validResults.forEach(result => {
    if (!result.diagnostics.unminifiedCSS) commonIssues['Unminified CSS'] = true
    if (!result.diagnostics.unusedCSS) commonIssues['Unused CSS'] = true
    if (!result.diagnostics.modernImageFormats) commonIssues['Modern Image Formats'] = true
    if (!result.diagnostics.efficientImages) commonIssues['Image Optimization'] = true
    if (!result.diagnostics.textCompression) commonIssues['Text Compression'] = true
  })

  Object.keys(commonIssues).forEach(issue => {
    console.log(`  ⚠️  ${issue}`)
  })

  if (Object.keys(commonIssues).length === 0) {
    console.log('  ✅ No major optimization opportunities found!')
  }

  // UX/UI Enhancement Assessment
  console.log('\n🎨 UX/UI ENHANCEMENT ASSESSMENT:')
  
  const accessibilityAvg = avgScores.accessibility
  const performanceAvg = avgScores.performance
  
  if (accessibilityAvg >= 95) {
    console.log('  ✅ Accessibility: Excellent (WCAG AA compliant)')
  } else if (accessibilityAvg >= 80) {
    console.log('  ⚠️  Accessibility: Good (minor improvements needed)')
  } else {
    console.log('  ❌ Accessibility: Needs significant improvement')
  }
  
  if (performanceAvg >= 90) {
    console.log('  ✅ Performance: Excellent (optimized loading)')
  } else if (performanceAvg >= 75) {
    console.log('  ⚠️  Performance: Good (minor optimizations possible)')
  } else {
    console.log('  ❌ Performance: Needs optimization')
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  if (avgScores.performance < 90) {
    console.log('  📈 Performance: Implement code splitting, optimize images')
  }
  if (avgScores.accessibility < 95) {
    console.log('  ♿ Accessibility: Add missing ARIA labels, improve color contrast')
  }
  console.log('  🚀 Continue monitoring with automated performance budgets')

  console.log('\n' + '='.repeat(80))
}

function formatMetric(value, unit, good, needsImprovement) {
  const formatted = unit === 'ms' ? `${Math.round(value)}${unit}` : value.toFixed(3)
  
  if (value <= good) {
    return `${getColorGreen()}${formatted} ✅${getColorReset()}`
  } else if (value <= needsImprovement) {
    return `${getColorYellow()}${formatted} ⚠️${getColorReset()}`
  } else {
    return `${getColorRed()}${formatted} ❌${getColorReset()}`
  }
}

function getScoreColor(score) {
  if (score >= 90) return '\x1b[32m' // Green
  if (score >= 50) return '\x1b[33m' // Yellow
  return '\x1b[31m' // Red
}

function getColorGreen() { return '\x1b[32m' }
function getColorYellow() { return '\x1b[33m' }
function getColorRed() { return '\x1b[31m' }
function getColorReset() { return '\x1b[0m' }

async function saveResults(results) {
  const reportsDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `performance-audit-${timestamp}.json`
  const filePath = path.join(reportsDir, fileName)

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2))
  console.log(`\n💾 Full report saved to: ${filePath}`)
}

async function main() {
  console.log('🚀 Starting CupNote Performance Audit...')
  console.log(`📍 Testing ${CONFIG.urls.length} pages`)

  let chrome
  try {
    chrome = await chromeLauncher.launch(CONFIG.chrome)
    console.log(`🌐 Chrome launched on port ${chrome.port}`)

    const results = []
    for (const url of CONFIG.urls) {
      const result = await runAudit(url, chrome)
      if (result) {
        results.push(result)
      }
      
      // Wait between audits to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    generateReport(results)
    await saveResults(results)

  } catch (error) {
    console.error('❌ Audit failed:', error)
  } finally {
    if (chrome) {
      await chrome.kill()
      console.log('🔴 Chrome closed')
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}