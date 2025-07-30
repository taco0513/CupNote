# 🍓 Flavor Selection (향미 선택) 상세 기획 문서

## 📋 개요

사용자가 커피에서 느낀 향미를 선택하는 페이지의 상세 기획 문서입니다.

**작성일**: 2025년 1월 29일  
**상태**: 초안  
**프로토타입 매핑**: Screen 4 (TastingFlow Step 1)

---

## 🎯 페이지 목적

### 주요 목표

- 사용자가 커피에서 느낀 주요 향미를 직관적으로 선택
- SCA Flavor Wheel 기반의 체계적인 향미 분류 제공
- 초보자도 쉽게 선택할 수 있는 친숙한 한국어 표현 사용

### 성공 지표

- 평균 선택 개수: 3-4개
- 페이지 이탈률 < 10%
- 평균 소요 시간: 30-60초

---

## 🏗️ 향미 구조 설계

### 9개 대분류, 85개 향미 (SCA Flavor Wheel 한국어 버전 완전판)

#### 🍓 과일향/프루티 (Fruity) - 16개

```
베리류/딸기류
• 블랙베리 - 진하고 달콤한 검은 베리
• 라즈베리 - 새콤달콤한 붉은 베리
• 블루베리 - 달콤하고 과즙이 많은 베리
• 딸기 - 상큼하고 달콤한 붉은 베리

건조 과일
• 건포도 - 달콤하고 진한 말린 포도
• 자두 - 부드럽고 달콤한 과일

기타 과일
• 코코넛 - 고소하고 달콤한 열대 과일
• 체리 - 달콤하고 진한 붉은 과일
• 석류 - 새콤달콤한 붉은 과일
• 파인애플 - 상큼하고 톡 쏘는 열대 과일
• 포도 - 달콤하고 과즙이 많은 과일
• 사과 - 상큼하고 아삭한 과일
• 복숭아 - 부드럽고 달콤한 과일
• 배 - 시원하고 달콤한 과일

감귤향/시트러스
• 자몽 - 쌉싸름하고 상큼한 과일
• 오렌지 - 달콤하고 상큼한 오렌지
• 레몬 - 밝고 시큼한 노란 과일
• 라임 - 시큼하고 청량한 과일
```

#### 🍋 신맛/발효 (Sour/Fermented) - 11개

```
신맛
• 신맛 아로마 - 전반적인 신맛
• 아세트산 - 식초 같은 신맛
• 뷰티르산 - 버터 같은 발효 냄새
• 이소발러산 - 치즈 같은 발효 냄새
• 구연산 - 레몬 같은 상큼한 신맛
• 사과산 - 사과 같은 부드러운 신맛

알코올/발효
• 와인향 - 발효된 포도의 복합적인 맛
• 위스키향 - 오크통 숙성의 깊은 맛
• 발효 - 은은한 발효향
• 과숙 - 지나치게 익은 과일향
```

#### 🌿 초록/식물성 (Green/Vegetative) - 11개

```
올리브 오일
• 올리브 오일 - 부드럽고 고소한 오일향

생것
• 생것 - 날것의 신선한 향

허브/식물성
• 덜 익은 - 미성숙한 과일이나 채소향
• 완두콩 꼬투리 - 신선한 콩과 식물향
• 신선한 - 갓 딴 채소나 과일향
• 진한 녹색 - 진한 잎채소향
• 식물성 - 전반적인 식물향
• 건초 - 말린 풀향
• 허브 - 신선한 허브향

콩비린내
• 콩비린내 - 날콩의 비린내
```

#### 📦 기타 (Other) - 14개

```
종이 냄새/곰팡이 냄새
• 묵은 - 오래되고 낡은 냄새
• 판지 - 골판지 같은 냄새
• 종이 - 종이 냄새
• 목재 냄새 - 나무 냄새
• 곰팡이/습한 - 습하고 곰팡이 난 냄새
• 곰팡이/먼지 - 먼지 낀 곰팡이 냄새
• 곰팡이/흙냄새 - 흙 같은 곰팡이 냄새
• 동물 냄새 - 동물적인 냄새
• 고기/육수 - 고기나 육수 냄새
• 페놀 - 약품 같은 화학물질 냄새

화학물질 냄새
• 쓴맛 - 쓴 화학물질 맛
• 짠맛 - 짠 맛
• 약품 냄새 - 약품 같은 냄새
• 석유 - 석유 냄새
• 스컹크 - 스컹크 같은 냄새
• 고무 냄새 - 고무 냄새
```

#### 🔥 로스팅 (Roasted) - 8개

```
파이프 담배
• 파이프 담배 - 파이프 담배향

담배
• 담배 - 일반 담배향

탄내/스모키
• 신랄한 - 톡 쏘는 탄내
• 재 냄새 - 재처럼 타버린 냄새
• 연기 - 그을린 나무나 스모키한 향
• 브라운 로스트 - 진하게 로스팅한 향

곡물 냄새/구운 빵 냄새
• 곡식 - 구운 곡물향
• 맥아 - 구운 맥아향
```

#### 🌶️ 향신료 (Spices) - 6개

```
자극적/펀전트
• 후추 - 톡 쏘는 검은 후추

후추
• 후추 - 일반적인 후추향

갈색 향신료
• 아니스 - 달콤하고 향긋한 향신료
• 육두구 - 따뜻하고 달콤한 향신료
• 계피 - 달콤하고 매운 향신료
• 정향 - 진하고 따뜻한 향신료
```

#### 🥜 견과류/너티/코코아 (Nutty/Cocoa) - 5개

```
견과류 냄새
• 아몬드 - 고소하고 부드러운 견과
• 헤이즐넛 - 진하고 버터리한 견과
• 땅콩 - 구수하고 친숙한 견과

초콜릿향
• 초콜릿 - 달콤하고 부드러운 초콜릿
• 다크초콜릿 - 쌉싸름하고 진한 카카오
```

#### 🍯 단맛 (Sweet) - 9개

```
캐러멜향/갈색설탕
• 당밀 - 진하고 끈적한 단맛
• 메이플시럽 - 고소하고 달콤한 시럽
• 캐러멜 - 구운 설탕의 달콤함
• 꿀 - 부드럽고 자연스러운 단맛

바닐라
• 바닐라 - 크리미하고 부드러운 단맛

바닐린
• 바닐린 - 인공 바닐라향

전반적 단맛
• 전반적 단맛 - 전체적으로 달콤한 느낌

달콤한 아로마
• 달콤한 아로마 - 은은한 달콤함
```

#### 🌺 꽃향기/플로럴 (Floral) - 4개

```
홍차
• 홍차 - 은은하고 떫은 찻잎향

꽃향기
• 카모마일 - 부드럽고 편안한 꽃
• 장미 - 우아하고 달콤한 꽃
• 자스민 - 향긋하고 은은한 흰 꽃
```

---

## 🎨 UI/UX 설계

### Level 2 중심 선택 전략

#### 1. 기본 선택은 Level 2에서

```
Level 1: 대분류 (카테고리 역할)
Level 2: 중분류 (실제 선택 단위) ← 기본 선택
Level 3: 소분류 (선택적 구체화) ← 원하는 경우만
```

#### 2. 선택 방식

- **Level 2 선택**: 필수 (예: "베리류", "시트러스")
- **Level 3 구체화**: 선택적 (예: 베리류 → 딸기, 블루베리)
- 사용자가 Level 2만 선택해도 충분히 유효

### 레이아웃 설계

```
┌─────────────────────────────┐
│  어떤 향미가 느껴지나요?      │
│  🔍 향미 검색...             │
├─────────────────────────────┤
│ ⭐ 자주 선택되는 향미         │
│ [베리류] [초콜릿향] [캐러멜향]│
├─────────────────────────────┤
│ 🍓 과일향/프루티              │
│ ┌─────────────────────────┐ │
│ │ ☑️ 베리류 (비활성)       │ │
│ │   └─ 구체적으로:        │ │
│ │      ● 딸기 ○ 블루베리  │ │
│ │      ○ 라즈베리         │ │
│ │ □ 시트러스              │ │
│ │ □ 건조 과일             │ │
│ │ □ 기타 과일             │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 🌺 꽃향기/플로럴 ▶           │
│ 🍯 단맛 ▶                    │
│ [나머지 카테고리들...]        │
└─────────────────────────────┘
│ 선택: 딸기, 캐러멜향 [다음 →] │
└─────────────────────────────┘
```

**시각적 상태 설명**:

- ☑️ (회색): Level 3가 선택되어 Level 2가 비활성화
- ● : Level 3 선택됨
- ○ : Level 3 선택 가능
- □ : Level 2 선택 가능

### 인터랙션

- **Level 2 선택**: 체크박스로 선택 (기본)
- **Level 3 구체화**: Level 2 선택 시 하위 옵션 표시 (선택적)
- **시각적 상태 표시**:
  - Level 2만 선택: 활성화된 체크박스 ☑
  - Level 3 선택 시: Level 2는 비활성화 상태로 표시 ☑️ (회색)
  - Level 3가 선택되면 Level 2는 자동으로 선택되지만 비활성화
- **선택 표시**:
  - Level 2만: "베리류"
  - Level 3 추가 시: "딸기, 블루베리" (Level 2는 암시적)
- **카운터**: 실제 선택된 항목 기준 (Level 2 또는 Level 3)
- **제한 없음**: 사용자가 원하는 만큼 선택 가능

### 시각적 디자인

- **카테고리별 색상 코딩**: 각 카테고리별 고유 색상
- **아이콘**: 각 카테고리별 대표 이모지
- **애니메이션**: 선택 시 부드러운 전환 효과

---

## 💡 향미 선택 가이드

### 초보자를 위한 도움말

```
💡 Tip: 처음이라면 이렇게 시작해보세요
• 가장 강하게 느껴지는 향 2-3개만 선택
• 잘 모르겠다면 "초콜릿", "견과류", "과일향" 중에서 선택
• 정답은 없어요! 본인이 느낀 그대로 선택하세요
```

### 향미 설명 툴팁

- 각 향미 옆 (?) 아이콘 탭 시 간단한 설명 표시
- 예: "캐러멜 - 설탕을 구웠을 때 나는 달콤하고 고소한 향"

---

## 📊 데이터 구조

```typescript
interface FlavorSelection {
  userId: string
  coffeeId: string
  selectedFlavors: FlavorChoice[] // 제한 없음
  timestamp: Date
}

interface FlavorChoice {
  level2: string // 필수 (예: "베리류")
  level3?: string[] // 선택적 (예: ["딸기", "블루베리"])
}

interface Flavor {
  id: string
  level1: string // 대분류 (예: "과일향/프루티")
  level2: string // 중분류 (예: "베리류")
  level3?: string // 소분류 (예: "딸기")
  nameKo: string
  nameEn: string
  description?: string
  emoji?: string
  frequency: number // 사용 빈도
}
```

---

## 🧩 Selection Logic (선택 로직)

### 1. 기본 선택 규칙

```typescript
// Level 2와 Level 3는 상호 배타적
if (Level3 선택) {
  Level2 = 자동 선택 + 비활성화
  표시 = Level3 항목들만
} else if (Level2 선택) {
  Level3 = 모두 미선택
  표시 = Level2 이름
}
```

### 2. 선택/해제 동작

```typescript
// Level 2 클릭 시
onLevel2Click(level2) {
  if (level2.hasSelectedLevel3) {
    // Level 3가 선택된 경우: 모두 해제
    deselectAllLevel3(level2)
    level2.selected = false
  } else {
    // Level 3가 없는 경우: 토글
    level2.selected = !level2.selected
  }
}

// Level 3 클릭 시
onLevel3Click(level3, parentLevel2) {
  level3.selected = !level3.selected

  if (anyLevel3Selected(parentLevel2)) {
    parentLevel2.selected = true
    parentLevel2.disabled = true
  } else {
    parentLevel2.selected = false
    parentLevel2.disabled = false
  }
}
```

### 3. 표시 로직

```typescript
// 선택된 항목 표시
getSelectedFlavors() {
  const selected = []

  categories.forEach(category => {
    category.level2Items.forEach(level2 => {
      const selectedLevel3 = level2.level3Items.filter(l3 => l3.selected)

      if (selectedLevel3.length > 0) {
        // Level 3가 선택된 경우
        selected.push(...selectedLevel3.map(l3 => l3.name))
      } else if (level2.selected) {
        // Level 2만 선택된 경우
        selected.push(level2.name)
      }
    })
  })

  return selected
}
```

### 4. 데이터 저장 로직

```typescript
// 저장 형식
saveFlavors() {
  const flavors = []

  categories.forEach(category => {
    category.level2Items.forEach(level2 => {
      const selectedLevel3 = level2.level3Items.filter(l3 => l3.selected)

      if (selectedLevel3.length > 0) {
        // Level 3가 선택된 경우
        flavors.push({
          level2: level2.id,
          level3: selectedLevel3.map(l3 => l3.id)
        })
      } else if (level2.selected) {
        // Level 2만 선택된 경우
        flavors.push({
          level2: level2.id,
          level3: null
        })
      }
    })
  })

  return flavors
}
```

### 5. UI 상태 관리

```typescript
// UI 상태 결정
getUIState(level2) {
  const hasSelectedLevel3 = level2.level3Items.some(l3 => l3.selected)

  return {
    checkbox: {
      checked: level2.selected || hasSelectedLevel3,
      disabled: hasSelectedLevel3,
      appearance: hasSelectedLevel3 ? 'grayed' : 'normal'
    },
    level3Section: {
      visible: level2.selected || hasSelectedLevel3,
      expanded: hasSelectedLevel3
    }
  }
}
```

### 6. 검색 로직

```typescript
// 향미 검색
searchFlavors(query) {
  const results = []
  const lowerQuery = query.toLowerCase()

  categories.forEach(category => {
    // Level 2 검색
    category.level2Items.forEach(level2 => {
      if (level2.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'level2',
          item: level2,
          category: category.name
        })
      }

      // Level 3 검색
      level2.level3Items.forEach(level3 => {
        if (level3.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'level3',
            item: level3,
            parentLevel2: level2.name,
            category: category.name
          })
        }
      })
    })
  })

  return results
}
```

### 7. 자주 사용되는 향미 로직

```typescript
// 인기 향미 계산
getPopularFlavors(limit = 6) {
  const flavorCounts = {}

  // 과거 선택 데이터에서 집계
  userSelections.forEach(selection => {
    selection.flavors.forEach(flavor => {
      const key = flavor.level3 || flavor.level2
      flavorCounts[key] = (flavorCounts[key] || 0) + 1
    })
  })

  // 상위 N개 반환
  return Object.entries(flavorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([flavor]) => flavor)
}
```

---

## 🔄 개선 아이디어

### 1. 적응형 향미 표시

- 사용자가 자주 선택하는 향미를 상단에 배치
- 계절별로 인기 있는 향미 하이라이트

### 2. 향미 검색 기능

- 25개 이상으로 확장 시 검색 기능 추가
- "초콜릿" 검색 → 다크초콜릿, 밀크초콜릿 표시

### 3. 향미 강도 표시

- 선택한 향미의 강도를 1-3단계로 표시
- 예: 딸기 (약함/보통/강함)

### 4. AI 추천

- 이전 선택 패턴 기반 향미 추천
- "이런 향미도 느껴보셨나요?" 섹션

---

## ⚠️ 고려사항

### Level 2 선택 전략의 장점

- **복잡도 감소**: 85개 → 약 30개 Level 2 선택지로 축소
- **유연성**: 구체적으로 표현하고 싶을 때만 Level 3 선택
- **초보자 친화적**: Level 2만으로도 충분한 표현력
- **전문가 지원**: Level 3로 세밀한 구분 가능

### 문화적 차이

- 한국인에게 생소한 향미는 설명 강화
- 예: "뷰티르산" → "버터 같은 발효 냄새"
- 부정적 향미도 정확히 표현 (결점 파악용)

### 일관성

- SCA 표준 완전 준수
- 한국어 표현은 이해하기 쉽게 의역

---

## 🚀 구현 우선순위

### Phase 1 (MVP)

- [x] 25개 기본 향미 구현
- [x] 카테고리별 그룹핑
- [x] 5개 선택 제한
- [ ] 기본 UI 구현

### Phase 2

- [ ] 향미 설명 툴팁
- [ ] 선택 애니메이션
- [ ] 사용 빈도 기반 정렬

### Phase 3

- [ ] AI 추천 기능
- [ ] 향미 강도 선택
- [ ] 개인화된 향미 순서

---

**📝 핵심 결정사항**

1. **Level 2 기본 선택** → 약 30개 중분류에서 선택
2. **Level 3는 선택적** → 구체화하고 싶을 때만 사용
3. **선택 개수 제한 없음** → 사용자가 원하는 만큼 선택 가능
4. **계층적 표시** → Level 2 선택 시 Level 3 옵션 노출
5. **SCA 표준 완전 준수** → 85개 모든 향미 포함

---

_문서 상태: 초안 완성_
