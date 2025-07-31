# CupNote Match Score - 동적 레벨 시스템

## 🎯 개요

사용자의 입력 상황에 따라 Match Score 레벨을 자동으로 결정하는 유연한 시스템입니다.

## 🔄 동적 레벨 결정 로직

### 기본 규칙

```javascript
function determineMatchScoreLevel(tastingData) {
  const { flavors, sensoryExpressions, personalComment } = tastingData

  // 감각 표현을 스킵했거나 비어있는 경우
  if (!sensoryExpressions || isEmptySensoryExpressions(sensoryExpressions)) {
    return 'level1' // 향미만 평가
  }

  // 감각 표현이 있는 경우
  return 'level2' // 향미 + 감각 평가
}
```

### 감각 표현 스킵 체크

```javascript
function isEmptySensoryExpressions(sensoryExpressions) {
  if (!sensoryExpressions) return true

  // 모든 카테고리가 비어있는지 확인
  const categories = ['acidity', 'sweetness', 'bitterness', 'body', 'aroma', 'finish']

  return categories.every(
    category => !sensoryExpressions[category] || sensoryExpressions[category].length === 0
  )
}
```

## 📱 UI/UX 구현

### SensoryExpressionScreen 수정

```javascript
// 스킵 버튼 추가
const SensoryExpressionScreen = () => {
  const [expressions, setExpressions] = useState({});
  const navigation = useNavigation();

  const handleSkip = () => {
    // 빈 감각 표현으로 다음 화면 이동
    navigation.navigate('PersonalComment', {
      sensoryExpressions: null, // 명시적으로 null
      skipped: true
    });
  };

  return (
    <View>
      <Header title="감각 표현" />

      {/* 기존 UI */}
      <SensoryCategories ... />

      <Footer>
        <Button
          variant="secondary"
          onPress={handleSkip}
          text="건너뛰기"
        />
        <Button
          variant="primary"
          onPress={handleNext}
          text="다음"
          disabled={!hasAnySelection}
        />
      </Footer>
    </View>
  );
};
```

### ResultScreen Match Score 계산

```javascript
const ResultScreen = ({ route }) => {
  const tastingData = route.params

  // 동적으로 레벨 결정
  const matchScoreLevel = determineMatchScoreLevel(tastingData)

  // 레벨에 따른 점수 계산
  const matchScore = calculateMatchScore(
    tastingData.flavors,
    tastingData.sensoryExpressions,
    tastingData.roasterNotes,
    matchScoreLevel
  )

  return (
    <View>
      <MatchScoreDisplay
        score={matchScore.score}
        level={matchScoreLevel}
        details={matchScore.details}
      />
    </View>
  )
}
```

## 💯 Match Score 계산 함수

### 통합 계산 함수

```javascript
function calculateMatchScore(flavors, sensoryExpressions, roasterNotes, level) {
  switch (level) {
    case 'level1':
      return calculateLevel1Score(flavors, roasterNotes)

    case 'level2':
      return calculateLevel2Score(flavors, sensoryExpressions, roasterNotes)

    default:
      return calculateLevel1Score(flavors, roasterNotes)
  }
}

// Level 1: 향미만
function calculateLevel1Score(flavors, roasterNotes) {
  const flavorScore = calculateFlavorMatch(flavors, roasterNotes)

  return {
    score: flavorScore,
    level: 'level1',
    details: {
      flavorScore: flavorScore,
      sensoryScore: null,
    },
  }
}

// Level 2: 향미 + 감각
function calculateLevel2Score(flavors, sensoryExpressions, roasterNotes) {
  const flavorScore = calculateFlavorMatch(flavors, roasterNotes)
  const sensoryScore = calculateSensoryMatch(sensoryExpressions, roasterNotes)

  return {
    score: Math.round(flavorScore * 0.5 + sensoryScore * 0.5),
    level: 'level2',
    details: {
      flavorScore: flavorScore,
      sensoryScore: sensoryScore,
    },
  }
}
```

## 🎨 결과 화면 표시

### Level 1 결과 (감각 스킵)

```
┌─────────────────────────┐
│    🎯 Match Score       │
│                         │
│      [ 67% ]           │
│   ⭐⭐⭐☆☆            │
│                         │
│   "향미 매칭 결과"       │
│                         │
│ ✅ 맞춘 향미: 2/3       │
│    딸기, 초콜릿          │
│                         │
│ 💡 팁: 감각 표현도       │
│    평가해보면 더 정확한   │
│    점수를 받을 수 있어요! │
└─────────────────────────┘
```

### Level 2 결과 (감각 포함)

```
┌─────────────────────────┐
│    🎯 Match Score       │
│                         │
│      [ 84% ]           │
│   ⭐⭐⭐⭐⭐            │
│                         │
│ "종합 매칭 결과"         │
│                         │
│ ┌─────────┬─────────┐   │
│ │향미 67%  │감각 100%│   │
│ └─────────┴─────────┘   │
│                         │
│ 상세한 평가 감사합니다!   │
└─────────────────────────┘
```

## 🚀 구현 장점

### 1. 사용자 선택권

- 빠른 기록을 원하면 감각 표현 스킵 가능
- 상세한 평가를 원하면 모두 입력

### 2. 공정한 평가

- 입력한 항목만으로 평가
- 스킵한 항목은 점수에 반영하지 않음

### 3. 점진적 학습

- 처음엔 향미만으로 시작
- 익숙해지면 감각 표현도 추가

### 4. 명확한 피드백

- 어떤 레벨로 평가되었는지 표시
- 더 나은 평가를 위한 팁 제공

## 📊 데이터 저장

```typescript
interface TastingRecord {
  // 기본 정보
  id: string
  userId: string
  timestamp: Date

  // 입력 데이터
  coffeeInfo: CoffeeInfo
  flavors: string[]
  sensoryExpressions: SensoryExpressions | null // null 가능
  personalComment: string
  roasterNotes: string

  // Match Score
  matchScore: {
    level: 'level1' | 'level2'
    score: number
    details: {
      flavorScore: number
      sensoryScore: number | null
    }
  }

  // 메타데이터
  sensorySkipped: boolean // 스킵 여부 추적
}
```

## 🔄 향후 확장

### 사용자 통계

```javascript
// 사용자가 감각 표현을 얼마나 자주 입력하는지 추적
const getUserStats = (userId) => {
  const records = await getTastingRecords(userId);

  const total = records.length;
  const withSensory = records.filter(r => !r.sensorySkipped).length;

  return {
    totalRecords: total,
    sensoryCompletionRate: (withSensory / total) * 100,
    preferredLevel: withSensory > total / 2 ? 'level2' : 'level1'
  };
};
```

### 개인화된 추천

```javascript
// 사용자 패턴에 따른 UI 조정
if (userStats.sensoryCompletionRate < 30) {
  // 감각 표현을 거의 안 하는 사용자
  // 스킵 버튼을 더 크게 표시
} else if (userStats.sensoryCompletionRate > 70) {
  // 감각 표현을 자주 하는 사용자
  // 기본적으로 감각 표현 화면 표시
}
```

## 🎯 결론

동적 레벨 시스템은:

- **유연성**: 사용자 상황에 맞춘 평가
- **공정성**: 입력한 것만 평가
- **성장성**: 점진적 학습 유도
- **데이터**: 사용 패턴 분석 가능

이렇게 하면 MVP에서도 다양한 사용자 니즈를 충족할 수 있습니다!
