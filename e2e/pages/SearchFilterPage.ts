import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Search and Filter functionality
 */
export class SearchFilterPage extends BasePage {
  // Search locators
  private readonly searchInput: Locator
  private readonly searchResults: Locator
  private readonly searchClearButton: Locator
  private readonly noResultsMessage: Locator

  // Filter locators
  private readonly filterPanel: Locator
  private readonly filterToggle: Locator
  private readonly modeFilter: Locator
  private readonly ratingFilter: Locator
  private readonly dateRangeFilter: Locator
  private readonly tagFilter: Locator
  private readonly originFilter: Locator
  private readonly roasteryFilter: Locator
  private readonly clearFiltersButton: Locator
  private readonly applyFiltersButton: Locator

  // Sort locators
  private readonly sortDropdown: Locator
  private readonly sortByDate: Locator
  private readonly sortByRating: Locator
  private readonly sortByScore: Locator
  private readonly sortOrderToggle: Locator

  // Results locators
  private readonly coffeeCards: Locator
  private readonly resultCount: Locator
  private readonly loadMoreButton: Locator
  private readonly paginationControls: Locator

  // Tag-specific locators
  private readonly tagInput: Locator
  private readonly tagSuggestions: Locator
  private readonly selectedTags: Locator
  private readonly tagRemoveButtons: Locator

  constructor(page: Page) {
    super(page)

    // Search
    this.searchInput = page.locator('input[placeholder*="검색"], input[data-testid="search-input"]')
    this.searchResults = page.locator('[data-testid="search-results"]')
    this.searchClearButton = page.locator('[data-testid="search-clear"]')
    this.noResultsMessage = page.locator('text=검색 결과가 없습니다')

    // Filters
    this.filterPanel = page.locator('[data-testid="filter-panel"]')
    this.filterToggle = page.locator('[data-testid="filter-toggle"]')
    this.modeFilter = page.locator('[data-testid="mode-filter"]')
    this.ratingFilter = page.locator('[data-testid="rating-filter"]')
    this.dateRangeFilter = page.locator('[data-testid="date-range-filter"]')
    this.tagFilter = page.locator('[data-testid="tag-filter"]')
    this.originFilter = page.locator('[data-testid="origin-filter"]')
    this.roasteryFilter = page.locator('[data-testid="roastery-filter"]')
    this.clearFiltersButton = page.locator('button:has-text("필터 초기화")')
    this.applyFiltersButton = page.locator('button:has-text("적용")')

    // Sort
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]')
    this.sortByDate = page.locator('option[value="date"], button:has-text("날짜순")')
    this.sortByRating = page.locator('option[value="rating"], button:has-text("평점순")')
    this.sortByScore = page.locator('option[value="score"], button:has-text("점수순")')
    this.sortOrderToggle = page.locator('[data-testid="sort-order-toggle"]')

    // Results
    this.coffeeCards = page.locator('[data-testid="coffee-card"]')
    this.resultCount = page.locator('[data-testid="result-count"]')
    this.loadMoreButton = page.locator('button:has-text("더 보기")')
    this.paginationControls = page.locator('[data-testid="pagination"]')

    // Tags
    this.tagInput = page.locator('input[placeholder*="태그"], [data-testid="tag-input"]')
    this.tagSuggestions = page.locator('[data-testid="tag-suggestions"]')
    this.selectedTags = page.locator('[data-testid="selected-tag"]')
    this.tagRemoveButtons = page.locator('[data-testid="remove-tag"]')
  }

  // Navigation methods
  async navigateToSearchPage() {
    await this.goto('/')
    await this.page.getByText('홈').click()
    await this.waitForElement('[data-testid="search-input"]')
  }

  // Search methods
  async performSearch(query: string) {
    await this.searchInput.fill(query)
    await this.waitForSearchResults()
  }

  async performRealTimeSearch(query: string) {
    // Type character by character to test real-time search
    for (const char of query) {
      await this.searchInput.type(char)
      await this.page.waitForTimeout(300) // Wait for debounce
    }
    await this.waitForSearchResults()
  }

  async clearSearch() {
    await this.searchClearButton.click()
    await this.waitForSearchResults()
  }

  async waitForSearchResults() {
    await Promise.race([
      this.searchResults.waitFor({ state: 'visible' }),
      this.noResultsMessage.waitFor({ state: 'visible' })
    ])
  }

  // Filter methods
  async openFilterPanel() {
    await this.filterToggle.click()
    await this.filterPanel.waitFor({ state: 'visible' })
  }

  async closeFilterPanel() {
    await this.filterToggle.click()
    await this.filterPanel.waitFor({ state: 'hidden' })
  }

  async filterByMode(mode: string) {
    await this.openFilterPanel()
    await this.modeFilter.selectOption(mode)
    await this.applyFilters()
  }

  async filterByRating(minRating: number) {
    await this.openFilterPanel()
    await this.ratingFilter.selectOption(minRating.toString())
    await this.applyFilters()
  }

  async filterByDateRange(startDate: string, endDate: string) {
    await this.openFilterPanel()
    await this.page.locator('input[name="startDate"]').fill(startDate)
    await this.page.locator('input[name="endDate"]').fill(endDate)
    await this.applyFilters()
  }

  async filterByOrigin(origin: string) {
    await this.openFilterPanel()
    await this.originFilter.selectOption(origin)
    await this.applyFilters()
  }

  async filterByRoastery(roastery: string) {
    await this.openFilterPanel()
    await this.roasteryFilter.selectOption(roastery)
    await this.applyFilters()
  }

  async applyFilters() {
    await this.applyFiltersButton.click()
    await this.waitForSearchResults()
  }

  async clearAllFilters() {
    await this.clearFiltersButton.click()
    await this.waitForSearchResults()
  }

  // Multi-tag filtering methods
  async addTag(tag: string) {
    await this.tagInput.fill(tag)
    
    // Wait for suggestions and select
    await this.tagSuggestions.waitFor({ state: 'visible' })
    await this.page.getByText(tag).first().click()
    
    // Verify tag was added
    await this.expectElementVisible(`[data-testid="selected-tag"]:has-text("${tag}")`)
  }

  async removeTag(tag: string) {
    const tagElement = this.selectedTags.filter({ hasText: tag })
    await tagElement.locator('[data-testid="remove-tag"]').click()
    
    // Verify tag was removed
    await this.expectElementHidden(`[data-testid="selected-tag"]:has-text("${tag}")`)
  }

  async addMultipleTags(tags: string[]) {
    for (const tag of tags) {
      await this.addTag(tag)
      await this.page.waitForTimeout(200) // Small delay between tags
    }
  }

  async clearAllTags() {
    const tagCount = await this.selectedTags.count()
    for (let i = 0; i < tagCount; i++) {
      await this.tagRemoveButtons.first().click()
      await this.page.waitForTimeout(100)
    }
  }

  // Sort methods
  async sortBy(criteria: 'date' | 'rating' | 'score') {
    await this.sortDropdown.click()
    
    const sortOptions = {
      date: this.sortByDate,
      rating: this.sortByRating,
      score: this.sortByScore
    }
    
    await sortOptions[criteria].click()
    await this.waitForSearchResults()
  }

  async toggleSortOrder() {
    await this.sortOrderToggle.click()
    await this.waitForSearchResults()
  }

  // Complex search scenarios
  async performComplexSearch(criteria: {
    query?: string
    mode?: string
    minRating?: number
    tags?: string[]
    origin?: string
    startDate?: string
    endDate?: string
    sortBy?: 'date' | 'rating' | 'score'
    sortOrder?: 'asc' | 'desc'
  }) {
    // Search query
    if (criteria.query) {
      await this.performSearch(criteria.query)
    }

    // Apply filters
    await this.openFilterPanel()

    if (criteria.mode) {
      await this.modeFilter.selectOption(criteria.mode)
    }

    if (criteria.minRating) {
      await this.ratingFilter.selectOption(criteria.minRating.toString())
    }

    if (criteria.origin) {
      await this.originFilter.selectOption(criteria.origin)
    }

    if (criteria.startDate && criteria.endDate) {
      await this.filterByDateRange(criteria.startDate, criteria.endDate)
    }

    await this.applyFilters()

    // Add tags
    if (criteria.tags) {
      await this.addMultipleTags(criteria.tags)
    }

    // Sort results
    if (criteria.sortBy) {
      await this.sortBy(criteria.sortBy)
    }

    if (criteria.sortOrder === 'desc') {
      await this.toggleSortOrder()
    }
  }

  // Result validation methods
  async expectResultCount(expectedCount: number) {
    if (expectedCount === 0) {
      await this.expectElementVisible('text=검색 결과가 없습니다')
    } else {
      const actualCount = await this.coffeeCards.count()
      expect(actualCount).toBe(expectedCount)
    }
  }

  async expectResultsContainText(text: string) {
    const results = await this.coffeeCards.all()
    for (const result of results) {
      await expect(result).toContainText(text)
    }
  }

  async expectResultsSortedByDate(ascending = true) {
    const dates = await this.coffeeCards.locator('[data-testid="coffee-date"]').allTextContents()
    const sortedDates = [...dates].sort()
    
    if (!ascending) {
      sortedDates.reverse()
    }
    
    expect(dates).toEqual(sortedDates)
  }

  async expectResultsSortedByRating(ascending = false) {
    const ratings = await this.coffeeCards.locator('[data-testid="coffee-rating"]').allTextContents()
    const ratingNumbers = ratings.map(r => parseFloat(r))
    const sortedRatings = [...ratingNumbers].sort((a, b) => ascending ? a - b : b - a)
    
    expect(ratingNumbers).toEqual(sortedRatings)
  }

  // Performance testing
  async testSearchPerformance() {
    const startTime = Date.now()
    await this.performSearch('coffee')
    const endTime = Date.now()
    
    const searchTime = endTime - startTime
    expect(searchTime).toBeLessThan(2000) // Should complete within 2 seconds
  }

  async testRealTimeSearchDebounce() {
    // Type rapidly and ensure only final search is executed
    await this.searchInput.fill('c')
    await this.page.waitForTimeout(100)
    await this.searchInput.fill('co')
    await this.page.waitForTimeout(100)
    await this.searchInput.fill('cof')
    await this.page.waitForTimeout(100)
    await this.searchInput.fill('coffee')
    
    // Wait for debounce period
    await this.page.waitForTimeout(500)
    
    // Verify search was performed only once
    await this.waitForSearchResults()
  }

  // Mobile-specific testing
  async testMobileFilters() {
    await this.setMobileViewport()
    
    // Mobile filter panel should be collapsible
    await this.expectElementHidden('[data-testid="filter-panel"]')
    await this.filterToggle.click()
    await this.expectElementVisible('[data-testid="filter-panel"]')
    
    // Test mobile-friendly filter interactions
    await this.filterByMode('cafe')
    await this.expectElementHidden('[data-testid="filter-panel"]') // Should auto-close on mobile
  }

  // Accessibility testing
  async testKeyboardNavigation() {
    // Test search input accessibility
    await this.searchInput.focus()
    await this.searchInput.press('ArrowDown')
    
    // Test filter navigation
    await this.openFilterPanel()
    await this.page.keyboard.press('Tab')
    await this.expectFocused('select[data-testid="mode-filter"]')
  }

  async testScreenReaderSupport() {
    // Check for proper ARIA labels
    await this.expectAriaLabel('input[data-testid="search-input"]', '커피 검색')
    await this.expectAriaLabel('[data-testid="filter-toggle"]', '필터 열기')
    
    // Check for live region updates
    await this.performSearch('coffee')
    await this.expectElementVisible('[aria-live="polite"]')
  }

  // Error handling
  async testSearchError() {
    // Simulate network error
    await this.page.route('**/api/search*', route => route.abort())
    
    await this.performSearch('error test')
    await this.expectElementVisible('[data-testid="search-error"]')
  }

  // Edge cases
  async testEmptySearch() {
    await this.performSearch('')
    // Should show all results or appropriate message
    await this.expectElementVisible('[data-testid="search-results"]')
  }

  async testSpecialCharactersSearch() {
    await this.performSearch('café ñ 한글')
    await this.waitForSearchResults()
    // Should handle special characters gracefully
  }

  async testVeryLongQuery() {
    const longQuery = 'a'.repeat(1000)
    await this.performSearch(longQuery)
    await this.waitForSearchResults()
    // Should handle long queries without breaking
  }
}