# CupNote Match Score 알고리즘 - Level 1 (향미 전용)

## 🎯 개요

사용자가 선택한 커피 향미만을 로스터 노트와 비교하여 Match Score를 계산하는 가장 심플한 버전입니다. 감각 표현 없이 순수하게 향미 매칭만 평가합니다.

## 💡 왜 향미만?

### 장점
- **극도로 단순함**: 이해하기 쉽고 직관적
- **빠른 평가**: 향미 선택만으로 즉시 결과
- **초보자 친화적**: "딸기맛이 나요" 수준의 평가
- **명확한 피드백**: 맞춘 향미와 놓친 향미가 명확

### 적합한 경우
- 카페에서 빠르게 기록할 때
- 커피를 처음 접하는 사용자
- 간단한 게임화 요소를 원할 때
- MVP 테스트 버전

## 📊 계산 방법

### 핵심 공식
```
Match Score = (맞춘 향미 수 ÷ 전체 향미 수) × 100
```

### 계산 예시
```
사용자 선택: [딸기, 초콜릿, 캐러멜]
로스터 노트: "Strawberry, chocolate, and floral notes"

매칭 결과:
- 딸기 ✅ (strawberry 발견!)
- 초콜릿 ✅ (chocolate 발견!)  
- 캐러멜 ❌ (없음)

Match Score = 2/3 × 100 = 67%
```

## 💻 구현 코드

### 심플 버전
```javascript
function calculateFlavorOnlyMatchScore(userFlavors, roasterNotes) {
  let matchCount = 0;
  const roasterText = roasterNotes.toLowerCase();
  
  userFlavors.forEach(flavor => {
    // 한국어를 영어로 변환
    const englishTerms = flavorMapping[flavor] || [flavor];
    
    // 로스터 노트에 포함되어 있는지 확인
    const found = englishTerms.some(term => 
      roasterText.includes(term.toLowerCase())
    );
    
    if (found) matchCount++;
  });
  
  return Math.round((matchCount / userFlavors.length) * 100);
}
```

### 상세 결과 포함 버전
```javascript
function calculateDetailedFlavorMatch(userFlavors, roasterNotes) {
  const roasterText = roasterNotes.toLowerCase();
  const results = {
    matched: [],
    missed: [],
    score: 0
  };
  
  userFlavors.forEach(flavor => {
    const englishTerms = flavorMapping[flavor] || [flavor];
    const found = englishTerms.some(term => 
      roasterText.includes(term.toLowerCase())
    );
    
    if (found) {
      results.matched.push(flavor);
    } else {
      results.missed.push(flavor);
    }
  });
  
  results.score = Math.round(
    (results.matched.length / userFlavors.length) * 100
  );
  
  return results;
}
```

## 🗂️ 향미 매핑 테이블

### 핵심 30개 향미 (MVP용)
```javascript
const flavorMapping = {
  // 과일류 (Fruits)
  "딸기": ["strawberry", "berry"],
  "체리": ["cherry"],
  "블루베리": ["blueberry", "berry"],
  "사과": ["apple"],
  "레몬": ["lemon", "citrus"],
  "오렌지": ["orange", "citrus"],
  "자몽": ["grapefruit", "citrus"],
  "복숭아": ["peach"],
  "포도": ["grape"],
  
  // 견과류 (Nuts)
  "아몬드": ["almond", "nut"],
  "헤이즐넛": ["hazelnut", "nut"],
  "호두": ["walnut", "nut"],
  "땅콩": ["peanut", "nut"],
  
  // 초콜릿/당류 (Chocolate/Sugar)
  "초콜릿": ["chocolate", "cocoa"],
  "다크초콜릿": ["dark chocolate", "dark cocoa"],
  "밀크초콜릿": ["milk chocolate"],
  "캐러멜": ["caramel"],
  "흑설탕": ["brown sugar"],
  "꿀": ["honey"],
  "바닐라": ["vanilla"],
  
  // 꽃/허브 (Floral/Herbal)
  "꽃": ["floral", "flower"],
  "재스민": ["jasmine"],
  "라벤더": ["lavender"],
  "장미": ["rose"],
  "허브": ["herbal", "herb"],
  
  // 기타 (Others)
  "와인": ["wine", "winey"],
  "홍차": ["black tea", "tea"],
  "담배": ["tobacco"],
  "향신료": ["spice", "spicy"]
};
```

## 📱 UI/UX 디자인

### 향미 선택 화면
```
┌─────────────────────────┐
│   어떤 맛이 느껴지나요?   │
│                         │
│ 🍓 딸기    🍒 체리      │
│ 🍫 초콜릿   🌰 헤이즐넛   │
│ 🍯 꿀      🌸 꽃향기    │
│ 🍋 레몬    🍑 복숭아    │
│                         │
│ 선택한 향미: 3개         │
│ [딸기] [초콜릿] [캐러멜]  │
│                         │
│    [매치 확인하기]       │
└─────────────────────────┘
```

### 결과 화면
```
┌─────────────────────────┐
│    🎯 Match Score       │
│                         │
│      [ 67% ]           │
│   ⭐⭐⭐☆☆            │
│                         │
│   "좋아요! 2개 맞췄어요!"  │
│                         │
│ ✅ 맞춘 향미:           │
│    딸기, 초콜릿          │
│                         │
│ ❌ 다른 향미:           │
│    캐러멜               │
│                         │
│ 💡 로스터가 느낀 향미:    │
│    꽃향기 (놓쳤어요!)     │
│                         │
│ [다시 하기] [저장하기]   │
└─────────────────────────┘
```

## 📈 점수 해석

### 점수별 메시지
```javascript
const getScoreMessage = (score, matched, total) => {
  if (score >= 80) {
    return `완벽해요! ${matched}/${total}개 모두 맞췄어요! 🏆`;
  } else if (score >= 60) {
    return `좋아요! ${matched}/${total}개 맞췄어요! ⭐`;
  } else if (score >= 40) {
    return `괜찮아요! ${matched}/${total}개 맞췄어요! 👍`;
  } else if (score >= 20) {
    return `${matched}개 맞췄어요! 계속 도전해보세요! 💪`;
  } else {
    return `다르게 느끼셨네요! 그것도 좋아요! 🌱`;
  }
};
```

### 추가 피드백
```javascript
const getAdditionalFeedback = (missed, roasterFlavors) => {
  const feedback = [];
  
  if (missed.length > 0) {
    feedback.push(`💭 다음에는 이런 향미도 찾아보세요: ${missed.join(', ')}`);
  }
  
  if (roasterFlavors.length > 0) {
    feedback.push(`🔍 로스터는 이런 향미도 느꼈어요: ${roasterFlavors.join(', ')}`);
  }
  
  return feedback;
};
```

## 🎮 게임화 요소

### 난이도 레벨
```javascript
const DIFFICULTY_LEVELS = {
  easy: {
    name: "쉬움",
    flavorCount: 3,
    commonFlavors: ["초콜릿", "캐러멜", "견과류"]
  },
  medium: {
    name: "보통",
    flavorCount: 5,
    commonFlavors: ["딸기", "체리", "꽃향기", "와인", "허브"]
  },
  hard: {
    name: "어려움",
    flavorCount: 7,
    subtleFlavors: ["라벤더", "자몽", "담배", "향신료"]
  }
};
```

### 성취 시스템
```javascript
const ACHIEVEMENTS = {
  firstMatch: {
    title: "첫 매치!",
    description: "처음으로 향미를 맞췄어요",
    icon: "🎯"
  },
  perfectScore: {
    title: "완벽한 매치",
    description: "100% 스코어 달성",
    icon: "💯"
  },
  flavorExplorer: {
    title: "향미 탐험가",
    description: "20가지 다른 향미 시도",
    icon: "🔍"
  }
};
```

## 🚀 구현 단계

### Phase 1: 최소 기능 (3일)
- 10개 기본 향미만 지원
- 단순 점수 계산
- 기본 결과 표시

### Phase 2: 확장 (1주)
- 30개 향미로 확장
- 상세 피드백
- 시각적 결과

### Phase 3: 게임화 (2주)
- 난이도 시스템
- 성취 배지
- 통계 추적

## 📊 확장 가능성

### 향미 전용 → 향미+감각
```javascript
// 나중에 감각을 추가하고 싶을 때
function upgradeToFullMatch(flavorScore, sensoryScore = null) {
  if (sensoryScore === null) {
    // 향미만 있을 때
    return flavorScore;
  } else {
    // 감각 추가 시 비율 적용
    return (flavorScore * 0.5) + (sensoryScore * 0.5);
  }
}
```

### 데이터 수집
```javascript
// 사용자가 자주 선택하는 향미 추적
const trackFlavorSelection = (userId, flavors) => {
  flavors.forEach(flavor => {
    analytics.track('flavor_selected', {
      userId,
      flavor,
      timestamp: new Date()
    });
  });
};
```

## 🎯 결론

향미 전용 Match Score는:
- **극도로 단순**하여 누구나 이해 가능
- **빠른 피드백**으로 즉각적인 만족감 제공
- **확장 가능**하여 나중에 감각 추가 가능
- **데이터 수집**에 용이하여 사용자 패턴 분석 가능

MVP로 시작하기에 완벽한 옵션입니다!

---

**문서 버전**: 1.0  
**작성일**: 2025-01-28  
**용도**: MVP 테스트, 초보자용, 빠른 평가