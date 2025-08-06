/**
 * CupNote 기본 플로우 테스트
 * 간소화된 버전
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test.describe('기본 플로우', () => {
  test('홈페이지 접속 확인', async ({ page }) => {
    await page.goto(BASE_URL)
    
    // 홈페이지 요소 확인
    const title = await page.textContent('h1')
    expect(title).toBeTruthy()
  })

  test('모드 선택 페이지 직접 이동', async ({ page }) => {
    // 모드 선택 페이지로 직접 이동
    await page.goto(`${BASE_URL}/mode-selection`)
    
    // 모드 선택 페이지 확인
    await expect(page).toHaveURL(/.*mode-selection/)
    
    // Cafe Mode와 HomeCafe Mode 버튼 확인
    await expect(page.locator('text="카페 모드"')).toBeVisible()
    await expect(page.locator('text="홈카페 모드"')).toBeVisible()
  })

  test('Cafe Mode 선택 및 이동', async ({ page }) => {
    // coffee-info 페이지로 직접 이동
    await page.goto(`${BASE_URL}/tasting-flow/cafe/coffee-info`)
    
    // URL 확인
    await expect(page).toHaveURL(/.*tasting-flow\/cafe\/coffee-info/)
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('커피 정보')
  })

  test('HomeCafe Mode 선택 및 이동', async ({ page }) => {
    // coffee-info 페이지로 직접 이동
    await page.goto(`${BASE_URL}/tasting-flow/homecafe/coffee-info`)
    
    // URL 확인
    await expect(page).toHaveURL(/.*tasting-flow\/homecafe\/coffee-info/)
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('커피 정보')
  })
})