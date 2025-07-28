# Pattern: CupNote Test Data Patterns

## PURPOSE
CupNote 테스트를 위한 현실적이고 일관된 테스트 데이터 생성 패턴

## PATTERN_TYPE
Test Data Factory Pattern

## IMPLEMENTATION

### 1. 사용자 테스트 데이터
```typescript
// WHY: 다양한 사용자 시나리오를 테스트하기 위한 페르소나
// PATTERN: Factory 패턴으로 일관된 테스트 데이터 생성

interface TestUser {
  id: string;
  email: string;
  name: string;
  coffeeLevel: 'beginner' | 'intermediate' | 'expert';
  preferences: UserPreferences;
}

const testUserFactory = {
  // 커피 초보자
  createBeginner: (): TestUser => ({
    id: 'test-user-beginner',
    email: 'beginner@cupnote.test',
    name: '김초보',
    coffeeLevel: 'beginner',
    preferences: {
      expressionStyle: 'simple', // 쉬운 표현 선호
      tastingFrequency: 'weekly',
      favoriteNotes: ['달콤한', '부드러운', '고소한']
    }
  }),

  // 홈카페 매니아
  createHomeCafe: (): TestUser => ({
    id: 'test-user-homecafe',
    email: 'homecafe@cupnote.test',
    name: '박홈카페',
    coffeeLevel: 'intermediate',
    preferences: {
      expressionStyle: 'detailed',
      brewingMethods: ['v60', 'frenchpress', 'moka'],
      equipment: ['grinder', 'scale', 'thermometer']
    }
  }),

  // 커피 전문가
  createExpert: (): TestUser => ({
    id: 'test-user-expert',
    email: 'expert@cupnote.test',
    name: '이큐그레이더',
    coffeeLevel: 'expert',
    preferences: {
      expressionStyle: 'professional',
      certifications: ['Q-Grader'],
      cuppingExperience: true
    }
  })
};
```

### 2. 커피 테스트 데이터
```typescript
// PATTERN: 실제 커피 데이터를 기반으로 한 테스트 데이터

const testCoffeeFactory = {
  // 대중적인 브라질 커피
  createBrazilSantos: () => ({
    id: 'test-coffee-brazil',
    name: '브라질 산토스',
    roaster: '테스트 로스터리',
    origin: {
      country: '브라질',
      region: '산토스',
      farm: '파젠다 테스트',
      altitude: '1200m',
      process: 'Natural'
    },
    roastLevel: 'medium',
    roastDate: new Date('2025-01-20'),
    notes: {
      professional: ['chocolate', 'nuts', 'caramel'],
      korean: ['초콜릿처럼 달콤한', '땅콩 같은 고소함', '캐러멜 단맛']
    }
  }),

  // 산미가 강한 에티오피아
  createEthiopiaYirgacheffe: () => ({
    id: 'test-coffee-ethiopia',
    name: '에티오피아 예가체프',
    origin: {
      country: '에티오피아',
      region: '예가체프',
      process: 'Washed'
    },
    roastLevel: 'light',
    notes: {
      professional: ['citrus', 'floral', 'tea-like'],
      korean: ['레몬처럼 상큼한', '꽃향기', '홍차 같은 느낌']
    }
  })
};
```

### 3. 테이스팅 기록 테스트 데이터
```typescript
// PATTERN: 다양한 테이스팅 시나리오 커버

const testTastingFactory = {
  // 카페에서의 간단한 기록
  createCafeTasting: () => ({
    id: 'test-tasting-cafe',
    userId: 'test-user-beginner',
    coffeeId: 'test-coffee-brazil',
    mode: 'cafe',
    date: new Date(),
    location: '테스트 카페',
    overallScore: 4,
    simpleNotes: {
      first: '달콤해요',
      texture: '부드러워요',
      aftertaste: '초콜릿 맛이 남아요'
    }
  }),

  // 홈카페 상세 기록
  createHomeCafeTasting: () => ({
    id: 'test-tasting-home',
    userId: 'test-user-homecafe',
    coffeeId: 'test-coffee-ethiopia',
    mode: 'homecafe',
    brewingMethod: 'V60',
    brewingDetails: {
      dose: 15,
      water: 250,
      temperature: 92,
      time: '2:30',
      grindSize: 'medium-fine'
    },
    sensoryScores: {
      aroma: 9,
      acidity: 8,
      body: 6,
      flavor: 9,
      aftertaste: 8,
      balance: 8,
      overall: 8.5
    },
    detailedNotes: {
      dry: '레몬 제스트, 재스민',
      wet: '오렌지, 꽃향기',
      flavor: '시트러스, 홍차, 꿀',
      aftertaste: '깔끔하고 상쾌한'
    }
  })
};
```

### 4. 엣지 케이스 테스트 데이터
```typescript
// PATTERN: 경계값과 예외 상황 테스트

const edgeCaseFactory = {
  // 매우 긴 텍스트
  createLongDescription: () => ({
    notes: '이 커피는 정말 특별한 향미를 가지고 있습니다...'.repeat(50)
  }),

  // 특수문자 포함
  createSpecialCharacters: () => ({
    coffeeName: '테스트 ☕️ 커피 & <스페셜>',
    notes: '맛이 정말 👍 좋아요! 100% 추천!'
  }),

  // 극단적인 점수
  createExtremeScores: () => ({
    veryLow: { overall: 1, notes: '최악이에요' },
    veryHigh: { overall: 10, notes: '인생 커피!' }
  }),

  // 오래된 날짜
  createOldDates: () => ({
    veryOld: new Date('2020-01-01'),
    future: new Date('2030-01-01')
  })
};
```

## USE_CASES

1. **단위 테스트**
```typescript
describe('감각 표현 변환', () => {
  it('전문 용어를 한국식 표현으로 변환한다', () => {
    const coffee = testCoffeeFactory.createEthiopiaYirgacheffe();
    const result = convertToKorean(coffee.notes.professional);
    expect(result).toContain('레몬처럼 상큼한');
  });
});
```

2. **통합 테스트**
```typescript
describe('테이스팅 API', () => {
  it('새로운 테이스팅을 저장한다', async () => {
    const user = testUserFactory.createHomeCafe();
    const tasting = testTastingFactory.createHomeCafeTasting();
    
    const response = await request(app)
      .post('/api/tastings')
      .set('Authorization', `Bearer ${user.token}`)
      .send(tasting);
      
    expect(response.status).toBe(201);
  });
});
```

3. **E2E 테스트**
```typescript
test('커피 테이스팅 전체 플로우', async ({ page }) => {
  const user = testUserFactory.createBeginner();
  const coffee = testCoffeeFactory.createBrazilSantos();
  
  // 로그인
  await loginAs(page, user);
  
  // 테이스팅 시작
  await page.click('[data-testid="start-tasting"]');
  await page.selectOption('[name="coffee"]', coffee.id);
  
  // 평가 입력
  await page.fill('[name="notes"]', '달콤하고 부드러워요');
  await page.click('[data-testid="submit-tasting"]');
  
  // 결과 확인
  await expect(page.locator('.tasting-result')).toBeVisible();
});
```

## BENEFITS
- ✅ 일관된 테스트 데이터
- ✅ 현실적인 시나리오
- ✅ 엣지 케이스 커버
- ✅ 유지보수 용이

## GOTCHAS
- ⚠️ 테스트 데이터는 프로덕션에 절대 사용 금지
- ⚠️ 날짜 관련 테스트는 고정된 날짜 사용
- ⚠️ 외부 서비스 의존성은 모킹 처리

## RELATED_FILES
- src/__tests__/factories/ (예정)
- src/__tests__/fixtures/ (예정)
- docs/decisions/002-testing-strategy.md