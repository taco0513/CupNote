import { Page, Locator, BrowserContext } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for PWA (Progressive Web App) functionality
 */
export class PWAPage extends BasePage {
  private readonly context: BrowserContext

  // PWA install locators
  private readonly installButton: Locator
  private readonly installPrompt: Locator
  private readonly installBanner: Locator
  private readonly installDismiss: Locator

  // Offline functionality locators
  private readonly offlineIndicator: Locator
  private readonly onlineIndicator: Locator
  private readonly networkStatus: Locator
  private readonly syncStatus: Locator
  private readonly offlineMessage: Locator

  // Service worker locators
  private readonly swRegistration: Locator
  private readonly swUpdatePrompt: Locator
  private readonly updateButton: Locator

  // Background sync locators
  private readonly syncIndicator: Locator
  private readonly pendingSyncCount: Locator
  private readonly syncCompleteMessage: Locator

  // Cache status locators
  private readonly cacheStatus: Locator
  private readonly cacheSize: Locator
  private readonly clearCacheButton: Locator

  constructor(page: Page, context: BrowserContext) {
    super(page)
    this.context = context

    // PWA install
    this.installButton = page.locator('[data-testid="pwa-install-button"]')
    this.installPrompt = page.locator('[data-testid="install-prompt"]')
    this.installBanner = page.locator('[data-testid="install-banner"]')
    this.installDismiss = page.locator('[data-testid="install-dismiss"]')

    // Offline functionality
    this.offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    this.onlineIndicator = page.locator('[data-testid="online-indicator"]')
    this.networkStatus = page.locator('[data-testid="network-status"]')
    this.syncStatus = page.locator('[data-testid="sync-status"]')
    this.offlineMessage = page.locator('[data-testid="offline-message"]')

    // Service worker
    this.swRegistration = page.locator('[data-testid="sw-registration"]')
    this.swUpdatePrompt = page.locator('[data-testid="sw-update-prompt"]')
    this.updateButton = page.locator('[data-testid="update-app-button"]')

    // Background sync
    this.syncIndicator = page.locator('[data-testid="sync-indicator"]')
    this.pendingSyncCount = page.locator('[data-testid="pending-sync-count"]')
    this.syncCompleteMessage = page.locator('[data-testid="sync-complete"]')

    // Cache status
    this.cacheStatus = page.locator('[data-testid="cache-status"]')
    this.cacheSize = page.locator('[data-testid="cache-size"]')
    this.clearCacheButton = page.locator('[data-testid="clear-cache"]')
  }

  // Service Worker testing methods
  async testServiceWorkerRegistration() {
    await this.goto('/')
    
    // Check if service worker is registered
    const swRegistered = await this.page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return !!registration
      }
      return false
    })

    expect(swRegistered).toBe(true)
  }

  async testServiceWorkerUpdate() {
    await this.goto('/')
    
    // Simulate service worker update
    await this.page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          // Simulate update available
          const event = new CustomEvent('sw-update-available')
          window.dispatchEvent(event)
        }
      }
    })

    // Check for update prompt
    await this.swUpdatePrompt.waitFor({ state: 'visible', timeout: 5000 })
    await this.updateButton.click()
    
    // Verify update is applied
    await this.page.reload()
    await this.waitForPageLoad()
  }

  // PWA Installation testing methods
  async testInstallPrompt() {
    await this.goto('/')
    
    // Trigger install prompt (simulated)
    await this.page.evaluate(() => {
      // Simulate beforeinstallprompt event
      const event = new CustomEvent('beforeinstallprompt', {
        cancelable: true
      })
      window.dispatchEvent(event)
    })

    // Check if install prompt appears
    await this.installPrompt.waitFor({ state: 'visible', timeout: 5000 })
    await this.expectElementVisible('[data-testid="install-prompt"]')
  }

  async testInstallFlow() {
    await this.testInstallPrompt()
    
    // Click install button
    await this.installButton.click()
    
    // Verify installation (this is simulated as real PWA install requires user interaction)
    await this.page.evaluate(() => {
      // Simulate successful installation
      const event = new CustomEvent('appinstalled')
      window.dispatchEvent(event)
    })

    // Check for installation success feedback
    await this.expectElementVisible('[data-testid="install-success"]')
  }

  async testInstallDismiss() {
    await this.testInstallPrompt()
    
    // Dismiss install prompt
    await this.installDismiss.click()
    
    // Verify prompt is hidden
    await this.installPrompt.waitFor({ state: 'hidden' })
  }

  // Offline functionality testing methods
  async testOfflineDetection() {
    await this.goto('/')
    
    // Go offline
    await this.context.setOffline(true)
    
    // Wait for offline indicator
    await this.offlineIndicator.waitFor({ state: 'visible', timeout: 5000 })
    await this.expectText('[data-testid="network-status"]', '오프라인')
  }

  async testOnlineDetection() {
    // Start offline
    await this.context.setOffline(true)
    await this.goto('/')
    
    // Go back online
    await this.context.setOffline(false)
    
    // Wait for online indicator
    await this.onlineIndicator.waitFor({ state: 'visible', timeout: 5000 })
    await this.expectText('[data-testid="network-status"]', '온라인')
  }

  async testOfflinePageAccess() {
    // Go offline
    await this.context.setOffline(true)
    
    // Navigate to main pages - should work offline due to caching
    const pages = ['/', '/stats', '/achievements']
    
    for (const path of pages) {
      await this.goto(path)
      await this.waitForPageLoad()
      
      // Should show offline indicator but page should load
      await this.expectElementVisible('[data-testid="offline-indicator"]')
      await this.expectElementVisible('main') // Main content should be visible
    }
  }

  async testOfflineCoffeeRecordCreation() {
    // Go offline
    await this.context.setOffline(true)
    await this.goto('/')
    
    // Try to create a coffee record while offline
    const recordPage = new (await import('./CoffeeRecordPage')).CoffeeRecordPage(this.page)
    
    await recordPage.startRecording()
    await recordPage.selectMode('cafe')
    
    await recordPage.fillCoffeeInfo({
      name: 'Offline Coffee',
      roastery: 'Offline Roastery',
      origin: 'Brazil'
    })
    
    await recordPage.goToNextStep()
    await recordPage.fillRoasterNotes('Offline roaster note')
    await recordPage.goToNextStep()
    
    await recordPage.fillPersonalTasting({
      taste: 'Offline taste',
      memo: 'Created while offline',
      rating: 4
    })
    
    await recordPage.goToNextStep()
    await recordPage.saveRecord()
    
    // Should show offline save indicator
    await this.expectElementVisible('[data-testid="offline-save-indicator"]')
    await this.expectText('[data-testid="sync-status"]', '동기화 대기 중')
  }

  // Background sync testing methods
  async testBackgroundSync() {
    // Create offline record first
    await this.testOfflineCoffeeRecordCreation()
    
    // Check pending sync count
    await this.expectElementVisible('[data-testid="pending-sync-count"]')
    const pendingCount = await this.pendingSyncCount.textContent()
    expect(parseInt(pendingCount || '0')).toBeGreaterThan(0)
    
    // Go back online
    await this.context.setOffline(false)
    
    // Wait for background sync to complete
    await this.syncCompleteMessage.waitFor({ state: 'visible', timeout: 10000 })
    await this.expectText('[data-testid="sync-status"]', '동기화 완료')
    
    // Verify pending count is reset
    await this.expectText('[data-testid="pending-sync-count"]', '0')
  }

  async testSyncConflictResolution() {
    // Create a record offline
    await this.testOfflineCoffeeRecordCreation()
    
    // Simulate server-side changes while offline
    await this.page.evaluate(() => {
      // Simulate conflict scenario
      localStorage.setItem('sync-conflict', 'true')
    })
    
    // Go back online
    await this.context.setOffline(false)
    
    // Should show conflict resolution dialog
    await this.expectElementVisible('[data-testid="sync-conflict-dialog"]')
    
    // Choose resolution (keep local changes)
    await this.page.locator('[data-testid="keep-local-changes"]').click()
    
    // Verify conflict is resolved
    await this.expectElementHidden('[data-testid="sync-conflict-dialog"]')
    await this.expectText('[data-testid="sync-status"]', '동기화 완료')
  }

  // Cache management testing methods
  async testCacheStatus() {
    await this.goto('/settings')
    
    // Check cache status display
    await this.expectElementVisible('[data-testid="cache-status"]')
    await this.expectElementVisible('[data-testid="cache-size"]')
    
    // Verify cache size is shown
    const cacheSize = await this.cacheSize.textContent()
    expect(cacheSize).toMatch(/\d+(\.\d+)?\s*(KB|MB)/)
  }

  async testCacheClear() {
    await this.goto('/settings')
    
    // Clear cache
    await this.clearCacheButton.click()
    
    // Confirm cache clear
    await this.page.locator('[data-testid="confirm-clear-cache"]').click()
    
    // Verify cache is cleared
    await this.expectText('[data-testid="cache-status"]', '캐시 클리어됨')
    
    // Reload page to verify it still works (should re-cache)
    await this.page.reload()
    await this.waitForPageLoad()
  }

  // Performance testing methods
  async testOfflinePerformance() {
    await this.context.setOffline(true)
    
    const startTime = Date.now()
    await this.goto('/')
    await this.waitForPageLoad()
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    expect(loadTime).toBeLessThan(2000) // Should load quickly from cache
  }

  async testCacheEfficiency() {
    // First load (should cache resources)
    await this.goto('/')
    await this.waitForPageLoad()
    
    // Second load (should use cache)
    const startTime = Date.now()
    await this.page.reload()
    await this.waitForPageLoad()
    const endTime = Date.now()
    
    const cachedLoadTime = endTime - startTime
    expect(cachedLoadTime).toBeLessThan(1000) // Cached load should be fast
  }

  // Mobile PWA testing methods
  async testMobilePWAFeatures() {
    await this.setMobileViewport()
    await this.goto('/')
    
    // Test mobile-specific PWA features
    await this.expectElementVisible('[data-testid="mobile-pwa-banner"]')
    
    // Test "Add to Home Screen" prompt on mobile
    await this.testInstallPrompt()
    
    // Test mobile offline functionality
    await this.testOfflineDetection()
  }

  async testMobileNetworkSwitching() {
    await this.setMobileViewport()
    
    // Simulate mobile network switching (WiFi to cellular)
    await this.context.setOffline(true)
    await this.page.waitForTimeout(1000)
    await this.context.setOffline(false)
    
    // Should handle network switching gracefully
    await this.expectElementVisible('[data-testid="network-reconnected"]')
  }

  // Accessibility testing for PWA features
  async testPWAAccessibility() {
    await this.goto('/')
    
    // Test install prompt accessibility
    await this.testInstallPrompt()
    await this.expectAriaLabel('[data-testid="install-button"]', 'PWA 설치')
    
    // Test offline indicator accessibility
    await this.context.setOffline(true)
    await this.expectAriaLabel('[data-testid="offline-indicator"]', '오프라인 상태')
    
    // Test keyboard navigation for PWA controls
    await this.page.keyboard.press('Tab')
    await this.expectFocused('[data-testid="install-button"]')
  }

  // Edge case testing
  async testPWAEdgeCases() {
    // Test PWA behavior with very slow network
    await this.context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      await route.continue()
    })
    
    await this.goto('/')
    
    // Should show loading indicator for slow network
    await this.expectElementVisible('[data-testid="slow-network-indicator"]')
    
    // Clean up route
    await this.context.unroute('**/*')
  }

  async testPWAWithCookiesDisabled() {
    // Disable cookies
    await this.context.clearCookies()
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'cookieEnabled', { value: false })
    })
    
    await this.goto('/')
    
    // PWA should still work without cookies
    await this.testServiceWorkerRegistration()
    await this.testOfflineDetection()
  }

  // Integration testing
  async testPWAWithAuthentication() {
    // Test PWA features with authenticated user
    const authPage = new (await import('./AuthPage')).AuthPage(this.page)
    
    await authPage.login('test@example.com', 'password123')
    
    // Test offline functionality with authenticated user
    await this.testOfflineCoffeeRecordCreation()
    await this.testBackgroundSync()
  }

  async testPWADataPersistence() {
    // Create some data
    const recordPage = new (await import('./CoffeeRecordPage')).CoffeeRecordPage(this.page)
    
    await recordPage.completeFullRecord({
      mode: 'cafe',
      coffeeInfo: {
        name: 'PWA Test Coffee',
        roastery: 'PWA Roastery',
        origin: 'Kenya'
      },
      roasterNote: 'PWA test note',
      personalTasting: {
        taste: 'PWA test taste',
        memo: 'PWA test memo',
        rating: 5
      }
    })
    
    // Go offline and verify data persists
    await this.context.setOffline(true)
    await this.goto('/')
    
    // Data should still be visible
    await this.expectText('[data-testid="coffee-card"]', 'PWA Test Coffee')
    
    // Go back online and verify sync
    await this.context.setOffline(false)
    await this.waitForElement('[data-testid="sync-complete"]')
  }
}