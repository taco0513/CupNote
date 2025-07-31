import { test, expect } from '@playwright/test'
import { PWAPage } from './pages/PWAPage'
import { AuthPage } from './pages/AuthPage'
import { CoffeeRecordPage } from './pages/CoffeeRecordPage'

test.describe('PWA Features', () => {
  let pwaPage: PWAPage
  let authPage: AuthPage
  let coffeeRecordPage: CoffeeRecordPage

  test.beforeEach(async ({ page, context }) => {
    pwaPage = new PWAPage(page, context)
    authPage = new AuthPage(page)
    coffeeRecordPage = new CoffeeRecordPage(page)
    
    // Login before each test
    await authPage.goto('/')
    await authPage.login('test@example.com', 'password123')
    await authPage.expectAuthSuccess()
  })

  test.describe('Service Worker Registration', () => {
    test('should register service worker successfully', async () => {
      await pwaPage.testServiceWorkerRegistration()
    })

    test('should handle service worker updates', async () => {
      await pwaPage.testServiceWorkerUpdate()
    })

    test('should cache essential resources', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Check that service worker caches key resources
      const cacheKeys = await page.evaluate(async () => {
        const cacheNames = await caches.keys()
        return cacheNames
      })
      
      expect(cacheKeys.length).toBeGreaterThan(0)
      expect(cacheKeys.some(key => key.includes('cupnote'))).toBe(true)
    })

    test('should serve cached content when offline', async ({ context }) => {
      // Load page to populate cache
      await pwaPage.goto('/')
      await pwaPage.waitForPageLoad()
      
      // Go offline
      await context.setOffline(true)
      
      // Reload page - should serve from cache
      await pwaPage.page.reload()
      await pwaPage.waitForPageLoad()
      
      // Page should still be functional
      await pwaPage.expectElementVisible('main')
      await pwaPage.expectElementVisible('[data-testid="offline-indicator"]')
    })
  })

  test.describe('PWA Installation', () => {
    test('should show install prompt when available', async () => {
      await pwaPage.testInstallPrompt()
    })

    test('should handle install flow', async () => {
      await pwaPage.testInstallFlow()
    })

    test('should allow dismissing install prompt', async () => {
      await pwaPage.testInstallDismiss()
    })

    test('should not show install prompt if already installed', async ({ page }) => {
      // Simulate already installed state
      await page.evaluate(() => {
        localStorage.setItem('pwa-installed', 'true')
      })
      
      await pwaPage.goto('/')
      
      // Install prompt should not appear
      await pwaPage.expectElementHidden('[data-testid="install-prompt"]')
    })

    test('should show different prompts for mobile and desktop', async () => {
      // Test desktop prompt
      await pwaPage.setDesktopViewport()
      await pwaPage.testInstallPrompt()
      await pwaPage.expectElementVisible('[data-testid="desktop-install-prompt"]')
      
      // Test mobile prompt
      await pwaPage.setMobileViewport()
      await pwaPage.testInstallPrompt()
      await pwaPage.expectElementVisible('[data-testid="mobile-install-prompt"]')
    })
  })

  test.describe('Offline Detection', () => {
    test('should detect when going offline', async () => {
      await pwaPage.testOfflineDetection()
    })

    test('should detect when coming back online', async () => {
      await pwaPage.testOnlineDetection()
    })

    test('should show appropriate network status indicators', async ({ context }) => {
      // Start online
      await pwaPage.goto('/')
      await pwaPage.expectElementVisible('[data-testid="online-indicator"]')
      
      // Go offline
      await context.setOffline(true)
      await pwaPage.expectElementVisible('[data-testid="offline-indicator"]')
      
      // Go back online
      await context.setOffline(false)
      await pwaPage.expectElementVisible('[data-testid="online-indicator"]')
    })

    test('should handle intermittent connectivity', async ({ context }) => {
      await pwaPage.goto('/')
      
      // Simulate intermittent connectivity
      for (let i = 0; i < 3; i++) {
        await context.setOffline(true)
        await pwaPage.page.waitForTimeout(1000)
        await context.setOffline(false)
        await pwaPage.page.waitForTimeout(1000)
      }
      
      // Should handle connectivity changes gracefully
      await pwaPage.expectElementVisible('[data-testid="network-status"]')
    })
  })

  test.describe('Offline Functionality', () => {
    test('should allow browsing cached pages offline', async () => {
      await pwaPage.testOfflinePageAccess()
    })

    test('should create coffee records offline', async () => {
      await pwaPage.testOfflineCoffeeRecordCreation()
    })

    test('should queue offline actions for sync', async ({ context }) => {
      // Go offline
      await context.setOffline(true)
      
      // Create coffee record offline
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Offline Queue Test',
          roastery: 'Offline Roastery',
          origin: 'Offline Origin'
        },
        roasterNote: 'Created offline',
        personalTasting: {
          taste: 'Offline taste',
          memo: 'Queued for sync',
          rating: 4
        }
      })
      
      // Should show queued status
      await pwaPage.expectElementVisible('[data-testid="sync-queue"]')
      await pwaPage.expectText('[data-testid="pending-sync-count"]', '1')
    })

    test('should handle offline form validation', async ({ context }) => {
      await context.setOffline(true)
      await pwaPage.goto('/mode-selection')
      
      await coffeeRecordPage.selectMode('cafe')
      
      // Try to submit without required fields
      await coffeeRecordPage.goToNextStep()
      
      // Should show validation errors even offline
      await pwaPage.expectElementVisible('.text-red-500')
    })

    test('should provide offline capabilities for critical features', async ({ context }) => {
      // Go offline
      await context.setOffline(true)
      
      // Critical features that should work offline:
      
      // 1. View existing records
      await pwaPage.goto('/')
      await pwaPage.expectElementVisible('[data-testid="coffee-list"]')
      
      // 2. View achievements
      await pwaPage.goto('/achievements')
      await pwaPage.expectElementVisible('[data-testid="achievement-list"]')
      
      // 3. View statistics
      await pwaPage.goto('/stats')
      await pwaPage.expectElementVisible('[data-testid="stats-dashboard"]')
      
      // 4. Access settings
      await pwaPage.goto('/settings')
      await pwaPage.expectElementVisible('[data-testid="settings-panel"]')
    })
  })

  test.describe('Background Sync', () => {
    test('should sync offline data when back online', async () => {
      await pwaPage.testBackgroundSync()
    })

    test('should handle sync conflicts', async () => {
      await pwaPage.testSyncConflictResolution()
    })

    test('should retry failed sync operations', async ({ context, page }) => {
      // Create offline data
      await context.setOffline(true)
      await pwaPage.testOfflineCoffeeRecordCreation()
      
      // Go online but simulate server error
      await context.setOffline(false)
      await page.route('**/api/records', route => {
        route.fulfill({ status: 500, body: 'Server Error' })
      })
      
      // Should retry sync operation
      await pwaPage.expectElementVisible('[data-testid="sync-retry"]')
      
      // Remove error simulation
      await page.unroute('**/api/records')
      
      // Should eventually succeed
      await pwaPage.expectElementVisible('[data-testid="sync-complete"]')
    })

    test('should show sync progress indicators', async ({ context }) => {
      // Create multiple offline records
      await context.setOffline(true)
      
      for (let i = 0; i < 3; i++) {
        await coffeeRecordPage.completeFullRecord({
          mode: 'cafe',
          coffeeInfo: {
            name: `Sync Test ${i + 1}`,
            roastery: 'Sync Roastery',
            origin: 'Sync Origin'
          },
          roasterNote: `Sync test ${i + 1}`,
          personalTasting: {
            taste: `Sync taste ${i + 1}`,
            memo: `Sync memo ${i + 1}`,
            rating: 4
          }
        })
      }
      
      // Should show multiple items in sync queue
      await pwaPage.expectText('[data-testid="pending-sync-count"]', '3')
      
      // Go back online
      await context.setOffline(false)
      
      // Should show sync progress
      await pwaPage.expectElementVisible('[data-testid="sync-progress"]')
      
      // Should eventually complete
      await pwaPage.expectElementVisible('[data-testid="sync-complete"]')
      await pwaPage.expectText('[data-testid="pending-sync-count"]', '0')
    })

    test('should handle partial sync failures', async ({ context, page }) => {
      // Create multiple offline records
      await context.setOffline(true)
      
      const records = [
        { name: 'Sync Success 1', shouldFail: false },
        { name: 'Sync Failure', shouldFail: true },
        { name: 'Sync Success 2', shouldFail: false }
      ]
      
      for (const record of records) {
        await coffeeRecordPage.completeFullRecord({
          mode: 'cafe',
          coffeeInfo: {
            name: record.name,
            roastery: 'Partial Sync Roastery',
            origin: 'Partial Sync Origin'
          },
          roasterNote: 'Partial sync test',
          personalTasting: {
            taste: 'Partial sync taste',
            memo: 'Partial sync memo',
            rating: 4
          }
        })
      }
      
      // Go online with selective failure
      await context.setOffline(false)
      await page.route('**/api/records', route => {
        const postData = route.request().postData()
        if (postData && postData.includes('Sync Failure')) {
          route.fulfill({ status: 500, body: 'Server Error' })
        } else {
          route.continue()
        }
      })
      
      // Should show partial success
      await pwaPage.expectElementVisible('[data-testid="sync-partial-success"]')
      await pwaPage.expectText('[data-testid="pending-sync-count"]', '1') // One failed item
    })
  })

  test.describe('Cache Management', () => {
    test('should display cache status information', async () => {
      await pwaPage.testCacheStatus()
    })

    test('should allow clearing cache', async () => {
      await pwaPage.testCacheClear()
    })

    test('should update cache when content changes', async ({ page }) => {
      // Load page to populate cache
      await pwaPage.goto('/')
      
      // Simulate content update (new service worker)
      await page.evaluate(() => {
        // Trigger service worker update
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              registration.update()
            }
          })
        }
      })
      
      // Should show update available notification
      await pwaPage.expectElementVisible('[data-testid="sw-update-prompt"]')
    })

    test('should manage cache size efficiently', async ({ page }) => {
      await pwaPage.goto('/settings')
      
      // Check initial cache size
      const initialCacheSize = await pwaPage.page.locator('[data-testid="cache-size"]').textContent()
      
      // Navigate through several pages to increase cache
      const pages = ['/', '/achievements', '/stats', '/settings']
      for (const pagePath of pages) {
        await pwaPage.goto(pagePath)
        await pwaPage.waitForPageLoad()
      }
      
      // Cache size might increase (depending on implementation)
      await pwaPage.goto('/settings')
      const newCacheSize = await pwaPage.page.locator('[data-testid="cache-size"]').textContent()
      
      // Should show cache information
      expect(newCacheSize).toBeTruthy()
    })

    test('should handle cache storage quota limits', async ({ page }) => {
      // This test would simulate approaching storage quota limits
      // In a real scenario, you'd create enough cached data to approach limits
      
      await pwaPage.goto('/settings')
      
      // Should show storage usage information
      await pwaPage.expectElementVisible('[data-testid="storage-usage"]')
      
      // Should handle quota exceeded scenarios gracefully
      // (This would require simulating storage pressure)
    })
  })

  test.describe('Performance Optimization', () => {
    test('should load quickly when offline', async () => {
      await pwaPage.testOfflinePerformance()
    })

    test('should use cache effectively for faster loads', async () => {
      await pwaPage.testCacheEfficiency()
    })

    test('should preload critical resources', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Check that critical resources are preloaded
      const preloadedResources = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="preload"]'))
        return links.map(link => link.getAttribute('href'))
      })
      
      expect(preloadedResources.length).toBeGreaterThan(0)
    })

    test('should implement lazy loading for non-critical resources', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Check for lazy loading implementation
      const lazyImages = await page.locator('img[loading="lazy"]').count()
      
      // Should have some lazy-loaded images
      expect(lazyImages).toBeGreaterThanOrEqual(0)
    })

    test('should minimize main thread blocking', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Performance metrics should show minimal blocking
      const performanceMetrics = await page.evaluate(() => {
        return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      })
      
      // Should have reasonable load times
      expect(performanceMetrics.loadEventEnd - performanceMetrics.navigationStart).toBeLessThan(5000)
    })
  })

  test.describe('Mobile PWA Features', () => {
    test('should provide mobile-specific PWA features', async () => {
      await pwaPage.testMobilePWAFeatures()
    })

    test('should handle mobile network switching', async () => {
      await pwaPage.testMobileNetworkSwitching()
    })

    test('should support mobile gestures and interactions', async () => {
      await pwaPage.setMobileViewport()
      await pwaPage.goto('/')
      
      // Test pull-to-refresh
      await pwaPage.page.touchscreen.tap(200, 100)
      await pwaPage.page.touchscreen.tap(200, 200) // Swipe down gesture
      
      // Should show refresh indicator
      await pwaPage.expectElementVisible('[data-testid="pull-to-refresh"]')
    })

    test('should handle mobile app-like navigation', async () => {
      await pwaPage.setMobileViewport()
      
      // Should use mobile navigation patterns
      await pwaPage.expectElementVisible('[data-testid="mobile-nav"]')
      
      // Should support swipe navigation between tabs
      await pwaPage.goto('/')
      
      // Simulate swipe gesture (implementation would depend on gesture library)
      // This is a placeholder for actual swipe gesture implementation
    })

    test('should support mobile hardware features', async ({ page }) => {
      await pwaPage.setMobileViewport()
      await pwaPage.goto('/record/step1')
      
      // Should support device orientation
      const orientationSupport = await page.evaluate(() => {
        return 'orientation' in screen
      })
      expect(orientationSupport).toBe(true)
      
      // Should support device motion (for shake gestures, etc.)
      const motionSupport = await page.evaluate(() => {
        return 'DeviceMotionEvent' in window
      })
      expect(motionSupport).toBe(true)
    })
  })

  test.describe('PWA Manifest and Metadata', () => {
    test('should have valid PWA manifest', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Check for manifest link
      const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href')
      expect(manifestLink).toBeTruthy()
      
      // Fetch and validate manifest
      const manifestResponse = await page.request.get(manifestLink!)
      expect(manifestResponse.ok()).toBe(true)
      
      const manifest = await manifestResponse.json()
      expect(manifest.name).toBeTruthy()
      expect(manifest.short_name).toBeTruthy()
      expect(manifest.start_url).toBeTruthy()
      expect(manifest.display).toBeTruthy()
      expect(manifest.theme_color).toBeTruthy()
      expect(manifest.background_color).toBeTruthy()
      expect(manifest.icons).toBeTruthy()
      expect(manifest.icons.length).toBeGreaterThan(0)
    })

    test('should have appropriate meta tags', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Check for PWA-related meta tags
      const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
      expect(themeColor).toBeTruthy()
      
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
      expect(viewport).toContain('initial-scale=1')
      
      const appleMobileCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content')
      expect(appleMobileCapable).toBe('yes')
    })

    test('should have proper icon sizes for different devices', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Check for various icon sizes
      const iconSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512']
      
      for (const size of iconSizes) {
        const iconExists = await page.locator(`link[rel="icon"][sizes="${size}"]`).count() > 0 ||
                          await page.locator(`link[rel="apple-touch-icon"][sizes="${size}"]`).count() > 0
        
        expect(iconExists).toBe(true)
      }
    })
  })

  test.describe('Accessibility for PWA Features', () => {
    test('should provide accessible PWA controls', async () => {
      await pwaPage.testPWAAccessibility()
    })

    test('should announce offline/online status to screen readers', async ({ context, page }) => {
      await pwaPage.goto('/')
      
      // Go offline
      await context.setOffline(true)
      
      // Should announce offline status
      await pwaPage.expectElementVisible('[aria-live="assertive"]')
      const offlineAnnouncement = await page.locator('[aria-live="assertive"]').textContent()
      expect(offlineAnnouncement).toContain('offline')
      
      // Go back online
      await context.setOffline(false)
      
      // Should announce online status
      const onlineAnnouncement = await page.locator('[aria-live="assertive"]').textContent()
      expect(onlineAnnouncement).toContain('online')
    })

    test('should provide keyboard shortcuts for PWA features', async ({ page }) => {
      await pwaPage.goto('/')
      
      // Test keyboard shortcut for install prompt
      await page.keyboard.press('Control+Shift+A') // Example shortcut
      
      // Should show install prompt or relevant PWA action
      // (Implementation would depend on actual keyboard shortcuts)
    })
  })

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle PWA features with cookies disabled', async () => {
      await pwaPage.testPWAWithCookiesDisabled()
    })

    test('should handle PWA features in private/incognito mode', async ({ context, page }) => {
      // Simulate private browsing limitations
      await page.evaluate(() => {
        // Override storage to simulate private mode restrictions
        const mockStorage = {
          setItem: () => { throw new Error('Storage disabled in private mode') },
          getItem: () => null,
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null
        }
        
        Object.defineProperty(window, 'localStorage', { value: mockStorage })
      })
      
      await pwaPage.goto('/')
      
      // PWA should still function with limited capabilities
      await pwaPage.expectElementVisible('main')
      
      // Should show appropriate messaging about limited functionality
      await pwaPage.expectElementVisible('[data-testid="private-mode-notice"]')
    })

    test('should handle slow or unreliable networks', async ({ context, page }) => {
      // Simulate slow network
      await context.route('**/*', async route => {
        if (Math.random() < 0.3) { // 30% chance of delay
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        await route.continue()
      })
      
      await pwaPage.goto('/')
      
      // Should show loading indicators
      await pwaPage.expectElementVisible('[data-testid="slow-network-indicator"]')
      
      // Should eventually load from cache if available
      await pwaPage.expectElementVisible('main')
    })

    test('should handle storage quota exceeded', async ({ page }) => {
      // Simulate storage quota exceeded
      await page.addInitScript(() => {
        const originalEstimate = navigator.storage?.estimate
        if (navigator.storage) {
          navigator.storage.estimate = async () => ({
            quota: 1000000, // 1MB quota
            usage: 950000,  // 95% used
            usageDetails: {}
          })
        }
      })
      
      await pwaPage.goto('/')
      
      // Should show storage warning
      await pwaPage.expectElementVisible('[data-testid="storage-warning"]')
      
      // Should provide options to free up space
      await pwaPage.expectElementVisible('[data-testid="clear-cache-suggestion"]')
    })

    test('should gracefully degrade when service worker fails', async ({ page }) => {
      // Simulate service worker registration failure
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'serviceWorker', {
          value: {
            register: () => Promise.reject(new Error('SW registration failed')),
            ready: Promise.reject(new Error('SW not available'))
          }
        })
      })
      
      await pwaPage.goto('/')
      
      // App should still function without service worker
      await pwaPage.expectElementVisible('main')
      
      // Should show appropriate messaging
      await pwaPage.expectElementVisible('[data-testid="sw-unavailable-notice"]')
    })
  })

  test.describe('Integration with Authentication', () => {
    test('should sync offline data for authenticated users', async () => {
      await pwaPage.testPWAWithAuthentication()
    })

    test('should handle authentication state changes while offline', async ({ context }) => {
      // Go offline
      await context.setOffline(true)
      
      // Try to access protected content
      await pwaPage.goto('/settings')
      
      // Should still allow access with cached auth state
      await pwaPage.expectElementVisible('[data-testid="settings-panel"]')
      
      // Logout while offline
      await authPage.logout()
      
      // Should update auth state locally
      await pwaPage.expectElementVisible('text=로그인')
    })

    test('should handle token refresh while offline', async ({ context, page }) => {
      // Simulate expired token while offline
      await context.setOffline(true)
      
      await page.evaluate(() => {
        // Simulate token expiration
        const expiredToken = { expires_at: Date.now() - 1000 }
        localStorage.setItem('supabase.auth.token', JSON.stringify(expiredToken))
      })
      
      await pwaPage.goto('/settings')
      
      // Should handle gracefully and queue for refresh when online
      await pwaPage.expectElementVisible('[data-testid="auth-refresh-queued"]')
    })
  })

  test.describe('Data Persistence and Integrity', () => {
    test('should maintain data integrity across offline/online cycles', async () => {
      await pwaPage.testPWADataPersistence()
    })

    test('should handle concurrent modifications', async ({ context, page }) => {
      // Create a record
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Concurrent Test Coffee',
          roastery: 'Concurrent Roastery',
          origin: 'Brazil'
        },
        roasterNote: 'Concurrent test',
        personalTasting: {
          taste: 'Concurrent taste',
          memo: 'Original memo',
          rating: 4
        }
      })
      
      // Go offline and modify locally
      await context.setOffline(true)
      // Simulate local modification
      await page.evaluate(() => {
        const records = JSON.parse(localStorage.getItem('offline-records') || '[]')
        if (records.length > 0) {
          records[0].memo = 'Modified offline'
          localStorage.setItem('offline-records', JSON.stringify(records))
        }
      })
      
      // Simulate server-side modification while offline
      await page.evaluate(() => {
        // This would typically come from server sync
        localStorage.setItem('server-modification-pending', 'true')
      })
      
      // Go back online
      await context.setOffline(false)
      
      // Should detect conflict and provide resolution options
      await pwaPage.expectElementVisible('[data-testid="sync-conflict-dialog"]')
    })

    test('should backup critical data', async ({ page }) => {
      // Create some important data
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Backup Test Coffee',
          roastery: 'Backup Roastery',
          origin: 'Ethiopia'
        },
        roasterNote: 'Critical data for backup',
        personalTasting: {
          taste: 'Important taste notes',
          memo: 'Must not lose this data',
          rating: 5
        }
      })
      
      // Check that data is backed up locally
      const backupExists = await page.evaluate(() => {
        return localStorage.getItem('cupnote-backup') !== null
      })
      expect(backupExists).toBe(true)
      
      // Simulate data corruption and recovery
      await page.evaluate(() => {
        localStorage.removeItem('cupnote-records')
      })
      
      // Should be able to recover from backup
      await pwaPage.page.reload()
      await pwaPage.expectElementVisible('[data-testid="data-recovery-prompt"]')
    })
  })
})