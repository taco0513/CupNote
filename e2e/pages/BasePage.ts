import { Page, Locator, expect } from '@playwright/test'

/**
 * Base Page Object class with common functionality
 * All page objects should extend this class
 */
export class BasePage {
  protected readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // Common navigation methods
  async goto(url: string) {
    await this.page.goto(url)
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  // Common element interactions
  async clickElement(selector: string) {
    await this.page.click(selector)
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value)
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value)
  }

  // Common assertions
  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible()
  }

  async expectElementHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden()
  }

  async expectText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text)
  }

  async expectValue(selector: string, value: string) {
    await expect(this.page.locator(selector)).toHaveValue(value)
  }

  // Mobile-specific methods
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 })
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 })
  }

  // Accessibility helpers
  async expectAriaLabel(selector: string, label: string) {
    await expect(this.page.locator(selector)).toHaveAttribute('aria-label', label)
  }

  async expectFocused(selector: string) {
    await expect(this.page.locator(selector)).toBeFocused()
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png` })
  }

  // Wait helpers
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout })
  }

  async waitForText(text: string, timeout = 5000) {
    await this.page.waitForSelector(`text=${text}`, { timeout })
  }

  // Network helpers
  async waitForResponse(urlPattern: string | RegExp) {
    return await this.page.waitForResponse(urlPattern)
  }

  async waitForRequest(urlPattern: string | RegExp) {
    return await this.page.waitForRequest(urlPattern)
  }
}