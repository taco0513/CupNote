# CupNote Match Score 알고리즘 - Level 2 (향미 + 감각)

## 🎯 개요

Match Score는 사용자가 선택한 커피 향미와 감각 표현을 로스터의 공식 노트와 비교하여 얼마나 비슷하게 느꼈는지 점수로 보여주는 기능입니다.

## 📚 연구 기반 설계

### SCA Q Grading System 분석
전문 Q Grader 시스템에서는 10개 항목을 동등하게 평가합니다:
- Fragrance/Aroma, **Flavor**, Aftertaste, Acidity, Body, Balance, Uniformity, Clean Cup, Sweetness, Overall
- 각 항목이 전체 점수의 10%를 차지 (Flavor는 단 10%!)

### CupNote 접근법
일반 사용자를 위해 단순화하되, 전문성은 유지:
- **향미 (Flavor)**: 직관적이고 쉽게 인지 가능
- **감각 (Sensory)**: 커피의 질감과 느낌 평가

## 📊 비율 옵션

### 🏆 추천: 50-50 비율 (MVP)
```
Match Score = (향미 매칭 50%) + (감각 매칭 50%)
```
**장점**: 
- 가장 단순하고 이해하기 쉬움
- 계산이 직관적
- 향후 조정 가능한 기준점

### 대안 1: 70-30 비율 (초보자용)
```
Match Score = (향미 매칭 70%) + (감각 매칭 30%)
```
**적합한 경우**: 커피를 막 시작한 사용자

### 대안 2: 60-40 비율 (중급자용)
```
Match Score = (향미 매칭 60%) + (감각 매칭 40%)
```
**적합한 경우**: 어느 정도 경험이 있는 사용자

## 💻 구현 코드

### 기본 구조 (50-50 버전)
```javascript
function calculateMatchScore(userFlavors, userSensory, roasterNotes) {
  const flavorScore = calculateFlavorMatch(userFlavors, roasterNotes);
  const sensoryScore = calculateSensoryMatch(userSensory, roasterNotes);
  
  // 50-50 비율
  return Math.round((flavorScore * 0.5) + (sensoryScore * 0.5));
}
```

### 설정 가능한 버전
```javascript
const MATCH_SCORE_CONFIG = {
  beginner: { flavor: 0.7, sensory: 0.3 },
  intermediate: { flavor: 0.6, sensory: 0.4 },
  advanced: { flavor: 0.5, sensory: 0.5 }
};

function calculateMatchScore(userFlavors, userSensory, roasterNotes, userLevel = 'beginner') {
  const config = MATCH_SCORE_CONFIG[userLevel];
  const flavorScore = calculateFlavorMatch(userFlavors, roasterNotes);
  const sensoryScore = calculateSensoryMatch(userSensory, roasterNotes);
  
  return Math.round(
    (flavorScore * config.flavor) + 
    (sensoryScore * config.sensory)
  );
}
```

## 📈 향미 매칭 (Flavor Matching)

### 계산 방법
```javascript
function calculateFlavorMatch(userFlavors, roasterNotes) {
  let matchCount = 0;
  const roasterText = roasterNotes.toLowerCase();
  
  userFlavors.forEach(flavor => {
    // 한국어를 영어로 변환
    const englishTerms = flavorMapping[flavor] || [flavor];
    
    // 직접 매칭 확인
    const found = englishTerms.some(term => 
      roasterText.includes(term.toLowerCase())
    );
    
    if (found) matchCount++;
  });
  
  return (matchCount / userFlavors.length) * 100;
}
```

### 주요 향미 매핑
```javascript
const flavorMapping = {
  // 과일류
  "딸기": ["strawberry", "berry"],
  "체리": ["cherry"],
  "사과": ["apple"],
  "레몬": ["lemon", "citrus"],
  "오렌지": ["orange", "citrus"],
  
  // 견과류
  "아몬드": ["almond"],
  "헤이즐넛": ["hazelnut"],
  "호두": ["walnut"],
  
  // 초콜릿/당류
  "초콜릿": ["chocolate", "cocoa"],
  "다크초콜릿": ["dark chocolate"],
  "캐러멜": ["caramel"],
  "흑설탕": ["brown sugar"],
  "꿀": ["honey"],
  
  // 꽃/허브
  "꽃": ["floral", "flower"],
  "재스민": ["jasmine"],
  "라벤더": ["lavender"],
  "허브": ["herbal", "herb"]
};
```

## 🎨 감각 매칭 (Sensory Matching)

### 계산 방법
```javascript
function calculateSensoryMatch(userSensory, roasterNotes) {
  let totalScore = 0;
  let categoryCount = 0;
  
  Object.keys(userSensory).forEach(category => {
    if (userSensory[category].length > 0) {
      categoryCount++;
      
      // 카테고리별로 매칭 확인
      const matched = checkCategoryMatch(
        userSensory[category],
        roasterNotes,
        category
      );
      
      if (matched) totalScore += 100;
    }
  });
  
  return categoryCount > 0 ? totalScore / categoryCount : 0;
}
```

### 6가지 감각 카테고리
1. **산미 (Acidity)**: 커피의 밝고 생기있는 특성
2. **단맛 (Sweetness)**: 자연스러운 단맛의 정도
3. **쓴맛 (Bitterness)**: 쓴맛의 강도와 질
4. **바디 (Body)**: 입안에서 느껴지는 무게감
5. **향 (Aroma)**: 코로 느끼는 향기
6. **여운 (Finish)**: 마신 후 남는 맛과 느낌

### 감각 표현 매핑
```javascript
const sensoryMapping = {
  산미: {
    "상큼한": ["bright", "crisp", "lively"],
    "부드러운": ["mild", "soft", "gentle"],
    "날카로운": ["sharp", "pointed", "tart"],
    "과일같은": ["fruity", "juicy"],
    "와인같은": ["wine-like", "winey"]
  },
  
  바디: {
    "가벼운": ["light", "delicate", "tea-like"],
    "중간": ["medium", "balanced"],
    "무거운": ["heavy", "full", "bold"],
    "크리미한": ["creamy", "smooth", "velvety"],
    "실키한": ["silky", "soft"]
  },
  
  단맛: {
    "달콤한": ["sweet"],
    "은은한": ["subtle", "mild"],
    "꿀같은": ["honey-like"],
    "과일단맛": ["fruity sweetness"],
    "캐러멜같은": ["caramel-like"]
  },
  
  여운: {
    "긴": ["long", "lingering"],
    "짧은": ["short", "quick"],
    "깔끔한": ["clean", "crisp"],
    "부드러운": ["smooth", "mellow"]
  }
};
```

## 💯 최종 점수 계산 예시

### 사용자 입력
```javascript
const userInput = {
  flavors: ["딸기", "초콜릿", "캐러멜"],
  sensory: {
    산미: ["상큼한", "밝은"],
    바디: ["부드러운", "가벼운"],
    단맛: ["은은한"]
  }
};

const roasterNotes = "Bright acidity with strawberry and dark chocolate notes, light body with subtle sweetness";
```

### 계산 과정
```
향미 매칭:
- 딸기 ✅ (strawberry 발견)
- 초콜릿 ✅ (chocolate 발견)
- 캐러멜 ❌ (없음)
향미 점수: 2/3 × 100 = 67점

감각 매칭:
- 산미: "상큼한" = "bright" ✅
- 바디: "가벼운" = "light" ✅
- 단맛: "은은한" = "subtle" ✅
감각 점수: 3/3 × 100 = 100점

최종 Match Score = (67 × 0.5) + (100 × 0.5) = 84점
```

## 📱 사용자 경험 설계

### 결과 표시
```
┌─────────────────────────┐
│    🎯 Match Score       │
│                         │
│      [ 84% ]           │
│   ⭐⭐⭐⭐⭐            │
│                         │
│ "와! 전문가 수준이에요!"   │
│                         │
│ ┌─────────┬─────────┐   │
│ │향미 67%  │감각 100%│   │
│ └─────────┴─────────┘   │
│                         │
│ 💡 놓친 향미: 캐러멜      │
│                         │
│ [상세 보기] [다시 하기]  │
└─────────────────────────┘
```

### 점수별 피드백
| 점수 | 의미 | 메시지 |
|------|------|--------|
| 80-100 | 매우 정확 | "와! 전문가 수준이에요! 🏆" |
| 60-79 | 정확 | "좋아요! 감각이 뛰어나세요! ⭐" |
| 40-59 | 보통 | "괜찮아요! 계속 연습해보세요! 💪" |
| 20-39 | 차이 있음 | "다르게 느끼셨네요! 그것도 맞아요! 🌱" |
| 0-19 | 많이 다름 | "새로운 발견이 많으셨네요! 🔍" |

## 🚀 단계별 구현 전략

### Phase 1: MVP (1-2주)
- 50-50 비율로 시작
- 기본 매핑 테이블 구축
- 간단한 점수 계산

### Phase 2: 개선 (3-4주)
- 사용자 레벨별 비율 조정
- 매핑 테이블 확장
- 상세 피드백 제공

### Phase 3: 고도화 (5-6주)
- 사용자 데이터 기반 최적화
- 개인화된 비율 설정
- 학습 곡선 추적

## 📊 향후 개선 방향

1. **데이터 기반 비율 조정**
   - 사용자 피드백 수집
   - A/B 테스트로 최적 비율 찾기

2. **레벨 시스템 도입**
   - 초보자: 70-30
   - 중급자: 60-40
   - 고급자: 50-50
   - 전문가: 10개 항목 전체 평가

3. **개인화**
   - 사용자별 강점/약점 분석
   - 맞춤형 비율 제안

---

**문서 버전**: 1.0  
**작성일**: 2025-01-28  
**근거**: SCA Q Grading System 연구