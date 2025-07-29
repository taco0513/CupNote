import { test, expect } from '@playwright/test'

test.describe('CupNote 테이스팅 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('홈페이지 기본 요소들이 표시된다', async ({ page }) => {
    // 타이틀 확인
    await expect(page.locator('h1')).toContainText('CupNote')
    await expect(page.locator('.hero-description')).toContainText('당신의 커피 감각을 기록하고')
    
    // 주요 버튼 확인
    await expect(page.locator('text=☕ 커피 기록 시작하기')).toBeVisible()
    await expect(page.locator('text=📚 나의 기록 보기')).toBeVisible()
    await expect(page.locator('text=✨ 데모 체험하기')).toBeVisible()
    
    // 특징 섹션 확인
    await expect(page.locator('text=정확한 감각 평가')).toBeVisible()
    await expect(page.locator('text=성장하는 커피 감각')).toBeVisible()
    await expect(page.locator('text=재미있는 도전')).toBeVisible()
  })

  test('데모 체험하기 클릭 시 알림이 순차적으로 표시된다', async ({ page }) => {
    // 데모 버튼 클릭
    await page.click('text=✨ 데모 체험하기')
    
    // 첫 번째 알림 확인
    await expect(page.locator('.toast').first()).toContainText('CupNote 데모 시작')
    
    // 두 번째 알림 대기 및 확인
    await page.waitForTimeout(2000)
    await expect(page.locator('text=1단계: 커피 정보')).toBeVisible()
    
    // 여러 알림이 동시에 표시되는지 확인
    await page.waitForTimeout(4000)
    const toasts = page.locator('.toast')
    const count = await toasts.count()
    expect(count).toBeGreaterThan(2)
  })

  test('관리자 대시보드 접근이 가능하다', async ({ page }) => {
    // 관리자 링크 클릭
    await page.click('text=📊 관리자')
    
    // URL 확인
    await expect(page).toHaveURL(/.*\/admin/)
    
    // 대시보드 요소 확인
    await expect(page.locator('h1')).toContainText('CupNote 관리자 대시보드')
    await expect(page.locator('text=총 사용자')).toBeVisible()
    await expect(page.locator('text=테이스팅 기록')).toBeVisible()
    await expect(page.locator('text=평균 매치 점수')).toBeVisible()
    await expect(page.locator('text=활성 사용자')).toBeVisible()
    
    // 차트 섹션 확인
    await expect(page.locator('text=일일 사용량 추이')).toBeVisible()
    await expect(page.locator('text=매치 점수 분포')).toBeVisible()
  })

  test('반응형 디자인이 모바일에서도 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 네비게이션이 적절히 조정되었는지 확인
    await expect(page.locator('.app-header')).toBeVisible()
    
    // 홈페이지 콘텐츠가 모바일에서도 표시되는지 확인
    await expect(page.locator('.hero-title')).toBeVisible()
    await expect(page.locator('.coffee-cup')).toBeVisible()
    
    // 버튼들이 세로로 정렬되었는지 확인
    const heroActions = page.locator('.hero-actions')
    await expect(heroActions).toHaveCSS('flex-wrap', 'wrap')
  })

  test('알림 토스트 상호작용이 작동한다', async ({ page }) => {
    // 데모 시작
    await page.click('text=✨ 데모 체험하기')
    
    // 첫 번째 알림 대기
    await page.waitForSelector('.toast')
    
    // 알림 클릭하여 닫기 (dismissible인 경우)
    const firstToast = page.locator('.toast').first()
    await firstToast.click()
    
    // 알림이 사라지는지 확인 (애니메이션 대기)
    await page.waitForTimeout(500)
    
    // X 버튼 클릭 테스트
    await page.waitForSelector('.toast-close')
    await page.click('.toast-close')
  })

  test('커피 기록 시작하기 버튼이 작동한다', async ({ page }) => {
    // 커피 기록 시작 버튼 클릭
    await page.click('text=☕ 커피 기록 시작하기')
    
    // URL이 변경되었는지 확인
    await expect(page).toHaveURL(/.*\/coffee-setup/)
  })

  test('나의 기록 보기 버튼이 작동한다', async ({ page }) => {
    // 나의 기록 보기 버튼 클릭
    await page.click('text=📚 나의 기록 보기')
    
    // URL이 변경되었는지 확인
    await expect(page).toHaveURL(/.*\/records/)
  })

  test('페이지 로딩 성능이 적절하다', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // 3초 이내에 로딩되어야 함
    expect(loadTime).toBeLessThan(3000)
  })
})

test.describe('관리자 대시보드 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('실시간 시간이 업데이트된다', async ({ page }) => {
    // 현재 시간 텍스트 가져오기
    const timeElement = page.locator('.current-time')
    const initialTime = await timeElement.textContent()
    
    // 1초 대기
    await page.waitForTimeout(1100)
    
    // 시간이 변경되었는지 확인
    const updatedTime = await timeElement.textContent()
    expect(initialTime).not.toBe(updatedTime)
  })

  test('빠른 작업 버튼들이 클릭 가능하다', async ({ page }) => {
    // 각 버튼 클릭 테스트
    const buttons = [
      { text: '데이터 내보내기', alert: '데이터 내보내기 기능이 곧 추가됩니다!' },
      { text: '공지사항 발송', alert: '공지사항 발송 기능이 곧 추가됩니다!' },
      { text: '분석 리포트', alert: '분석 리포트 기능이 곧 추가됩니다!' },
      { text: '사용자 관리', alert: '사용자 관리 기능이 곧 추가됩니다!' }
    ]
    
    for (const button of buttons) {
      // 알림 대화상자 리스너 설정
      page.on('dialog', async dialog => {
        expect(dialog.message()).toBe(button.alert)
        await dialog.accept()
      })
      
      // 버튼 클릭
      await page.click(`text=${button.text}`)
    }
  })

  test('점수 분포 차트가 표시된다', async ({ page }) => {
    // 점수 분포 섹션 확인
    await expect(page.locator('text=매치 점수 분포')).toBeVisible()
    
    // 각 점수 범위가 표시되는지 확인
    await expect(page.locator('text=90-100점')).toBeVisible()
    await expect(page.locator('text=70-89점')).toBeVisible()
    await expect(page.locator('text=50-69점')).toBeVisible()
    await expect(page.locator('text=0-49점')).toBeVisible()
    
    // 프로그레스 바가 있는지 확인
    const progressBars = page.locator('.score-progress')
    const count = await progressBars.count()
    expect(count).toBe(4)
  })

  test('최근 활동 섹션이 작동한다', async ({ page }) => {
    // 최근 테이스팅 섹션
    await expect(page.locator('text=🆕 최근 테이스팅')).toBeVisible()
    const tastingItems = page.locator('.activity-item')
    const tastingCount = await tastingItems.count()
    expect(tastingCount).toBeGreaterThan(0)
    
    // 인기 커피 섹션
    await expect(page.locator('text=🔥 인기 커피')).toBeVisible()
    
    // 전체 보기 링크 확인
    await expect(page.locator('text=전체 보기').first()).toBeVisible()
  })
})