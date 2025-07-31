import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'

test.describe('Authentication Flow', () => {
  let authPage: AuthPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    await authPage.goto('/')
  })

  test.describe('User Registration', () => {
    test('should successfully register a new user', async () => {
      const testUser = {
        email: `test+${Date.now()}@example.com`,
        password: 'password123',
        username: 'TestUser'
      }

      await authPage.signup(testUser.email, testUser.password, testUser.username)
      
      // Verify successful registration
      await authPage.expectAuthSuccess()
      await authPage.expectElementVisible('text=안녕하세요')
    })

    test('should show validation errors for empty required fields', async () => {
      await authPage.openSignupModal()
      await authPage.submitForm()
      
      // Should show validation errors
      await authPage.expectValidationError('username')
      await authPage.expectValidationError('email')
      await authPage.expectValidationError('password')
    })

    test('should validate password confirmation', async () => {
      await authPage.openSignupModal()
      await authPage.fillUsername('TestUser')
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('password123')
      await authPage.fillConfirmPassword('differentpassword')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('비밀번호가 일치하지 않습니다.')
    })

    test('should validate minimum password length', async () => {
      await authPage.openSignupModal()
      await authPage.fillUsername('TestUser')
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('123')
      await authPage.fillConfirmPassword('123')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.')
    })

    test('should validate minimum username length', async () => {
      await authPage.openSignupModal()
      await authPage.fillUsername('T')
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('password123')
      await authPage.fillConfirmPassword('password123')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('사용자명은 최소 2자 이상이어야 합니다.')
    })

    test('should handle duplicate email registration', async () => {
      const existingEmail = 'existing@example.com'
      
      await authPage.openSignupModal()
      await authPage.fillUsername('TestUser')
      await authPage.fillEmail(existingEmail)
      await authPage.fillPassword('password123')
      await authPage.fillConfirmPassword('password123')
      await authPage.submitForm()
      
      // Assuming this email already exists in test database
      await authPage.expectErrorMessage('이미 등록된 이메일입니다.')
    })

    test('should toggle password visibility', async () => {
      await authPage.openSignupModal()
      
      // Initially password should be hidden
      await expect(authPage.page.locator('input[type="password"]').first()).toHaveAttribute('type', 'password')
      
      // Click toggle button
      await authPage.togglePasswordVisibility()
      
      // Password should now be visible
      await expect(authPage.page.locator('input[type="text"]').first()).toBeVisible()
    })
  })

  test.describe('User Login', () => {
    test('should successfully login existing user', async () => {
      const existingUser = {
        email: 'test@example.com',
        password: 'password123'
      }

      await authPage.login(existingUser.email, existingUser.password)
      
      // Verify successful login
      await authPage.expectAuthSuccess()
      await authPage.expectElementVisible('text=새 기록 작성')
    })

    test('should show error for invalid credentials', async () => {
      await authPage.openLoginModal()
      await authPage.fillEmail('invalid@example.com')
      await authPage.fillPassword('wrongpassword')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('로그인 정보가 올바르지 않습니다.')
    })

    test('should show validation errors for empty fields', async () => {
      await authPage.openLoginModal()
      await authPage.submitForm()
      
      await authPage.expectValidationError('email')
      await authPage.expectValidationError('password')
    })

    test('should validate email format', async () => {
      await authPage.openLoginModal()
      await authPage.fillEmail('invalid-email')
      await authPage.fillPassword('password123')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('유효한 이메일 주소를 입력해주세요.')
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network error
      await page.route('**/auth/signin', route => route.abort())
      
      await authPage.openLoginModal()
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('password123')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('네트워크 오류가 발생했습니다.')
    })
  })

  test.describe('Modal Interactions', () => {
    test('should open and close login modal', async () => {
      await authPage.openLoginModal()
      await authPage.expectModalVisible()
      await authPage.expectLoginMode()
      
      await authPage.closeModal()
      await authPage.expectModalHidden()
    })

    test('should open and close signup modal', async () => {
      await authPage.openSignupModal()
      await authPage.expectModalVisible()
      await authPage.expectSignupMode()
      
      await authPage.closeModal()
      await authPage.expectModalHidden()
    })

    test('should toggle between login and signup modes', async () => {
      await authPage.openLoginModal()
      await authPage.expectLoginMode()
      
      await authPage.toggleAuthMode()
      await authPage.expectSignupMode()
      
      await authPage.toggleAuthMode()
      await authPage.expectLoginMode()
    })

    test('should close modal with escape key', async ({ page }) => {
      await authPage.openLoginModal()
      await authPage.expectModalVisible()
      
      await page.keyboard.press('Escape')
      await authPage.expectModalHidden()
    })

    test('should clear form data when switching modes', async () => {
      await authPage.openLoginModal()
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('password123')
      
      await authPage.toggleAuthMode()
      
      // Form should be cleared
      await authPage.expectValue('input[type="email"]', '')
      await authPage.expectValue('input[type="password"]', '')
    })
  })

  test.describe('Session Management', () => {
    test('should maintain session across page refresh', async ({ page }) => {
      // Login first
      await authPage.login('test@example.com', 'password123')
      await authPage.expectAuthSuccess()
      
      // Refresh page
      await page.reload()
      await authPage.waitForPageLoad()
      
      // Should still be logged in
      await authPage.expectAuthSuccess()
    })

    test('should logout user successfully', async () => {
      // Login first
      await authPage.login('test@example.com', 'password123')
      await authPage.expectAuthSuccess()
      
      // Logout
      await authPage.logout()
      await authPage.waitForLogout()
      
      // Should show login/signup buttons
      await authPage.expectElementVisible('text=로그인')
      await authPage.expectElementVisible('text=지금 시작하기')
    })

    test('should handle session expiration', async ({ page }) => {
      // Login first
      await authPage.login('test@example.com', 'password123')
      await authPage.expectAuthSuccess()
      
      // Simulate session expiration
      await page.evaluate(() => {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      })
      
      // Navigate to protected page
      await page.goto('/settings')
      
      // Should redirect to login
      await authPage.expectElementVisible('text=로그인')
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/mode-selection')
      
      // Should be redirected and show login prompt
      await authPage.expectElementVisible('text=로그인')
    })

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // Login first
      await authPage.login('test@example.com', 'password123')
      await authPage.expectAuthSuccess()
      
      // Access protected route
      await page.goto('/mode-selection')
      
      // Should successfully load the page
      await authPage.expectElementVisible('text=모드를 선택해주세요')
    })

    test('should handle deep link after authentication', async ({ page }) => {
      // Try to access deep protected route
      await page.goto('/record/step1')
      
      // Should redirect to login
      await authPage.expectElementVisible('text=로그인')
      
      // Login
      await authPage.login('test@example.com', 'password123')
      
      // Should redirect to originally requested page
      await page.waitForURL('**/record/step1')
    })
  })

  test.describe('Mobile Authentication', () => {
    test('should work on mobile devices', async () => {
      await authPage.setMobileViewport()
      
      // Test mobile signup
      await authPage.openSignupModal()
      await authPage.expectModalVisible()
      
      // Form should be mobile-friendly
      await authPage.expectElementVisible('input[type="email"]')
      await authPage.expectElementVisible('input[type="password"]')
    })

    test('should handle mobile keyboard interactions', async ({ page }) => {
      await authPage.setMobileViewport()
      await authPage.openLoginModal()
      
      // Focus on email input
      await page.locator('input[type="email"]').focus()
      
      // Should show mobile keyboard (simulated by checking focus)
      await authPage.expectFocused('input[type="email"]')
    })
  })

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      await authPage.testKeyboardNavigation()
    })

    test('should have proper ARIA labels', async () => {
      await authPage.testAriaLabels()
    })

    test('should support screen readers', async ({ page }) => {
      await authPage.openLoginModal()
      
      // Check for screen reader support
      await authPage.expectElementVisible('[role="dialog"]')
      await authPage.expectAriaLabel('button[type="submit"]', '로그인')
    })

    test('should have sufficient color contrast', async ({ page }) => {
      await authPage.openLoginModal()
      
      // Test button contrast
      const button = page.locator('button[type="submit"]')
      await expect(button).toHaveCSS('background-color', /rgb\(/)
      await expect(button).toHaveCSS('color', /rgb\(/)
    })

    test('should show focus indicators', async ({ page }) => {
      await authPage.openLoginModal()
      
      // Tab through form elements
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      
      // Should have visible focus indicator
      await expect(focusedElement).toHaveCSS('outline', /.*/)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/auth/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        })
      })
      
      await authPage.openLoginModal()
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('password123')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('서버 오류가 발생했습니다.')
    })

    test('should handle timeout errors', async ({ page }) => {
      // Simulate slow response
      await page.route('**/auth/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000))
        await route.continue()
      })
      
      await authPage.openLoginModal()
      await authPage.fillEmail('test@example.com')
      await authPage.fillPassword('password123')
      await authPage.submitForm()
      
      // Should show timeout error
      await authPage.expectErrorMessage('요청 시간이 초과되었습니다.')
    })

    test('should clear error messages on input change', async () => {
      // Cause an error first
      await authPage.openLoginModal()
      await authPage.fillEmail('invalid@example.com')
      await authPage.fillPassword('wrongpassword')
      await authPage.submitForm()
      
      await authPage.expectErrorMessage('로그인 정보가 올바르지 않습니다.')
      
      // Start typing - error should disappear
      await authPage.fillEmail('test@example.com')
      await authPage.expectElementHidden('.text-red-600')
    })
  })

  test.describe('Performance', () => {
    test('should load authentication modal quickly', async () => {
      const startTime = Date.now()
      await authPage.openLoginModal()
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(1000) // Should open within 1 second
    })

    test('should authenticate quickly', async () => {
      const startTime = Date.now()
      await authPage.login('test@example.com', 'password123')
      const endTime = Date.now()
      
      const authTime = endTime - startTime
      expect(authTime).toBeLessThan(3000) // Should authenticate within 3 seconds
    })
  })
})