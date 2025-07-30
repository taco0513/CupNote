# CupNote Match Score 알고리즘 (Simple Version)

## 🎯 개요

Match Score는 사용자가 선택한 커피 향미와 감각 표현을 로스터의 공식 노트와 비교하여 얼마나 비슷하게 느꼈는지 점수로 보여주는 기능입니다.

**핵심 공식**:

```
Match Score = (향미 매칭 50%) + (감각 매칭 50%)
```

## 📊 계산 방법

### 1. 향미 매칭 (50%)

사용자가 선택한 향미들이 로스터 노트에 얼마나 포함되어 있는지 확인합니다.

#### 예시

```
사용자 선택: [딸기, 초콜릿, 캐러멜]
로스터 노트: "딸기와 다크 초콜릿의 조화, 꽃향기"

매칭 결과:
- 딸기 ✅ (발견!)
- 초콜릿 ✅ (발견!)
- 캐러멜 ❌ (없음)
- 꽃 🔍 (놓침)

향미 점수 = 2/3 × 100 = 67점
```

### 2. 감각 매칭 (50%)

사용자가 선택한 감각 표현들이 로스터 노트의 표현과 얼마나 비슷한지 확인합니다.

#### 6가지 감각 카테고리

- 산미 (Acidity)
- 단맛 (Sweetness)
- 쓴맛 (Bitterness)
- 바디 (Body)
- 향 (Aroma)
- 여운 (Finish)

#### 예시

```
사용자 선택:
- 산미: 상큼한, 밝은
- 바디: 부드러운, 가벼운

로스터 노트: "밝고 생기있는 산미, 미디엄 바디"

매칭 결과:
- 산미: "상큼한" = "밝은" ✅ (비슷한 표현)
- 바디: "가벼운" ≠ "미디엄" ❌ (다른 표현)

감각 점수 = 1/2 × 100 = 50점
```

## 💯 최종 점수 계산

```
향미 점수: 67점
감각 점수: 50점

Match Score = (67 × 0.5) + (50 × 0.5) = 58.5점 ≈ 59점
```

## 📈 점수 해석

| 점수   | 의미      | 메시지                                 |
| ------ | --------- | -------------------------------------- |
| 80-100 | 매우 정확 | "와! 전문가 수준이에요! 🏆"            |
| 60-79  | 정확      | "좋아요! 감각이 뛰어나세요! ⭐"        |
| 40-59  | 보통      | "괜찮아요! 계속 연습해보세요! 💪"      |
| 20-39  | 차이 있음 | "다르게 느끼셨네요! 그것도 맞아요! 🌱" |
| 0-19   | 많이 다름 | "새로운 발견이 많으셨네요! 🔍"         |

## 🗂️ 한국어-영어 매핑

### 주요 향미 매핑

```javascript
const flavorMapping = {
  // 과일류
  딸기: ['strawberry', 'berry'],
  체리: ['cherry'],
  사과: ['apple'],
  레몬: ['lemon', 'citrus'],

  // 견과류
  아몬드: ['almond'],
  헤이즐넛: ['hazelnut'],

  // 초콜릿/캐러멜
  초콜릿: ['chocolate', 'cocoa'],
  캐러멜: ['caramel'],
  흑설탕: ['brown sugar'],

  // 꽃/허브
  꽃: ['floral', 'flower'],
  재스민: ['jasmine'],
  허브: ['herbal', 'herb'],
}
```

### 감각 표현 매핑

```javascript
const sensoryMapping = {
  산미: {
    상큼한: ['bright', 'crisp'],
    부드러운: ['mild', 'soft'],
    과일같은: ['fruity', 'juicy'],
  },

  바디: {
    가벼운: ['light', 'delicate'],
    중간: ['medium', 'balanced'],
    무거운: ['heavy', 'full'],
    부드러운: ['smooth', 'silky'],
  },

  단맛: {
    달콤한: ['sweet'],
    은은한: ['subtle', 'mild'],
    꿀같은: ['honey-like'],
  },
}
```

## 💻 구현 코드 (심플 버전)

### 향미 매칭 함수

```javascript
function calculateFlavorMatch(userFlavors, roasterNotes) {
  let matchCount = 0
  const roasterText = roasterNotes.toLowerCase()

  userFlavors.forEach(flavor => {
    // 한국어를 영어로 변환
    const englishTerms = flavorMapping[flavor] || [flavor]

    // 로스터 노트에 포함되어 있는지 확인
    const found = englishTerms.some(term => roasterText.includes(term.toLowerCase()))

    if (found) matchCount++
  })

  return (matchCount / userFlavors.length) * 100
}
```

### 감각 매칭 함수

```javascript
function calculateSensoryMatch(userSensory, roasterNotes) {
  let totalScore = 0
  let categoryCount = 0

  Object.keys(userSensory).forEach(category => {
    if (userSensory[category].length > 0) {
      categoryCount++

      // 카테고리별로 매칭 확인
      const matched = checkCategoryMatch(userSensory[category], roasterNotes, category)

      if (matched) totalScore += 100
    }
  })

  return categoryCount > 0 ? totalScore / categoryCount : 0
}
```

### 최종 점수 계산

```javascript
function calculateMatchScore(userFlavors, userSensory, roasterNotes) {
  const flavorScore = calculateFlavorMatch(userFlavors, roasterNotes)
  const sensoryScore = calculateSensoryMatch(userSensory, roasterNotes)

  return Math.round(flavorScore * 0.5 + sensoryScore * 0.5)
}
```

## 🎮 사용자 경험

### 결과 화면 표시 예시

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Match Score: 75%
        "좋아요! 감각이 뛰어나세요! ⭐"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 상세 분석:

향미 매칭 (80%)
✅ 딸기 - 정확히 맞췄어요!
✅ 초콜릿 - 정확히 맞췄어요!
❌ 캐러멜 - 로스터는 언급하지 않았네요
💡 놓친 향미: 꽃향기

감각 매칭 (70%)
✅ 산미: "상큼한" = 로스터의 "bright"
❌ 바디: "가벼운" ≠ 로스터의 "medium"
```

## 🚀 MVP 구현 단계

### 1단계: 기본 매칭 (1주)

- 직접적인 단어 매칭만 구현
- 10-20개 주요 향미만 지원
- 기본 점수 계산

### 2단계: 매핑 확장 (2주)

- 30-50개 향미로 확장
- 한영 매핑 테이블 구축
- 유사 단어 인식

### 3단계: 사용자 피드백 (3주)

- 시각적 결과 표시
- 놓친 향미 안내
- 학습 도움말 제공

## 📱 화면 디자인 아이디어

```
┌─────────────────────────┐
│    🎯 Match Score       │
│                         │
│      [ 75% ]           │
│   ⭐⭐⭐⭐☆            │
│                         │
│ "좋아요! 감각이 뛰어나세요!"│
│                         │
│ ┌─────────┬─────────┐   │
│ │향미 80%  │감각 70% │   │
│ └─────────┴─────────┘   │
│                         │
│ [상세 보기] [다시 하기]  │
└─────────────────────────┘
```

## 🔑 성공 포인트

1. **심플함**: 향미 + 감각, 단 2가지만 비교
2. **명확함**: 50:50 비율로 쉽게 이해
3. **긍정적**: 낮은 점수도 긍정적으로 해석
4. **교육적**: 놓친 부분을 알려줘 학습 유도

## 📈 향후 개선 방향

- 더 많은 향미 단어 추가
- 사용자 데이터 기반 매핑 개선
- 개인별 성장 그래프 제공
- 친구와 점수 비교 기능

---

이렇게 심플한 Match Score는 사용자가 쉽게 이해하고 재미있게 사용할 수 있습니다!
