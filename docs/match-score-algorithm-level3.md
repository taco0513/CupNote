# CupNote Match Score 알고리즘 - Level 3 (향미 + 감각 + 전체 인상)

## 📊 개요

Match Score는 사용자의 커피 테이스팅 평가와 로스터/전문가의 공식 노트를 비교하여 사용자의 감각 능력을 객관적으로 평가하는 CupNote의 핵심 알고리즘입니다.

## 🎯 알고리즘 목적

1. **객관적 평가**: 사용자의 주관적 경험을 전문가 기준과 비교
2. **학습 도구**: 차이점 분석을 통한 감각 향상 가이드
3. **성장 추적**: 시간에 따른 감각 능력 발전 측정
4. **게임화 요소**: 점수를 통한 동기부여 및 재미 제공

## 🔍 알고리즘 구조

### 3단계 비교 분석 시스템

```
Match Score = (향미 일치도 × 40%) + (감각 표현 일치도 × 40%) + (전체 인상 일치도 × 20%)
```

## 📈 세부 계산 방법

### 1. 향미 일치도 (Flavor Match) - 40%

#### 계산 로직
```typescript
const calculateFlavorMatch = (
  userFlavors: FlavorNote[],
  roasterNotes: string
): number => {
  // 1. 로스터 노트에서 향미 키워드 추출
  const roasterKeywords = extractFlavorKeywords(roasterNotes);
  
  // 2. 직접 일치 검사
  const directMatches = userFlavors.filter(flavor =>
    roasterKeywords.includes(flavor.name.toLowerCase())
  );
  
  // 3. 카테고리 일치 검사
  const categoryMatches = userFlavors.filter(flavor =>
    !directMatches.includes(flavor) &&
    roasterKeywords.some(keyword => 
      isSameCategory(flavor.name, keyword)
    )
  );
  
  // 4. 연관 일치 검사
  const relatedMatches = userFlavors.filter(flavor =>
    !directMatches.includes(flavor) &&
    !categoryMatches.includes(flavor) &&
    roasterKeywords.some(keyword =>
      isRelated(flavor.name, keyword)
    )
  );
  
  // 5. 가중치 적용 계산
  const score = 
    (directMatches.length * 100) +
    (categoryMatches.length * 70) +
    (relatedMatches.length * 50);
    
  return Math.min(100, score / userFlavors.length);
};
```

#### 매칭 예시
- **직접 일치 (100점)**: "딸기" ↔ "strawberry"
- **카테고리 일치 (70점)**: "베리류" ↔ "strawberry"
- **연관 일치 (50점)**: "과일향" ↔ "strawberry"

### 2. 감각 표현 일치도 (Sensory Match) - 40%

#### 계산 로직
```typescript
const calculateSensoryMatch = (
  userExpressions: SensoryExpressions,
  roasterNotes: string
): number => {
  const categories = [
    'acidity',    // 산미
    'sweetness',  // 단맛
    'bitterness', // 쓴맛
    'body',       // 바디
    'aroma',      // 향
    'finish'      // 여운
  ];
  
  let totalScore = 0;
  let validCategories = 0;
  
  categories.forEach(category => {
    const userTerms = userExpressions[category];
    if (userTerms && userTerms.length > 0) {
      validCategories++;
      
      // 한영 매핑 테이블 활용
      const mappedTerms = mapKoreanToEnglish(userTerms);
      const roasterTerms = extractSensoryTerms(roasterNotes, category);
      
      // 카테고리별 매칭 점수 계산
      const categoryScore = calculateCategoryMatch(
        mappedTerms, 
        roasterTerms
      );
      
      totalScore += categoryScore;
    }
  });
  
  return validCategories > 0 ? totalScore / validCategories : 0;
};
```

#### 한국어-영어 매핑 예시
```javascript
const sensoryMapping = {
  acidity: {
    "상큼한": ["bright", "crisp", "lively"],
    "부드러운": ["mild", "soft", "gentle"],
    "날카로운": ["sharp", "pointed", "tart"],
    "과일같은": ["fruity", "juicy"],
    "와인같은": ["wine-like", "winey"]
  },
  body: {
    "가벼운": ["light", "delicate", "tea-like"],
    "중간": ["medium", "balanced"],
    "무거운": ["heavy", "full", "bold"],
    "크리미한": ["creamy", "smooth", "velvety"],
    "실키한": ["silky", "soft"]
  }
  // ... 기타 카테고리
};
```

### 3. 전체 인상 일치도 (Overall Impression) - 20%

#### 계산 로직
```typescript
const calculateOverallMatch = (
  userComment: string,
  roasterNotes: string
): number => {
  // 1. 감정 분석
  const userSentiment = analyzeSentiment(userComment);
  const roasterSentiment = analyzeSentiment(roasterNotes);
  
  // 2. 키 포인트 추출
  const userKeyPoints = extractKeyPoints(userComment);
  const roasterKeyPoints = extractKeyPoints(roasterNotes);
  
  // 3. 감정 일치도 (50%)
  const sentimentMatch = calculateSentimentAlignment(
    userSentiment,
    roasterSentiment
  );
  
  // 4. 핵심 포인트 일치도 (50%)
  const keyPointMatch = calculateKeyPointOverlap(
    userKeyPoints,
    roasterKeyPoints
  );
  
  return (sentimentMatch * 0.5) + (keyPointMatch * 0.5);
};
```

#### 감정 분석 요소
- **긍정/부정/중립**: 전반적 평가 톤
- **강도**: 표현의 강약 정도
- **복잡도**: 단순/복잡한 표현 사용

## 🎯 점수 해석 가이드

### 점수대별 평가

| 점수 범위 | 평가 | 설명 |
|----------|------|------|
| 90-100% | 전문가 수준 | 큐핑 전문가와 유사한 정확도 |
| 80-89% | 매우 우수 | 뛰어난 감각 능력 보유 |
| 70-79% | 우수 | 좋은 수준의 감각 능력 |
| 60-69% | 보통 | 평균적인 감각 능력 |
| 50-59% | 발전 필요 | 더 많은 경험과 학습 필요 |
| 50% 미만 | 초보자 | 기초부터 차근차근 학습 권장 |

### 카테고리별 피드백

```typescript
interface MatchScoreFeedback {
  overall_score: number;
  
  strengths: string[];        // 잘한 부분
  improvements: string[];     // 개선 필요 부분
  
  category_feedback: {
    flavor: {
      score: number;
      matched: string[];      // 일치한 향미
      missed: string[];       // 놓친 향미
      unique: string[];       // 독특하게 발견한 향미
    };
    sensory: {
      score: number;
      accurate: string[];     // 정확한 표현
      different: string[];    // 다른 표현
      suggestion: string[];   // 추천 표현
    };
    overall: {
      score: number;
      alignment: string;      // 전반적 일치도
      tips: string[];        // 향상 팁
    };
  };
}
```

## 💡 MVP 구현 전략

### Phase 1: 기본 구현 (MVP)

1. **단순화된 매칭**
   - 직접 키워드 매칭만 구현
   - 기본 한영 매핑 테이블
   - 단순 퍼센트 계산

2. **하드코딩된 데이터**
   ```javascript
   // 초기 버전: 고정된 매핑 테이블
   const basicFlavorMap = {
     "딸기": ["strawberry", "berry"],
     "초콜릿": ["chocolate", "cocoa"],
     "꽃": ["floral", "flower"],
     // ... 주요 30개 향미
   };
   ```

3. **기본 피드백**
   - 전체 점수만 표시
   - 간단한 강점/개선점 메시지

### Phase 2: 개선된 매칭

1. **카테고리 기반 매칭**
   - 향미 카테고리 그룹핑
   - 유사도 기반 매칭
   - 부분 점수 시스템

2. **확장된 매핑**
   ```javascript
   const advancedMapping = {
     categories: {
       "과일류": {
         keywords: ["fruit", "fruity"],
         members: ["딸기", "체리", "사과", ...]
       },
       "견과류": {
         keywords: ["nutty", "nut"],
         members: ["아몬드", "헤이즐넛", ...]
       }
     }
   };
   ```

### Phase 3: AI 기반 고도화

1. **자연어 처리**
   - NLP 기반 의미 분석
   - 문맥 이해
   - 동의어 자동 인식

2. **머신러닝 모델**
   - 사용자 패턴 학습
   - 개인화된 피드백
   - 예측 정확도 향상

## 🔧 기술 구현 가이드

### 필수 구현 함수

```typescript
// 1. 키워드 추출
function extractFlavorKeywords(text: string): string[] {
  // 정규식과 키워드 사전을 활용한 추출
  const keywords = [];
  const patterns = [
    /\b(strawberry|berry|chocolate|floral)\b/gi,
    /[가-힣]+(?=향|맛|느낌)/g
  ];
  // ... 추출 로직
  return keywords;
}

// 2. 한영 변환
function mapKoreanToEnglish(
  koreanTerms: string[]
): string[] {
  return koreanTerms.flatMap(term => 
    sensoryMapping[term] || [term]
  );
}

// 3. 유사도 계산
function calculateSimilarity(
  term1: string,
  term2: string
): number {
  // 레벤슈타인 거리 또는 코사인 유사도
  // 초기엔 단순 매칭, 추후 고도화
  return term1.toLowerCase() === term2.toLowerCase() ? 
    100 : 0;
}
```

### 데이터 구조

```typescript
interface MatchScoreData {
  // 입력
  user_input: {
    flavors: string[];
    sensory: Record<string, string[]>;
    comment: string;
  };
  
  roaster_notes: {
    text: string;
    language: 'ko' | 'en' | 'mixed';
    source: string;
  };
  
  // 결과
  result: {
    timestamp: Date;
    overall_score: number;
    category_scores: {
      flavor: number;
      sensory: number;
      overall: number;
    };
    details: {
      matched_keywords: string[];
      missed_keywords: string[];
      unique_discoveries: string[];
    };
  };
}
```

## 📊 성능 최적화

### 캐싱 전략

```typescript
const keywordCache = new Map();
const mappingCache = new Map();

function getCachedExtraction(text: string) {
  const hash = createHash(text);
  if (keywordCache.has(hash)) {
    return keywordCache.get(hash);
  }
  
  const keywords = extractFlavorKeywords(text);
  keywordCache.set(hash, keywords);
  return keywords;
}
```

### 실시간 계산 최적화

1. **디바운싱**: 입력 중 과도한 계산 방지
2. **점진적 계산**: 카테고리별 독립 계산
3. **Web Worker**: 무거운 계산은 백그라운드에서

## 🎮 사용자 경험 설계

### 시각적 피드백

```javascript
// 점수에 따른 색상과 이모지
const getScoreVisual = (score: number) => {
  if (score >= 90) return { color: '#22c55e', emoji: '🏆' };
  if (score >= 80) return { color: '#3b82f6', emoji: '⭐' };
  if (score >= 70) return { color: '#8b5cf6', emoji: '👍' };
  if (score >= 60) return { color: '#f59e0b', emoji: '🙂' };
  if (score >= 50) return { color: '#ef4444', emoji: '💪' };
  return { color: '#6b7280', emoji: '🌱' };
};
```

### 동기부여 메시지

```javascript
const motivationalMessages = {
  90: "와우! 전문 큐퍼 수준이에요! 🎯",
  80: "훌륭해요! 감각이 정말 뛰어나시네요! ✨",
  70: "좋아요! 계속 이렇게 발전하세요! 📈",
  60: "괜찮아요! 조금만 더 연습하면 돼요! 💪",
  50: "시작이 반이에요! 꾸준히 해봐요! 🌱",
  0: "모든 전문가도 처음엔 초보였어요! 🚀"
};
```

## 🔬 검증 및 테스트

### 테스트 케이스

```typescript
describe('Match Score Algorithm', () => {
  test('직접 일치 테스트', () => {
    const userFlavors = ['딸기', '초콜릿'];
    const roasterNotes = 'Strawberry and chocolate notes';
    const score = calculateFlavorMatch(userFlavors, roasterNotes);
    expect(score).toBeGreaterThan(90);
  });
  
  test('카테고리 일치 테스트', () => {
    const userFlavors = ['베리류'];
    const roasterNotes = 'Blueberry and raspberry';
    const score = calculateFlavorMatch(userFlavors, roasterNotes);
    expect(score).toBeGreaterThan(60);
  });
  
  test('한국어 감각 표현 매칭', () => {
    const userSensory = { acidity: ['상큼한'] };
    const roasterNotes = 'Bright and crisp acidity';
    const score = calculateSensoryMatch(userSensory, roasterNotes);
    expect(score).toBeGreaterThan(80);
  });
});
```

## 📈 미래 개선 방향

### 단기 (3-6개월)
1. 사용자 피드백 기반 매핑 테이블 개선
2. 더 정교한 카테고리 분류
3. 개인화된 학습 곡선 추적

### 중기 (6-12개월)
1. NLP 모델 통합
2. 이미지 인식 (라떼 아트 등)
3. 음성 입력 지원

### 장기 (1년+)
1. AI 기반 완전 자동화
2. 전문가 네트워크 연동
3. 국제화 (다국어 지원)

## 🏁 결론

Match Score 알고리즘은 CupNote의 핵심 차별화 요소로, 사용자의 커피 감각을 객관적으로 평가하고 성장을 도와주는 도구입니다. MVP에서는 단순하게 시작하되, 사용자 피드백을 통해 지속적으로 개선하여 궁극적으로는 AI 기반의 정교한 평가 시스템으로 발전시킬 계획입니다.

---

**문서 버전**: 1.0  
**작성일**: 2025-01-28  
**관련 문서**: 
- ROASTER_NOTES_SCREEN.md
- RESULT_SCREEN.md
- master-playbook-application-report.md