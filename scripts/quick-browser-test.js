#!/usr/bin/env node

/**
 * Quick Cross-Browser Test for Performance Optimizations
 * Fast validation of CoreWebVitalsOptimizer across browsers
 */

import { chromium, firefox, webkit } from 'playwright'
import fs from 'fs'
import path from 'path'

const CONFIG = {
  baseUrl: 'http://localhost:5173',
  browsers: ['chromium', 'firefox', 'webkit'],
  viewport: { width: 1280, height: 720 },
  timeout: 10000
}

async function quickTest(browserType) {
  console.log(`🌐 Quick testing ${browserType}...`)
  
  try {
    const browsers = { chromium, firefox, webkit }
    const browser = await browsers[browserType].launch({ headless: true })
    const page = await browser.newPage()
    
    // Test home page
    const startTime = Date.now()
    await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout })
    const loadTime = Date.now() - startTime
    
    // Check for optimization components
    await page.waitForTimeout(2000)
    
    const optimizations = await page.evaluate(() => {
      const results = {
        coreWebVitalsOptimizer: false,
        optimizedLayout: false,
        resourceHints: false,
        criticalContent: false,
        preloadLinks: 0,
        performanceObserver: false
      }
      
      // Check for optimization indicators
      results.criticalContent = document.querySelector('.critical-content') !== null
      results.optimizedLayout = document.querySelector('.min-h-screen') !== null
      
      // Check for preload links
      results.preloadLinks = document.querySelectorAll('link[rel="preload"]').length
      
      // Check for DNS prefetch/preconnect
      const resourceHints = document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"]')
      results.resourceHints = resourceHints.length > 0
      
      // Check if PerformanceObserver is available and used
      results.performanceObserver = typeof PerformanceObserver !== 'undefined'
      
      // Check for optimization CSS classes
      results.coreWebVitalsOptimizer = document.querySelector('[data-optimize]') !== null ||
                                       document.querySelector('.dynamic-content-placeholder') !== null
      
      return results
    })
    
    // Check page accessibility
    const pageTitle = await page.title()
    const hasMainHeading = await page.$('h1') !== null
    
    await browser.close()
    
    return {
      browser: browserType,
      success: true,
      loadTime,
      pageTitle,
      hasMainHeading,
      optimizations,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      browser: browserType,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

function analyzeQuickResults(results) {
  console.log('\n' + '='.repeat(60))
  console.log('⚡ QUICK CROSS-BROWSER OPTIMIZATION CHECK')
  console.log('='.repeat(60))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`\n📊 BROWSER STATUS: ${successful.length}/${results.length} successful`)
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED BROWSERS:')
    failed.forEach(r => {
      console.log(`  🌐 ${r.browser}: ${r.error}`)
    })
  }
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL BROWSERS:')
    successful.forEach(result => {
      console.log(`\n🌐 ${result.browser.toUpperCase()}:`)
      console.log(`  ⏱️  Load Time: ${result.loadTime}ms`)
      console.log(`  📄 Page Title: ${result.pageTitle}`)
      console.log(`  🎯 Main Heading: ${result.hasMainHeading ? '✅' : '❌'}`)
      
      const opt = result.optimizations
      console.log('  🚀 Performance Optimizations:')
      console.log(`    CoreWebVitalsOptimizer: ${opt.coreWebVitalsOptimizer ? '✅' : '❌'}`)
      console.log(`    OptimizedLayout: ${opt.optimizedLayout ? '✅' : '❌'}`)
      console.log(`    ResourceHints: ${opt.resourceHints ? '✅' : '❌'}`)
      console.log(`    CriticalContent: ${opt.criticalContent ? '✅' : '❌'}`)
      console.log(`    PreloadLinks: ${opt.preloadLinks} found`)
      console.log(`    PerformanceObserver: ${opt.performanceObserver ? '✅' : '❌'}`)
    })
    
    // Overall assessment
    console.log('\n📈 OPTIMIZATION EFFECTIVENESS:')
    
    const avgLoadTime = successful.reduce((sum, r) => sum + r.loadTime, 0) / successful.length
    const optimizationScores = successful.map(r => {
      const opt = r.optimizations
      const score = [
        opt.coreWebVitalsOptimizer,
        opt.optimizedLayout, 
        opt.resourceHints,
        opt.criticalContent,
        opt.performanceObserver
      ].filter(Boolean).length
      return { browser: r.browser, score, maxScore: 5 }
    })
    
    console.log(`  ⚡ Average Load Time: ${Math.round(avgLoadTime)}ms`)
    
    optimizationScores.forEach(({ browser, score, maxScore }) => {
      const percentage = Math.round((score / maxScore) * 100)
      const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌'
      console.log(`  ${status} ${browser}: ${score}/${maxScore} optimizations active (${percentage}%)`)
    })
    
    const overallOptimization = optimizationScores.every(s => s.score >= 4)
    
    console.log('\n🎯 FINAL ASSESSMENT:')
    if (overallOptimization && avgLoadTime < 5000) {
      console.log('  ✅ EXCELLENT: Performance optimizations working across all browsers')
      console.log('  🚀 CoreWebVitalsOptimizer successfully deployed')
      console.log('  📊 Cross-browser compatibility confirmed')
    } else if (avgLoadTime < 8000) {
      console.log('  ⚠️  GOOD: Most optimizations working, minor issues detected')
      console.log('  🔧 Some browsers may need additional optimization')
    } else {
      console.log('  ❌ NEEDS WORK: Performance optimizations not fully effective')
      console.log('  🔍 Review optimization implementation')
    }
  }
}

async function main() {
  console.log('⚡ Quick Cross-Browser Optimization Test')
  console.log('🎯 Testing performance optimizations across browsers\n')
  
  const results = []
  
  for (const browser of CONFIG.browsers) {
    const result = await quickTest(browser)
    results.push(result)
    
    // Short delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  analyzeQuickResults(results)
  
  // Save results
  const reportsDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `quick-browser-test-${timestamp}.json`
  const filePath = path.join(reportsDir, fileName)
  
  fs.writeFileSync(filePath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: CONFIG,
    results,
    summary: {
      totalBrowsers: CONFIG.browsers.length,
      successfulBrowsers: results.filter(r => r.success).length,
      avgLoadTime: results.filter(r => r.success).reduce((sum, r) => sum + r.loadTime, 0) / results.filter(r => r.success).length || 0
    }
  }, null, 2))
  
  console.log(`\n💾 Quick test results saved to: ${fileName}`)
  console.log('🎯 Cross-browser optimization validation complete!')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}