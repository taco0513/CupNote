import { test, expect } from '@playwright/test'

test.describe('TastingFlow v2.0 전체 플로우 테스트', () => {
  // 포트 번호를 5173에서 3001로 변경
  const BASE_URL = 'http://localhost:3001'
  
  test.beforeEach(async ({ page }) => {
    // 테스트 전 로컬스토리지 클리어
    await page.goto(BASE_URL)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('Cafe Mode 전체 플로우 테스트', async ({ page }) => {
    // 1. TastingFlow 시작
    await page.goto(`${BASE_URL}/tasting-flow`)
    
    // Cafe 모드 선택
    await page.click('text=Cafe Mode')
    await page.waitForURL('**/tasting-flow/cafe/coffee-info')
    
    // 2. Coffee Info 입력
    await expect(page.locator('h1')).toContainText('커피 정보')
    
    // 커피 이름 입력
    await page.fill('input[placeholder*="예: 에티오피아 예가체프"]', '케냐 AA 카리아이니')
    
    // 로스터리 입력
    await page.fill('input[placeholder*="예: 블루보틀"]', '테라로사')
    
    // 구매처 입력
    await page.fill('input[placeholder*="예: 강남점"]', '성수점')
    
    // 다음 버튼 클릭
    await page.click('button:has-text("다음 단계")')
    
    // 3. Flavor Selection
    await page.waitForURL('**/tasting-flow/cafe/flavor-selection')
    await expect(page.locator('h1')).toContainText('향미 선택')
    
    // 검색 기능 테스트
    await page.fill('input[placeholder*="향미 검색"]', '블루베리')
    await page.waitForTimeout(500) // 검색 결과 대기
    
    // 검색 결과에서 블루베리 선택
    const searchResults = page.locator('text=검색 결과').first()
    if (await searchResults.isVisible()) {
      await page.click('button:has-text("블루베리")').first()
    }
    
    // 검색 초기화
    await page.click('button[aria-label*="clear"]', { force: true }).catch(() => {})
    await page.fill('input[placeholder*="향미 검색"]', '')
    
    // 카테고리에서 추가 향미 선택
    await page.click('button:has-text("단맛")')
    await page.click('text=초콜릿').first()
    
    await page.click('button:has-text("과일향")')
    await page.click('text=체리').first()
    
    // 다음 버튼 클릭
    await page.click('button:has-text("다음 단계")')
    
    // 4. Sensory Expression
    await page.waitForURL('**/tasting-flow/cafe/sensory-expression')
    await expect(page.locator('h1')).toContainText('감각 표현')
    
    // 각 카테고리에서 표현 선택
    await page.click('text=싱그러운')
    await page.click('text=달콤한')
    await page.click('text=균형잡힌')
    
    await page.click('button:has-text("다음 단계")')
    
    // 5. Sensory Mouthfeel (선택적)
    await page.waitForURL('**/tasting-flow/cafe/sensory-mouthfeel')
    await expect(page.locator('h1')).toContainText('수치 평가')
    
    // 건너뛰기
    await page.click('button:has-text("건너뛰기")')
    
    // 6. Personal Notes
    await page.waitForURL('**/tasting-flow/cafe/personal-notes')
    await expect(page.locator('h1')).toContainText('개인 노트')
    
    // 메모 입력
    await page.fill('textarea', '아침에 마시기 좋은 산뜻한 커피였다.')
    
    // 빠른 입력 선택
    await page.click('text=다시 마시고 싶다')
    await page.click('text=특별한 날에 어울린다')
    
    // 감정 태그 선택
    await page.click('text=만족')
    await page.click('text=특별함')
    
    // 테이스팅 완료
    await page.click('button:has-text("테이스팅 완료")')
    
    // 7. Result 확인
    await page.waitForURL('**/tasting-flow/cafe/result')
    await expect(page.locator('h1')).toContainText('테이스팅 완료!')
    
    // Match Score 확인
    await expect(page.locator('text=Match Score')).toBeVisible()
    
    // 커피 정보 확인
    await expect(page.locator('text=케냐 AA 카리아이니')).toBeVisible()
    await expect(page.locator('text=테라로사')).toBeVisible()
    
    // 선택한 향미 확인
    await expect(page.locator('text=블루베리')).toBeVisible()
    await expect(page.locator('text=초콜릿')).toBeVisible()
    
    // 로스터 노트 입력 테스트
    await page.click('button:has-text("로스터 노트 입력하기")')
    await page.fill('textarea[placeholder*="블루베리"]', '블루베리, 다크초콜릿, 와인, 밝은 산미')
    await page.click('button:has-text("비교하기")')
    
    // 비교 결과 확인
    await expect(page.locator('text=공통 발견')).toBeVisible()
    await expect(page.locator('svg')).toBeVisible() // 벤다이어그램
  })

  test('HomeCafe Mode 전체 플로우 테스트', async ({ page }) => {
    // 1. TastingFlow 시작
    await page.goto(`${BASE_URL}/tasting-flow`)
    
    // HomeCafe 모드 선택
    await page.click('text=HomeCafe Mode')
    await page.waitForURL('**/tasting-flow/homecafe/coffee-info')
    
    // 2. Coffee Info 입력
    await page.fill('input[placeholder*="예: 에티오피아 예가체프"]', '과테말라 안티구아')
    await page.fill('input[placeholder*="예: 블루보틀"]', '커피리브레')
    await page.click('button:has-text("다음 단계")')
    
    // 3. Brew Setup
    await page.waitForURL('**/tasting-flow/homecafe/brew-setup')
    await expect(page.locator('h1')).toContainText('추출 설정')
    
    // 드리퍼 선택
    await page.click('text=V60')
    
    // 비율 프리셋 선택
    await page.click('text=1:16')
    
    // 분쇄도 입력
    await page.fill('input[placeholder*="바라짜"]', '커맨던트 C40 18클릭')
    
    // 타이머 테스트
    await page.click('button:has-text("시작")')
    await page.waitForTimeout(2000)
    await page.click('button:has-text("블루밍 완료")')
    await page.waitForTimeout(1000)
    await page.click('button:has-text("리셋")')
    
    await page.click('button:has-text("다음 단계")')
    
    // 4. Flavor Selection (공통)
    await page.waitForURL('**/tasting-flow/homecafe/flavor-selection')
    await page.click('text=견과류')
    await page.click('text=아몬드')
    await page.click('text=헤이즐넛')
    await page.click('button:has-text("다음 단계")')
    
    // 5. Sensory Expression (공통)
    await page.waitForURL('**/tasting-flow/homecafe/sensory-expression')
    await page.click('text=묵직한')
    await page.click('text=쌉싸름한')
    await page.click('button:has-text("다음 단계")')
    
    // 6. Sensory Mouthfeel - 이번엔 평가
    await page.waitForURL('**/tasting-flow/homecafe/sensory-mouthfeel')
    
    // Body 평가
    await page.click('[aria-label="Body"] button:has-text("4")')
    
    // Acidity 평가
    await page.click('[aria-label="Acidity"] button:has-text("3")')
    
    // 다음
    await page.click('button:has-text("다음 단계")')
    
    // 7. Personal Notes
    await page.waitForURL('**/tasting-flow/homecafe/personal-notes')
    await page.fill('textarea', '집에서 내린 커피 중 최고!')
    await page.click('button:has-text("테이스팅 완료")')
    
    // 8. Result
    await page.waitForURL('**/tasting-flow/homecafe/result')
    
    // HomeCafe 특유의 브루잉 정보 확인
    await expect(page.locator('text=V60')).toBeVisible()
    await expect(page.locator('text=1:16')).toBeVisible()
    
    // 커뮤니티 비교 확인
    await expect(page.locator('text=다른 사용자들의 선택')).toBeVisible()
    
    // 성장 인사이트 확인
    await expect(page.locator('text=성장 인사이트')).toBeVisible()
  })

  test('검증: 필수 입력 검증', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasting-flow`)
    await page.click('text=Cafe Mode')
    
    // 빈 상태에서 다음 버튼 클릭
    await page.click('button:has-text("다음 단계")')
    
    // 에러 메시지 확인
    await expect(page.locator('text=커피 이름을 입력해주세요')).toBeVisible()
  })

  test('검증: 뒤로가기 네비게이션', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasting-flow`)
    await page.click('text=Cafe Mode')
    
    // Coffee Info 입력
    await page.fill('input[placeholder*="예: 에티오피아 예가체프"]', '테스트 커피')
    await page.fill('input[placeholder*="예: 블루보틀"]', '테스트 로스터')
    await page.click('button:has-text("다음 단계")')
    
    // Flavor Selection으로 이동 후 뒤로가기
    await page.waitForURL('**/tasting-flow/cafe/flavor-selection')
    await page.click('button:has-text("이전")')
    
    // 이전 입력값 유지 확인
    await expect(page.locator('input[value="테스트 커피"]')).toBeVisible()
    await expect(page.locator('input[value="테스트 로스터"]')).toBeVisible()
  })

  test('성능: 대량 향미 선택 시 반응성', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasting-flow`)
    await page.click('text=Cafe Mode')
    
    // Coffee Info 빠른 입력
    await page.fill('input[placeholder*="예: 에티오피아 예가체프"]', 'TEST')
    await page.fill('input[placeholder*="예: 블루보틀"]', 'TEST')
    await page.click('button:has-text("다음 단계")')
    
    // 향미 선택 화면에서 빠르게 5개 선택
    await page.waitForURL('**/tasting-flow/cafe/flavor-selection')
    
    const startTime = Date.now()
    
    // 모든 카테고리 펼치고 5개 선택
    const categories = ['과일향', '단맛', '견과류', '향신료', '로스팅']
    for (const category of categories) {
      await page.click(`button:has-text("${category}")`)
      const flavors = await page.locator(`text=${category} ~ * button`).all()
      if (flavors.length > 0) {
        await flavors[0].click()
      }
    }
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 5초 이내에 완료되어야 함
    expect(duration).toBeLessThan(5000)
    
    // 선택 개수 확인
    await expect(page.locator('text=(5/5)')).toBeVisible()
  })
})