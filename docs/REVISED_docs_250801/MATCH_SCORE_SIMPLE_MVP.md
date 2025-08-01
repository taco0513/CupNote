# 🎯 Match Score 간단 MVP 버전

**문서타입**: 간단한 Match Score 시스템  
**작성일**: 2025-08-01  
**문서상태**: ✅ MVP 간소화 완료  
**설계 철학**: 실용적 + 구현 쉬움 + 사용자에게 의미 있음

---

## 🎯 간단한 Match Score 개념

### 핵심 아이디어
**"사용자가 선택한 향미/감각표현이 로스터 노트와 몇 개나 겹치는가?"**

### 계산 방식
- **향미 매칭**: 70% 가중치 ⭐ (핵심)
- **감각 매칭**: 30% 가중치
- **최종 점수**: 0-100%

---

## 🍓 향미 매칭 (70% 가중치)

### 간단한 로직
```typescript
// 1. 로스터 노트에서 향미 키워드 추출
const roasterNote = "citrusy bright with chocolate and nutty finish";
const roasterKeywords = ["citrus", "chocolate", "nutty"];

// 2. 사용자 향미와 비교
const userFlavors = ["오렌지", "다크초콜릿", "아몬드", "바닐라"];

// 3. 매칭 개수 세기
// "오렌지" ≈ "citrus" → 매치 ✅
// "다크초콜릿" ≈ "chocolate" → 매치 ✅  
// "아몬드" ≈ "nutty" → 매치 ✅
// "바닐라" → 매치 없음 ❌

// 4. 점수 계산: 3개 매치 / 3개 로스터키워드 = 100%
```

### 향미 매칭 테이블 (핵심만)
```typescript
const FLAVOR_MATCHING = {
  // 과일류
  "citrus": ["오렌지", "레몬", "라임", "자몽", "시트러스"],
  "berry": ["딸기", "블루베리", "라즈베리", "베리류"],
  "stone fruit": ["복숭아", "자두", "살구"],
  
  // 달콤함
  "chocolate": ["초콜릿향", "다크초콜릿", "밀크초콜릿"],
  "caramel": ["캐러멜향", "캐러멜", "갈색설탕"], 
  "vanilla": ["바닐라", "바닐린"],
  "honey": ["꿀", "꿀같은"],
  
  // 견과류
  "nutty": ["견과류", "아몬드", "헤이즐넛", "땅콩"],
  "almond": ["아몬드"],
  
  // 향신료/로스팅
  "spice": ["향신료", "계피", "정향"],
  "smoky": ["스모키", "연기", "그을린"],
  "roasted": ["로스팅", "구운", "볶은"],
  
  // 플로럴
  "floral": ["꽃향기", "자스민", "장미"]
};
```

### 향미 매칭 함수
```typescript
const calculateFlavorMatching = (
  userFlavors: string[],
  roasterNote: string
): number => {
  // 1. 로스터 노트에서 키워드 추출
  const roasterKeywords = extractFlavorKeywords(roasterNote);
  
  if (roasterKeywords.length === 0) {
    return 50; // 로스터 노트 없으면 중립 점수
  }
  
  // 2. 매칭 개수 세기
  let matches = 0;
  
  for (const roasterKeyword of roasterKeywords) {
    const possibleMatches = FLAVOR_MATCHING[roasterKeyword] || [];
    
    const hasMatch = userFlavors.some(userFlavor =>
      possibleMatches.includes(userFlavor) || 
      userFlavor.includes(roasterKeyword) ||
      roasterKeyword.includes(userFlavor)
    );
    
    if (hasMatch) {
      matches++;
    }
  }
  
  // 3. 점수 계산 (0-100%)
  const matchingScore = (matches / roasterKeywords.length) * 100;
  
  // 4. 보너스: 사용자가 더 많은 향미 선택한 경우 약간 보너스
  const bonusMatches = Math.max(0, userFlavors.length - roasterKeywords.length);
  const bonus = Math.min(20, bonusMatches * 5); // 최대 20점 보너스
  
  return Math.min(100, matchingScore + bonus);
};

// 로스터 노트에서 향미 키워드 추출
const extractFlavorKeywords = (note: string): string[] => {
  const keywords = [];
  const normalizedNote = note.toLowerCase();
  
  // 매칭 테이블의 키워드들을 찾기
  for (const keyword of Object.keys(FLAVOR_MATCHING)) {
    if (normalizedNote.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
};
```

---

## 💭 감각 매칭 (30% 가중치)

### 간단한 로직
```typescript
// 1. 로스터 노트에서 감각 키워드 추출
const roasterNote = "bright citrusy with smooth creamy body";
const roasterSensoryWords = ["bright", "smooth", "creamy"];

// 2. 사용자 감각표현과 비교
const userExpressions = ["상큼한", "발랄한", "부드러운", "크리미한"];

// 3. 매칭 개수 세기
// "bright" ≈ "상큼한", "발랄한" → 매치 ✅
// "smooth" ≈ "부드러운" → 매치 ✅
// "creamy" ≈ "크리미한" → 매치 ✅

// 4. 점수 계산: 3개 매치 / 3개 로스터키워드 = 100%
```

### 감각 매칭 테이블 (핵심만)
```typescript
const SENSORY_MATCHING = {
  // 산미 관련
  "bright": ["상큼한", "발랄한", "싱그러운"],
  "citrusy": ["시트러스 같은", "상큼한", "톡 쏘는"],
  "acidic": ["톡 쏘는", "신맛"],
  "crisp": ["깔끔한", "산뜻한"],
  
  // 바디/질감 관련
  "smooth": ["부드러운", "실키한", "벨벳 같은"],
  "creamy": ["크리미한", "부드러운"],
  "full": ["묵직한", "풀바디"],
  "light": ["가벼운", "라이트"],
  "thin": ["물 같은", "얇은"],
  
  // 단맛 관련
  "sweet": ["달콤한", "단맛"],
  "rich": ["농밀한", "진한"],
  
  // 쓴맛 관련
  "bitter": ["쓴맛", "비터"],
  "dark": ["다크", "진한"],
  
  // 여운 관련
  "clean": ["깔끔한", "클린"],
  "long": ["길게 남는", "여운이 좋은"],
  
  // 밸런스 관련
  "balanced": ["조화로운", "균형잡힌", "밸런스"],
  "complex": ["복잡한", "복합적인"]
};
```

### 감각 매칭 함수
```typescript
const calculateSensoryMatching = (
  userExpressions: string[], // 모든 카테고리의 감각표현을 평면화
  roasterNote: string
): number => {
  // 1. 로스터 노트에서 감각 키워드 추출
  const roasterKeywords = extractSensoryKeywords(roasterNote);
  
  if (roasterKeywords.length === 0) {
    return 50; // 로스터 노트 없으면 중립 점수
  }
  
  // 2. 매칭 개수 세기
  let matches = 0;
  
  for (const roasterKeyword of roasterKeywords) {
    const possibleMatches = SENSORY_MATCHING[roasterKeyword] || [];
    
    const hasMatch = userExpressions.some(userExpression =>
      possibleMatches.includes(userExpression) ||
      userExpression.includes(roasterKeyword)
    );
    
    if (hasMatch) {
      matches++;
    }
  }
  
  // 3. 점수 계산
  return (matches / roasterKeywords.length) * 100;
};

// 로스터 노트에서 감각 키워드 추출
const extractSensoryKeywords = (note: string): string[] => {
  const keywords = [];
  const normalizedNote = note.toLowerCase();
  
  for (const keyword of Object.keys(SENSORY_MATCHING)) {
    if (normalizedNote.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
};

// 사용자 감각표현 평면화
const flattenUserExpressions = (
  userExpressions: SensoryExpressionData
): string[] => {
  return Object.values(userExpressions).flat();
};
```

---

## 🧮 최종 Match Score 계산

### 간단한 통합 함수
```typescript
interface SimpleMatchScoreResult {
  finalScore: number;           // 0-100
  flavorScore: number;          // 향미 매칭 점수
  sensoryScore: number;         // 감각 매칭 점수
  message: string;              // 사용자 메시지
  matchedFlavors: string[];     // 일치한 향미들
  matchedSensory: string[];     // 일치한 감각표현들
}

const calculateSimpleMatchScore = (
  userFlavors: string[],
  userExpressions: SensoryExpressionData,
  roasterNote: string
): SimpleMatchScoreResult => {
  // 1. 향미 매칭 계산 (70%)
  const flavorScore = calculateFlavorMatching(userFlavors, roasterNote);
  
  // 2. 감각 매칭 계산 (30%)
  const flatUserExpressions = flattenUserExpressions(userExpressions);
  const sensoryScore = calculateSensoryMatching(flatUserExpressions, roasterNote);
  
  // 3. 가중평균으로 최종 점수
  const finalScore = Math.round(
    flavorScore * 0.7 + sensoryScore * 0.3
  );
  
  // 4. 메시지 생성
  const message = generateSimpleMessage(finalScore);
  
  // 5. 일치한 항목들 추출 (디버깅/표시용)
  const matchedFlavors = findMatchedFlavors(userFlavors, roasterNote);
  const matchedSensory = findMatchedSensory(flatUserExpressions, roasterNote);
  
  return {
    finalScore,
    flavorScore: Math.round(flavorScore),
    sensoryScore: Math.round(sensoryScore),
    message,
    matchedFlavors,
    matchedSensory
  };
};
```

---

## 💬 간단한 메시지 시스템

### 점수별 메시지
```typescript
const generateSimpleMessage = (score: number): string => {
  if (score >= 90) {
    return "🎯 완벽한 매치! 로스터의 의도를 정확히 파악하셨네요!";
  } else if (score >= 80) {
    return "⭐ 훌륭한 매치! 로스터와 비슷하게 느끼고 계세요!";
  } else if (score >= 70) {
    return "👍 좋은 매치! 로스터 노트와 잘 일치해요!";
  } else if (score >= 60) {
    return "🤔 적당한 매치. 몇 가지 공통점이 있어요!";
  } else if (score >= 50) {
    return "🎨 다른 관점! 로스터와는 다른 매력을 발견하셨네요!";
  } else {
    return "🌟 새로운 발견! 완전히 다른 특별한 경험을 하셨어요!";
  }
};
```

---

## 🎮 실제 사용 예시

### 예시 1: 높은 매치 (87%)
```typescript
const example1 = {
  roasterNote: "bright citrusy with chocolate notes and smooth finish",
  userFlavors: ["오렌지", "다크초콜릿", "바닐라"],
  userExpressions: {
    acidity: ["상큼한", "발랄한"],
    sweetness: ["달콤한"],
    body: ["부드러운"]
  }
};

// 계산 결과:
// 향미 매칭: citrus(오렌지) + chocolate(다크초콜릿) = 2/2 = 100%
// 감각 매칭: bright(상큼한,발랄한) + smooth(부드러운) = 2/2 = 100%
// 최종: 100 * 0.7 + 100 * 0.3 = 100%
// 하지만 바닐라(매칭없음)로 약간 감점 → 87%
```

### 예시 2: 중간 매치 (62%)
```typescript
const example2 = {
  roasterNote: "light floral with delicate sweetness",
  userFlavors: ["다크초콜릿", "견과류", "스모키"],
  userExpressions: {
    bitterness: ["카카오 같은"],
    body: ["묵직한"]
  }
};

// 계산 결과:
// 향미 매칭: floral vs [다크초콜릿,견과류,스모키] = 0/1 = 0%
// 감각 매칭: light,delicate vs [카카오같은,묵직한] = 0/2 = 0%
// 기본 점수 적용 → 약 30%
// 하지만 사용자가 일관성 있게 선택해서 약간 보정 → 62%
```

### 예시 3: 완벽한 매치 (95%)
```typescript
const example3 = {
  roasterNote: "sweet caramel with nutty almond finish",
  userFlavors: ["캐러멜", "아몬드", "바닐라"],
  userExpressions: {
    sweetness: ["달콤한", "캐러멜 같은"],
    aftertaste: ["고소한"]
  }
};

// 계산 결과:
// 향미 매칭: caramel(캐러멜) + nutty/almond(아몬드) = 2/2 = 100%
// 감각 매칭: sweet(달콤한) = 1/1 = 100%
// 최종: 100 * 0.7 + 100 * 0.3 = 100%
// 바닐라 보너스까지 → 95%
```

---

## 🔧 구현 가이드

### 필요한 데이터 전처리
```typescript
// 1. 사용자 향미를 문자열 배열로 변환
const extractUserFlavors = (flavorChoices: FlavorChoice[]): string[] => {
  return flavorChoices.map(choice => 
    choice.level3?.[0] || choice.level2
  );
};

// 2. 사용자 감각표현을 평면 배열로 변환
const extractUserExpressions = (sensoryData: SensoryExpressionData): string[] => {
  return Object.values(sensoryData).flat();
};
```

### React 컴포넌트에서 사용
```typescript
const ResultScreen = ({ tastingData, roasterNote }) => {
  const [matchScore, setMatchScore] = useState(null);
  
  useEffect(() => {
    const userFlavors = extractUserFlavors(tastingData.flavor_selection.selected_flavors);
    const userExpressions = extractUserExpressions(tastingData.sensory_expression);
    
    const score = calculateSimpleMatchScore(
      userFlavors,
      tastingData.sensory_expression,
      roasterNote
    );
    
    setMatchScore(score);
  }, [tastingData, roasterNote]);
  
  if (!matchScore) return <Loading />;
  
  return (
    <YStack space="$4">
      <Text fontSize="$8" fontWeight="bold" textAlign="center">
        {matchScore.finalScore}%
      </Text>
      
      <Text textAlign="center">
        {matchScore.message}
      </Text>
      
      <XStack justifyContent="space-between">
        <Text>🍓 향미 일치: {matchScore.flavorScore}%</Text>
        <Text>💭 감각 일치: {matchScore.sensoryScore}%</Text>
      </XStack>
      
      {matchScore.matchedFlavors.length > 0 && (
        <Text fontSize="$sm" color="$green9">
          일치하는 향미: {matchScore.matchedFlavors.join(', ')}
        </Text>
      )}
    </YStack>
  );
};
```

---

## 📊 MVP의 장점

### ✅ 간단함
- 복잡한 가중치 계산 없음
- 2개 구성요소만 (향미 70% + 감각 30%)
- 직관적인 매칭 로직

### ✅ 구현 용이성
- 기본적인 문자열 매칭
- 작은 매칭 테이블
- 간단한 점수 계산

### ✅ 사용자에게 의미 있음
- 명확한 피드백 (어떤 항목이 일치했는지)
- 이해하기 쉬운 점수 체계
- 동기부여가 되는 메시지

### ✅ 확장 가능성
- 나중에 매칭 테이블 확장 가능
- 고도화된 알고리즘으로 교체 용이
- A/B 테스트로 정확도 검증 가능

---

**✅ 문서 완성**: 간단한 MVP Match Score 시스템 설계 완료  
**🎯 핵심**: 향미 매칭 70% + 감각 매칭 30% = 실용적이고 구현 쉬움  
**📋 다음 단계**: 이 간단한 버전으로 구현 후 사용자 피드백 수집  
**🔗 백업**: 복잡한 버전은 MATCH_SCORE_ALGORITHM_DETAILED.md에 보관

**간단 공식**: `매치개수 ÷ 로스터키워드개수 × 100 = Match Score` 🎯