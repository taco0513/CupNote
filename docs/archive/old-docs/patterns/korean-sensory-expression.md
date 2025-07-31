# Pattern: Korean Sensory Expression System

## PURPOSE

커피의 맛과 향을 한국인에게 친숙한 표현으로 변환하는 시스템 패턴

## PATTERN_TYPE

Domain-Specific Language Pattern

## IMPLEMENTATION

```typescript
// WHY: 전문 커피 용어를 일반 사용자가 이해하기 쉬운 한국식 표현으로 변환
// CONTEXT: 사용자 경험 향상을 위한 핵심 기능
interface KoreanSensoryExpression {
  // 전문 용어
  professionalTerm: string

  // 한국식 표현
  koreanExpression: string

  // 카테고리 (향, 맛, 질감, 여운)
  category: 'aroma' | 'taste' | 'texture' | 'aftertaste'

  // 강도 (1-5)
  intensity: number

  // 관련 음식/경험
  relatedExperience?: string
}

// PATTERN: 변환 맵핑 시스템
const sensoryMappings: KoreanSensoryExpression[] = [
  {
    professionalTerm: 'citrus acidity',
    koreanExpression: '귤처럼 상큼한',
    category: 'taste',
    intensity: 3,
    relatedExperience: '제주 감귤',
  },
  {
    professionalTerm: 'nutty',
    koreanExpression: '고소한 땅콩향',
    category: 'aroma',
    intensity: 2,
    relatedExperience: '갓 볶은 땅콩',
  },
  // ... more mappings
]
```

## USE_CASES

1. 테이스팅 노트 입력시 전문 용어 → 한국식 표현 자동 제안
2. 사용자 프로필에 따른 맞춤형 표현 제공
3. 커피 추천시 이해하기 쉬운 설명 생성

## BENEFITS

- ✅ 진입 장벽 낮춤
- ✅ 사용자 참여도 향상
- ✅ 문화적 친숙함 제공

## GOTCHAS

- ⚠️ 너무 단순화하면 전문성 상실
- ⚠️ 지역별 표현 차이 고려 필요
- ⚠️ 세대별 이해도 차이 존재

## RELATED_FILES

- Foundation/02-features/KOREAN_SENSORY_SYSTEM.md
- src/models/sensory-expression.ts (예정)
- src/services/expression-converter.ts (예정)

## EXAMPLES

```
입력: "This coffee has bright acidity with chocolate notes"
출력: "이 커피는 상큼한 신맛이 있고 초콜릿 같은 달콤함이 느껴져요"

입력: "Floral aroma with wine-like body"
출력: "꽃향기가 나고 와인처럼 묵직한 느낌이에요"
```
