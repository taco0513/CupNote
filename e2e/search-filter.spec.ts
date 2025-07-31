import { test, expect } from '@playwright/test'
import { SearchFilterPage } from './pages/SearchFilterPage'
import { AuthPage } from './pages/AuthPage'
import { CoffeeRecordPage } from './pages/CoffeeRecordPage'

test.describe('Search and Filter Functionality', () => {
  let searchFilterPage: SearchFilterPage
  let authPage: AuthPage
  let coffeeRecordPage: CoffeeRecordPage

  test.beforeEach(async ({ page }) => {
    searchFilterPage = new SearchFilterPage(page)
    authPage = new AuthPage(page)
    coffeeRecordPage = new CoffeeRecordPage(page)
    
    // Login before each test
    await authPage.goto('/')
    await authPage.login('test@example.com', 'password123')
    await authPage.expectAuthSuccess()
    
    // Navigate to search page
    await searchFilterPage.navigateToSearchPage()
  })

  test.describe('Basic Search Functionality', () => {
    test('should perform basic text search', async () => {
      const searchQuery = 'Ethiopian'
      
      await searchFilterPage.performSearch(searchQuery)
      
      // Should show search results
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
      await searchFilterPage.expectResultsContainText(searchQuery)
    })

    test('should show no results message for non-existent search', async () => {
      const searchQuery = 'NonExistentCoffee12345'
      
      await searchFilterPage.performSearch(searchQuery)
      
      // Should show no results message
      await searchFilterPage.expectElementVisible('text=검색 결과가 없습니다')
      await searchFilterPage.expectResultCount(0)
    })

    test('should clear search results', async () => {
      // Perform a search first
      await searchFilterPage.performSearch('coffee')
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
      
      // Clear search
      await searchFilterPage.clearSearch()
      
      // Should show all results again
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should handle empty search gracefully', async () => {
      await searchFilterPage.testEmptySearch()
    })

    test('should handle special characters in search', async () => {
      await searchFilterPage.testSpecialCharactersSearch()
    })

    test('should handle very long search queries', async () => {
      await searchFilterPage.testVeryLongQuery()
    })
  })

  test.describe('Real-time Search', () => {
    test('should perform real-time search as user types', async () => {
      const searchQuery = 'coffee'
      
      await searchFilterPage.performRealTimeSearch(searchQuery)
      
      // Should show updated results after each character
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should debounce search requests', async () => {
      await searchFilterPage.testRealTimeSearchDebounce()
    })

    test('should show loading indicator during search', async () => {
      // Type quickly to trigger loading state
      await searchFilterPage.performRealTimeSearch('searching')
      
      // Should show loading indicator briefly
      await searchFilterPage.expectElementVisible('[data-testid="search-loading"]')
    })
  })

  test.describe('Filter Functionality', () => {
    test('should open and close filter panel', async () => {
      await searchFilterPage.openFilterPanel()
      await searchFilterPage.expectElementVisible('[data-testid="filter-panel"]')
      
      await searchFilterPage.closeFilterPanel()
      await searchFilterPage.expectElementHidden('[data-testid="filter-panel"]')
    })

    test('should filter by mode', async () => {
      await searchFilterPage.filterByMode('cafe')
      
      // All results should be cafe mode
      const results = await searchFilterPage.page.locator('[data-testid="coffee-card"]').all()
      for (const result of results) {
        await expect(result.locator('[data-testid="coffee-mode"]')).toContainText('카페')
      }
    })

    test('should filter by rating', async () => {
      const minRating = 4
      await searchFilterPage.filterByRating(minRating)
      
      // All results should have rating >= 4
      const ratingElements = await searchFilterPage.page.locator('[data-testid="coffee-rating"]').allTextContents()
      const ratings = ratingElements.map(r => parseFloat(r))
      
      for (const rating of ratings) {
        expect(rating).toBeGreaterThanOrEqual(minRating)
      }
    })

    test('should filter by date range', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-12-31'
      
      await searchFilterPage.filterByDateRange(startDate, endDate)
      
      // Should show results within date range
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should filter by origin', async () => {
      const origin = 'Ethiopia'
      await searchFilterPage.filterByOrigin(origin)
      
      // All results should be from Ethiopia
      await searchFilterPage.expectResultsContainText(origin)
    })

    test('should filter by roastery', async () => {
      const roastery = 'Blue Bottle'
      await searchFilterPage.filterByRoastery(roastery)
      
      // All results should be from Blue Bottle
      await searchFilterPage.expectResultsContainText(roastery)
    })

    test('should clear all filters', async () => {
      // Apply multiple filters
      await searchFilterPage.filterByMode('cafe')
      await searchFilterPage.filterByRating(4)
      
      // Clear all filters
      await searchFilterPage.clearAllFilters()
      
      // Should show all results again
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should combine multiple filters', async () => {
      await searchFilterPage.openFilterPanel()
      
      // Apply multiple filters
      await searchFilterPage.page.selectOption('[data-testid="mode-filter"]', 'cafe')
      await searchFilterPage.page.selectOption('[data-testid="rating-filter"]', '4')
      await searchFilterPage.page.selectOption('[data-testid="origin-filter"]', 'Ethiopia')
      
      await searchFilterPage.applyFilters()
      
      // Results should match all filter criteria
      const results = await searchFilterPage.page.locator('[data-testid="coffee-card"]').all()
      for (const result of results) {
        await expect(result.locator('[data-testid="coffee-mode"]')).toContainText('카페')
        await expect(result.locator('[data-testid="coffee-origin"]')).toContainText('Ethiopia')
      }
    })
  })

  test.describe('Multi-tag Filtering', () => {
    test('should add individual tags', async () => {
      const tag = 'citrus'
      await searchFilterPage.addTag(tag)
      
      // Tag should be visible in selected tags
      await searchFilterPage.expectElementVisible(`[data-testid="selected-tag"]:has-text("${tag}")`)
    })

    test('should remove individual tags', async () => {
      const tag = 'chocolate'
      
      // Add tag first
      await searchFilterPage.addTag(tag)
      await searchFilterPage.expectElementVisible(`[data-testid="selected-tag"]:has-text("${tag}")`)
      
      // Remove tag
      await searchFilterPage.removeTag(tag)
      await searchFilterPage.expectElementHidden(`[data-testid="selected-tag"]:has-text("${tag}")`)
    })

    test('should add multiple tags', async () => {
      const tags = ['fruity', 'bright', 'floral']
      
      await searchFilterPage.addMultipleTags(tags)
      
      // All tags should be visible
      for (const tag of tags) {
        await searchFilterPage.expectElementVisible(`[data-testid="selected-tag"]:has-text("${tag}")`)
      }
    })

    test('should clear all tags', async () => {
      const tags = ['nutty', 'caramel', 'sweet']
      
      // Add multiple tags
      await searchFilterPage.addMultipleTags(tags)
      
      // Clear all tags
      await searchFilterPage.clearAllTags()
      
      // No tags should be visible
      for (const tag of tags) {
        await searchFilterPage.expectElementHidden(`[data-testid="selected-tag"]:has-text("${tag}")`)
      }
    })

    test('should show tag suggestions', async () => {
      await searchFilterPage.page.locator('[data-testid="tag-input"]').fill('ci')
      
      // Should show suggestions starting with 'ci'
      await searchFilterPage.expectElementVisible('[data-testid="tag-suggestions"]')
      await searchFilterPage.expectElementVisible('text=citrus')
    })

    test('should filter results by multiple tags', async () => {
      const tags = ['citrus', 'bright']
      
      await searchFilterPage.addMultipleTags(tags)
      
      // Results should contain records with both tags
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })
  })

  test.describe('Sort Functionality', () => {
    test('should sort by date (newest first)', async () => {
      await searchFilterPage.sortBy('date')
      
      // Results should be sorted by date (newest first)
      await searchFilterPage.expectResultsSortedByDate(false)
    })

    test('should sort by date (oldest first)', async () => {
      await searchFilterPage.sortBy('date')
      await searchFilterPage.toggleSortOrder()
      
      // Results should be sorted by date (oldest first)
      await searchFilterPage.expectResultsSortedByDate(true)
    })

    test('should sort by rating (highest first)', async () => {
      await searchFilterPage.sortBy('rating')
      
      // Results should be sorted by rating (highest first)
      await searchFilterPage.expectResultsSortedByRating(false)
    })

    test('should sort by rating (lowest first)', async () => {
      await searchFilterPage.sortBy('rating')
      await searchFilterPage.toggleSortOrder()
      
      // Results should be sorted by rating (lowest first)
      await searchFilterPage.expectResultsSortedByRating(true)
    })

    test('should sort by match score', async () => {
      await searchFilterPage.sortBy('score')
      
      // Results should be sorted by match score
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should maintain sort order when filtering', async () => {
      // Sort by rating first
      await searchFilterPage.sortBy('rating')
      
      // Apply a filter
      await searchFilterPage.filterByMode('cafe')
      
      // Sort order should be maintained
      await searchFilterPage.expectResultsSortedByRating(false)
    })
  })

  test.describe('Complex Search Scenarios', () => {
    test('should handle complex multi-criteria search', async () => {
      const searchCriteria = {
        query: 'Ethiopian',
        mode: 'cafe',
        minRating: 4,
        tags: ['citrus', 'bright'],
        origin: 'Ethiopia',
        sortBy: 'rating' as const,
        sortOrder: 'desc' as const
      }
      
      await searchFilterPage.performComplexSearch(searchCriteria)
      
      // Should show filtered and sorted results
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
      await searchFilterPage.expectResultsContainText('Ethiopian')
    })

    test('should handle search with date range and tags', async () => {
      const searchCriteria = {
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        tags: ['fruity', 'sweet'],
        sortBy: 'date' as const
      }
      
      await searchFilterPage.performComplexSearch(searchCriteria)
      
      // Should show results matching criteria
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should handle search with all filters applied', async () => {
      const searchCriteria = {
        query: 'coffee',
        mode: 'homecafe',
        minRating: 3,
        tags: ['chocolate', 'nutty'],
        origin: 'Brazil',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        sortBy: 'score' as const
      }
      
      await searchFilterPage.performComplexSearch(searchCriteria)
      
      // Should handle complex filtering without errors
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })
  })

  test.describe('Mobile Search and Filter', () => {
    test('should work properly on mobile devices', async () => {
      await searchFilterPage.testMobileFilters()
    })

    test('should handle mobile touch interactions', async () => {
      await searchFilterPage.setMobileViewport()
      
      // Test mobile search
      await searchFilterPage.performSearch('mobile coffee')
      
      // Test mobile filter panel
      await searchFilterPage.openFilterPanel()
      await searchFilterPage.expectElementVisible('[data-testid="mobile-filter-panel"]')
    })

    test('should show mobile-friendly filter interface', async () => {
      await searchFilterPage.setMobileViewport()
      
      // Mobile filter should be collapsible
      await searchFilterPage.expectElementHidden('[data-testid="filter-panel"]')
      
      // Tap to open
      await searchFilterPage.page.locator('[data-testid="filter-toggle"]').tap()
      await searchFilterPage.expectElementVisible('[data-testid="filter-panel"]')
    })
  })

  test.describe('Performance Testing', () => {
    test('should perform search quickly', async () => {
      await searchFilterPage.testSearchPerformance()
    })

    test('should handle large result sets efficiently', async () => {
      // Search for common term that should return many results
      const startTime = Date.now()
      await searchFilterPage.performSearch('coffee')
      const endTime = Date.now()
      
      const searchTime = endTime - startTime
      expect(searchTime).toBeLessThan(3000) // Should complete within 3 seconds
      
      // Should show results
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })

    test('should paginate large result sets', async () => {
      await searchFilterPage.performSearch('coffee')
      
      // Should show pagination controls if results are large
      const resultCount = await searchFilterPage.page.locator('[data-testid="coffee-card"]').count()
      
      if (resultCount >= 20) {
        await searchFilterPage.expectElementVisible('[data-testid="pagination"]')
        
        // Test pagination
        await searchFilterPage.page.locator('[data-testid="next-page"]').click()
        await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
      }
    })

    test('should handle rapid filter changes', async () => {
      // Rapidly change filters
      await searchFilterPage.filterByMode('cafe')
      await searchFilterPage.filterByMode('homecafe')
      await searchFilterPage.filterByMode('lab')
      
      // Should handle rapid changes without errors
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })
  })

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      await searchFilterPage.testKeyboardNavigation()
    })

    test('should provide screen reader support', async () => {
      await searchFilterPage.testScreenReaderSupport()
    })

    test('should announce search results to screen readers', async ({ page }) => {
      await searchFilterPage.performSearch('accessible coffee')
      
      // Should have aria-live region for result announcements
      await searchFilterPage.expectElementVisible('[aria-live="polite"]')
      
      // Result count should be announced
      const resultCount = await page.locator('[data-testid="result-count"]').textContent()
      expect(resultCount).toMatch(/\d+/)
    })

    test('should have proper focus management', async ({ page }) => {
      // Focus should move appropriately through search interface
      await page.keyboard.press('Tab')
      await searchFilterPage.expectFocused('[data-testid="search-input"]')
      
      await page.keyboard.press('Tab')
      await searchFilterPage.expectFocused('[data-testid="filter-toggle"]')
    })

    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast simulation
      await page.emulateMedia({ forcedColors: 'active' })
      
      await searchFilterPage.performSearch('contrast test')
      
      // Elements should remain visible in high contrast
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
      await searchFilterPage.expectElementVisible('[data-testid="coffee-card"]')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle search API errors gracefully', async () => {
      await searchFilterPage.testSearchError()
    })

    test('should handle filter API errors', async ({ page }) => {
      // Simulate filter API error
      await page.route('**/api/filter*', route => route.abort())
      
      await searchFilterPage.filterByMode('cafe')
      
      // Should show error message
      await searchFilterPage.expectElementVisible('[data-testid="filter-error"]')
    })

    test('should handle network timeouts', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/search*', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000))
        await route.continue()
      })
      
      await searchFilterPage.performSearch('timeout test')
      
      // Should show timeout message
      await searchFilterPage.expectElementVisible('[data-testid="search-timeout"]')
    })

    test('should recover from temporary network issues', async ({ page }) => {
      // Simulate network failure then recovery
      let failCount = 0
      await page.route('**/api/search*', route => {
        if (failCount < 2) {
          failCount++
          route.abort()
        } else {
          route.continue()
        }
      })
      
      await searchFilterPage.performSearch('recovery test')
      
      // Should eventually show results after retry
      await searchFilterPage.expectElementVisible('[data-testid="search-results"]')
    })
  })

  test.describe('Integration with Coffee Records', () => {
    test('should search newly created records', async () => {
      // Create a new coffee record
      const uniqueCoffeeName = `SearchTest_${Date.now()}`
      
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: uniqueCoffeeName,
          roastery: 'Search Test Roastery',
          origin: 'Search Test Origin'
        },
        roasterNote: 'Search test roaster note',
        personalTasting: {
          taste: 'Search test taste',
          memo: 'Search test memo',
          rating: 4
        }
      })
      
      // Navigate back to search
      await searchFilterPage.navigateToSearchPage()
      
      // Search for the newly created record
      await searchFilterPage.performSearch(uniqueCoffeeName)
      
      // Should find the new record
      await searchFilterPage.expectResultsContainText(uniqueCoffeeName)
    })

    test('should filter records by creation mode', async () => {
      // Create records in different modes
      const modes = ['cafe', 'homecafe', 'lab'] as const
      
      for (const mode of modes) {
        await coffeeRecordPage.goto('/mode-selection')
        await coffeeRecordPage.completeFullRecord({
          mode,
          coffeeInfo: {
            name: `${mode} Test Coffee`,
            roastery: `${mode} Roastery`,
            origin: 'Test Origin'
          },
          roasterNote: `${mode} roaster note`,
          personalTasting: {
            taste: `${mode} taste`,
            memo: `${mode} memo`,
            rating: 4
          }
        })
      }
      
      // Navigate to search and filter by mode
      await searchFilterPage.navigateToSearchPage()
      await searchFilterPage.filterByMode('cafe')
      
      // Should only show cafe mode records
      const results = await searchFilterPage.page.locator('[data-testid="coffee-card"]').all()
      for (const result of results) {
        await expect(result.locator('[data-testid="coffee-mode"]')).toContainText('카페')
      }
    })
  })

  test.describe('Search Analytics and Insights', () => {
    test('should track popular search terms', async ({ page }) => {
      // Perform several searches
      const popularTerms = ['Ethiopian', 'Blue Bottle', 'V60', 'citrus']
      
      for (const term of popularTerms) {
        await searchFilterPage.performSearch(term)
        await page.waitForTimeout(1000)
      }
      
      // Analytics should be tracked (implementation dependent)
      // This would typically involve checking analytics API calls
    })

    test('should provide search suggestions based on history', async () => {
      // Perform a search
      await searchFilterPage.performSearch('Ethiopian Yirgacheffe')
      
      // Later, typing 'Eth' should show suggestions
      await searchFilterPage.page.locator('[data-testid="search-input"]').fill('Eth')
      
      // Should show search suggestions
      await searchFilterPage.expectElementVisible('[data-testid="search-suggestions"]')
    })
  })
})