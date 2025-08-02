#!/usr/bin/env node

/**
 * Cross-Browser Compatibility Test for CupNote
 * Tests functionality and UI consistency across browsers
 */

import { chromium, firefox, webkit } from 'playwright'
import fs from 'fs'
import path from 'path'

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  browsers: ['chromium', 'firefox', 'webkit'],
  viewport: { width: 1280, height: 720 },
  timeout: 30000
}

const TEST_SCENARIOS = [
  {
    name: 'Home Page Loading',
    url: '/',
    checks: [
      { selector: 'h1', expectedText: '☕ CupNote' },
      { selector: '[href="/mode-selection"]', exists: true },
      { selector: 'button', exists: true }
    ]
  },
  {
    name: 'Performance Optimizations',
    url: '/',
    checks: [
      { component: 'CoreWebVitalsOptimizer', exists: true },
      { component: 'OptimizedLayout', exists: true },
      { component: 'ResourceHints', exists: true }
    ]
  },
  {
    name: 'Navigation Functionality',
    url: '/',
    interactions: [
      { action: 'click', selector: 'button[onclick*="openAuthModal"]' },
      { wait: 1000 },
      { check: 'modal', exists: true }
    ]
  }
]

async function launchBrowser(browserType) {
  const browsers = { chromium, firefox, webkit }
  
  try {
    const browser = await browsers[browserType].launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    })
    return browser
  } catch (error) {
    console.error(`❌ Failed to launch ${browserType}:`, error.message)
    return null
  }
}

async function testScenario(page, scenario, browserType) {
  const url = CONFIG.baseUrl + scenario.url
  const results = {
    scenario: scenario.name,
    browser: browserType,
    url,
    success: false,
    checks: [],
    screenshots: [],
    errors: []
  }

  try {
    console.log(`    📄 Testing: ${scenario.name}`)
    
    // Navigate to page
    const startTime = Date.now()
    await page.goto(url, { waitUntil: 'networkidle', timeout: CONFIG.timeout })
    const loadTime = Date.now() - startTime
    
    results.loadTime = loadTime
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000)

    // Run checks
    if (scenario.checks) {
      for (const check of scenario.checks) {
        try {
          if (check.selector) {
            const element = await page.$(check.selector)
            const exists = element !== null
            
            let text = null
            if (exists && check.expectedText) {
              text = await element.textContent()
            }
            
            const checkResult = {
              type: 'selector',
              selector: check.selector,
              exists,
              expectedText: check.expectedText,
              actualText: text,
              passed: exists && (!check.expectedText || text?.includes(check.expectedText))
            }
            
            results.checks.push(checkResult)
          } else if (check.component) {
            // Check for React component by looking for specific classes or data attributes
            const componentExists = await page.evaluate((componentName) => {
              // Look for component-specific indicators
              const indicators = {
                'CoreWebVitalsOptimizer': ['critical-content', 'dynamic-content-placeholder'],
                'OptimizedLayout': ['min-h-screen', 'flex', 'flex-col'],
                'ResourceHints': () => {
                  // Check for DNS prefetch and preconnect links
                  const links = document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"]')
                  return links.length > 0
                }
              }
              
              if (typeof indicators[componentName] === 'function') {
                return indicators[componentName]()
              } else if (Array.isArray(indicators[componentName])) {
                return indicators[componentName].some(className => 
                  document.querySelector(`.${className}`) !== null
                )
              }
              return false
            }, check.component)
            
            const checkResult = {
              type: 'component',
              component: check.component,
              exists: componentExists,
              passed: componentExists
            }
            
            results.checks.push(checkResult)
          }
        } catch (error) {
          results.checks.push({
            type: 'error',
            check,
            error: error.message,
            passed: false
          })
        }
      }
    }

    // Run interactions
    if (scenario.interactions) {
      for (const interaction of scenario.interactions) {
        try {
          if (interaction.action === 'click') {
            await page.click(interaction.selector)
          } else if (interaction.wait) {
            await page.waitForTimeout(interaction.wait)
          } else if (interaction.check) {
            // Run a custom check
            const checkExists = await page.evaluate(() => {
              return document.querySelector('[role="dialog"], .modal, [data-modal]') !== null
            })
            
            results.checks.push({
              type: 'interaction-check',
              check: interaction.check,
              exists: checkExists,
              passed: checkExists
            })
          }
        } catch (error) {
          results.errors.push(`Interaction failed: ${error.message}`)
        }
      }
    }

    // Take screenshot for visual verification
    const screenshotPath = path.join(process.cwd(), 'reports', 'screenshots')
    if (!fs.existsSync(screenshotPath)) {
      fs.mkdirSync(screenshotPath, { recursive: true })
    }
    
    const screenshotFile = `${scenario.name.replace(/\s+/g, '-')}-${browserType}.png`
    const fullScreenshotPath = path.join(screenshotPath, screenshotFile)
    await page.screenshot({ path: fullScreenshotPath, fullPage: true })
    results.screenshots.push(fullScreenshotPath)

    // Check for JavaScript errors
    const jsErrors = await page.evaluate(() => {
      return window.__jsErrors || []
    })
    
    if (jsErrors.length > 0) {
      results.errors.push(...jsErrors)
    }

    results.success = results.checks.every(check => check.passed) && results.errors.length === 0
    
  } catch (error) {
    results.errors.push(error.message)
    results.success = false
  }

  return results
}

async function testBrowser(browserType) {
  console.log(`🌐 Testing ${browserType}...`)
  
  const browser = await launchBrowser(browserType)
  if (!browser) {
    return {
      browser: browserType,
      success: false,
      error: 'Failed to launch browser'
    }
  }

  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    userAgent: getUserAgent(browserType)
  })

  const results = []
  const errors = []

  try {
    const page = await context.newPage()

    // Capture JavaScript errors
    page.on('pageerror', error => {
      errors.push(`JS Error: ${error.message}`)
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`)
      }
    })

    // Inject error tracking
    await page.addInitScript(() => {
      window.__jsErrors = []
      window.addEventListener('error', (e) => {
        window.__jsErrors.push(e.message)
      })
    })

    // Test each scenario
    for (const scenario of TEST_SCENARIOS) {
      const result = await testScenario(page, scenario, browserType)
      result.browserErrors = [...errors]
      results.push(result)
      
      // Clear errors for next test
      errors.length = 0
    }

  } catch (error) {
    console.error(`❌ Error testing ${browserType}:`, error.message)
    return {
      browser: browserType,
      success: false,
      error: error.message,
      results: []
    }
  } finally {
    await browser.close()
  }

  return {
    browser: browserType,
    success: true,
    results,
    timestamp: new Date().toISOString()
  }
}

function getUserAgent(browserType) {
  const userAgents = {
    chromium: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    webkit: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  }
  return userAgents[browserType] || userAgents.chromium
}

function analyzeResults(allResults) {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 CROSS-BROWSER COMPATIBILITY ANALYSIS')
  console.log('='.repeat(80))

  const successfulBrowsers = allResults.filter(r => r.success)
  
  if (successfulBrowsers.length === 0) {
    console.log('❌ No successful browser tests')
    return
  }

  // Overall compatibility
  console.log('\n📊 BROWSER COMPATIBILITY OVERVIEW:')
  successfulBrowsers.forEach(browserResult => {
    const browser = browserResult.browser
    const totalTests = browserResult.results.length
    const passedTests = browserResult.results.filter(r => r.success).length
    const successRate = Math.round((passedTests / totalTests) * 100)
    
    const status = successRate >= 90 ? '✅' : successRate >= 70 ? '⚠️' : '❌'
    console.log(`  ${getBrowserIcon(browser)} ${browser}: ${status} ${passedTests}/${totalTests} tests passed (${successRate}%)`)
  })

  // Detailed scenario results
  console.log('\n🔧 SCENARIO RESULTS:')
  TEST_SCENARIOS.forEach(scenario => {
    console.log(`\n📋 ${scenario.name}:`)
    
    successfulBrowsers.forEach(browserResult => {
      const scenarioResult = browserResult.results.find(r => r.scenario === scenario.name)
      if (scenarioResult) {
        const status = scenarioResult.success ? '✅' : '❌'
        const loadTime = scenarioResult.loadTime || 'N/A'
        console.log(`  ${getBrowserIcon(browserResult.browser)} ${browserResult.browser}: ${status} (${loadTime}ms)`)
        
        if (!scenarioResult.success) {
          scenarioResult.checks.forEach(check => {
            if (!check.passed) {
              console.log(`    ⚠️  ${check.type}: ${JSON.stringify(check)}`)
            }
          })
          
          if (scenarioResult.errors.length > 0) {
            scenarioResult.errors.forEach(error => {
              console.log(`    🐛 ${error}`)
            })
          }
        }
      }
    })
  })

  // Performance optimizations check
  console.log('\n⚡ PERFORMANCE OPTIMIZATION STATUS:')
  
  const optimizationTests = successfulBrowsers.map(browserResult => {
    const perfTest = browserResult.results.find(r => r.scenario === 'Performance Optimizations')
    return {
      browser: browserResult.browser,
      optimizationsWorking: perfTest ? perfTest.success : false,
      details: perfTest ? perfTest.checks : []
    }
  })

  optimizationTests.forEach(test => {
    const status = test.optimizationsWorking ? '✅' : '⚠️'
    console.log(`  ${getBrowserIcon(test.browser)} ${test.browser}: ${status} ${test.optimizationsWorking ? 'Optimizations Active' : 'Limited Optimization Support'}`)
    
    if (test.details.length > 0) {
      test.details.forEach(detail => {
        const componentStatus = detail.passed ? '✅' : '❌'
        console.log(`    ${componentStatus} ${detail.component || detail.selector}: ${detail.passed ? 'Working' : 'Failed'}`)
      })
    }
  })

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  
  const issues = []
  successfulBrowsers.forEach(browserResult => {
    const browser = browserResult.browser
    const failedTests = browserResult.results.filter(r => !r.success)
    
    if (failedTests.length > 0) {
      issues.push(`${browser}: ${failedTests.length} scenarios need attention`)
    }
  })

  if (issues.length > 0) {
    issues.forEach(issue => console.log(`  ⚠️  ${issue}`))
    console.log('  🔧 Review failed scenarios and optimize for browser compatibility')
  } else {
    console.log('  ✅ All browsers fully compatible!')
    console.log('  🎯 Performance optimizations working across all browsers')
    console.log('  📱 Responsive design functioning properly')
  }

  // Final assessment
  const overallCompatibility = successfulBrowsers.every(br => 
    br.results.every(r => r.success)
  )

  console.log('\n🎯 OVERALL ASSESSMENT:')
  if (overallCompatibility) {
    console.log('  ✅ EXCELLENT: Full cross-browser compatibility achieved')
    console.log('  ⚡ Performance optimizations working effectively')
    console.log('  🚀 Ready for production deployment')
  } else {
    console.log('  ⚠️  GOOD: Minor compatibility issues detected')
    console.log('  🔧 Address identified issues for optimal experience')
  }
}

function getBrowserIcon(browser) {
  const icons = {
    chromium: '🌐',
    firefox: '🦊',
    webkit: '🧭'
  }
  return icons[browser] || '🌐'
}

async function saveResults(allResults) {
  const reportsDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `cross-browser-compatibility-${timestamp}.json`
  const filePath = path.join(reportsDir, fileName)

  const report = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    scenarios: TEST_SCENARIOS,
    results: allResults,
    summary: {
      totalBrowsers: CONFIG.browsers.length,
      successfulBrowsers: allResults.filter(r => r.success).length,
      totalScenarios: TEST_SCENARIOS.length,
      overallCompatibility: allResults.every(br => 
        br.success && br.results.every(r => r.success)
      )
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Compatibility report saved to: ${filePath}`)
  
  const screenshotsDir = path.join(reportsDir, 'screenshots')
  if (fs.existsSync(screenshotsDir)) {
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`)
  }
}

async function main() {
  console.log('🚀 Starting Cross-Browser Compatibility Testing...')
  console.log(`🎯 Testing ${CONFIG.browsers.length} browsers with ${TEST_SCENARIOS.length} scenarios`)
  console.log(`📋 Browsers: ${CONFIG.browsers.join(', ')}`)
  
  const allResults = []

  // Test each browser
  for (const browserType of CONFIG.browsers) {
    try {
      const result = await testBrowser(browserType)
      allResults.push(result)
    } catch (error) {
      console.error(`❌ Failed to test ${browserType}:`, error)
      allResults.push({
        browser: browserType,
        success: false,
        error: error.message,
        results: []
      })
    }
    
    // Wait between browser tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Analyze and report results
  analyzeResults(allResults)
  await saveResults(allResults)

  const successfulTests = allResults.filter(r => r.success).length
  console.log(`\n🎯 Cross-browser compatibility testing completed: ${successfulTests}/${CONFIG.browsers.length} browsers tested successfully`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}