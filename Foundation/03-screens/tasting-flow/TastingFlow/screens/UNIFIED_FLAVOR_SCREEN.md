# UnifiedFlavorScreen - 향미 선택 화면

> 모든 TastingFlow 모드의 공통 향미 선택 화면, 커피의 기본 맛 프로필 정의

## 📱 화면 개요

**구현 파일**: `[screens]/tasting/flavor/UnifiedFlavorScreen`  
**역할**: 커피의 기본 향미 프로필 선택 (최대 5개)
**소요시간**: 1-2분
**진행률**: 57% (모든 모드 공통)

## 🎯 기능 정의

### 기술적 목표
- 커피 향미 프로필 데이터 수집 및 구조화
- 사용자 취향 데이터 축적 시스템
- Match Score 계산을 위한 기본 데이터 제공

### 핵심 기능
- **시각적 선택 인터페이스**: 직관적 향미 선택 UI
- **제한된 선택 시스템**: 최대 5개 제한으로 UX 최적화
- **체계적 분류**: 6개 카테고리 기반 향미 데이터 구조

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (57%) + "향미 선택"
├── 안내 메시지
│   └── "느껴지는 향미를 최대 5개까지 선택해주세요"
├── 선택 카운터
│   └── "3/5 selected" 표시
├── 향미 카테고리 (6개 섹션)
│   ├── 🍓 Fruity (과일류)
│   │   └── Strawberry, Apple, Orange, Cherry, Blueberry...
│   ├── 🌰 Nutty (견과류)
│   │   └── Almond, Hazelnut, Walnut, Peanut...
│   ├── 🍫 Chocolate (초콜릿)
│   │   └── Dark Chocolate, Milk Chocolate, Cocoa...
│   ├── 🌿 Spicy (향신료)
│   │   └── Cinnamon, Vanilla, Clove, Cardamom...
│   ├── 🌸 Floral (꽃향)
│   │   └── Jasmine, Rose, Lavender, Bergamot...
│   └── 🌾 Other (기타)
│       └── Caramel, Honey, Tobacco, Earth...
├── 선택된 향미 프리뷰
│   └── 선택된 향미들의 가로 스크롤 목록
└── Footer: "다음" Button (1개 이상 선택 시 활성화)
```

### 디자인 원칙
- **카테고리 구분**: 색상과 아이콘으로 명확한 구분
- **선택 제한**: 최대 5개로 과도한 선택 방지
- **시각적 피드백**: 선택된 항목 하이라이트
- **진행 표시**: 선택 개수 실시간 표시

## 💾 데이터 처리

### 입력 데이터
```typescript
interface PreviousScreenData {
  // CoffeeInfoScreen 또는 HomeCafeScreen/ExperimentalDataScreen에서 전달
  coffee_info: CoffeeInfo;
  homecafe_data?: HomeCafeData;      // HomeCafe 모드만
  experimental_data?: ExperimentalData; // Lab 모드만
}
```

### 출력 데이터
```typescript
interface FlavorSelection {
  selected_flavors: FlavorNote[];     // 선택된 향미 목록 (최대 5개)
  selection_timestamp: Date;         // 선택 시간
  selection_duration: number;        // 선택에 걸린 시간 (초)
}

interface FlavorNote {
  id: string;                        // 향미 고유 ID
  name: string;                      // 향미 이름 (예: "Strawberry")
  category: FlavorCategory;          // 카테고리 (예: "Fruity")
  intensity?: number;                // 강도 (현재 미사용, Phase 2)
}

enum FlavorCategory {
  FRUITY = 'Fruity',
  NUTTY = 'Nutty', 
  CHOCOLATE = 'Chocolate',
  SPICY = 'Spicy',
  FLORAL = 'Floral',
  OTHER = 'Other'
}
```

### 향미 데이터베이스
```typescript
// 각 카테고리별 향미 목록 (총 60+ 향미)
const FLAVOR_DATABASE = {
  Fruity: [
    'Strawberry', 'Apple', 'Orange', 'Cherry', 'Blueberry', 
    'Grape', 'Lemon', 'Peach', 'Pineapple', 'Blackberry'
  ],
  Nutty: [
    'Almond', 'Hazelnut', 'Walnut', 'Peanut', 'Pecan',
    'Pistachio', 'Cashew', 'Brazil Nut'
  ],
  // ... 기타 카테고리
};
```

## 🔄 사용자 인터랙션

### 주요 액션
1. **향미 선택**: 터치로 향미 토글 (선택/해제)
2. **카테고리 네비게이션**: 상하 스크롤로 카테고리 이동
3. **선택 확인**: 하단 프리뷰에서 선택된 향미 확인
4. **선택 해제**: 선택된 향미 재터치로 해제
5. **진행**: 1개 이상 선택 시 다음 버튼 활성화

### 인터랙션 플로우
```
화면 진입 → 카테고리 탐색 → 향미 선택 (최대 5개) → 선택 확인 → 다음 화면
```

### 선택 제한 규칙
- **최소 선택**: 1개 이상 필수
- **최대 선택**: 5개까지 제한
- **중복 방지**: 동일 향미 중복 선택 불가
- **실시간 카운트**: 선택 개수 실시간 표시

## 📊 향미 분류 시스템

### 6대 카테고리 체계
전문 커피 업계 표준인 SCA Flavor Wheel 기반 단순화

#### 1. 🍓 Fruity (과일류) - 15개
- **밝은 산미**: Strawberry, Cherry, Orange, Lemon
- **열대 과일**: Pineapple, Mango, Passion Fruit
- **베리류**: Blueberry, Blackberry, Raspberry
- **기타**: Apple, Grape, Peach, Pear, Apricot, Kiwi

#### 2. 🌰 Nutty (견과류) - 8개
- **트리 넛**: Almond, Hazelnut, Walnut, Pecan
- **기타**: Peanut, Pistachio, Cashew, Brazil Nut

#### 3. 🍫 Chocolate (초콜릿) - 6개
- **초콜릿**: Dark Chocolate, Milk Chocolate, White Chocolate
- **카카오**: Cocoa, Cacao, Chocolate Powder

#### 4. 🌿 Spicy (향신료) - 12개
- **따뜻한 향신료**: Cinnamon, Vanilla, Clove, Nutmeg
- **허브**: Cardamom, Ginger, Black Pepper, Star Anise
- **기타**: Allspice, Bay Leaf, Thyme, Rosemary

#### 5. 🌸 Floral (꽃향) - 8개
- **꽃향**: Jasmine, Rose, Lavender, Hibiscus
- **시트러스 플로럴**: Bergamot, Orange Blossom, Lemon Verbena
- **기타**: Elderflower

#### 6. 🌾 Other (기타) - 15개
- **단맛**: Caramel, Honey, Maple Syrup, Brown Sugar
- **기타**: Tobacco, Earth, Wood, Wine, Tea, Coffee, Bread, Butter, Cream, Milk, Yogurt

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **FlavorCategorySection**: 카테고리별 향미 그룹
- **FlavorButton**: 개별 향미 선택 버튼
- **SelectionCounter**: 선택 개수 표시
- **SelectedFlavorsList**: 선택된 향미 프리뷰
- **CategoryIcon**: 카테고리별 이모지 아이콘

### Tamagui 스타일링
```typescript
const FlavorButton = styled(Button, {
  size: '$3',
  backgroundColor: '$gray3',
  color: '$gray12',
  borderRadius: '$2',
  margin: '$xs',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue',
        color: 'white',
        scale: 0.95,
      }
    }
  } as const,
  
  pressStyle: {
    scale: 0.98,
  },
  
  animation: 'quick',
});

const CategorySection = styled(YStack, {
  paddingVertical: '$md',
  paddingHorizontal: '$sm',
  marginBottom: '$sm',
});
```

## 📱 반응형 고려사항

### 버튼 레이아웃
- **작은 화면**: 2-3열 그리드 배치
- **큰 화면**: 4-5열 그리드로 효율성 증대
- **터치 영역**: 최소 44px 보장

### 스크롤 최적화
- **카테고리 네비게이션**: 부드러운 스크롤 애니메이션
- **선택 상태 유지**: 스크롤 중에도 선택 상태 보존
- **성능**: 60+ 향미 버튼의 효율적 렌더링

## 🔗 네비게이션

### 이전 화면 (모드별 분기)
- **Cafe Mode**: `CoffeeInfoScreen`
- **HomeCafe Mode**: `HomeCafeScreen` 
- **Lab Mode**: `ExperimentalDataScreen`

### 다음 화면 (모드별 분기)
- **Cafe/HomeCafe Mode**: `SensoryExpressionScreen` (한국어 감각 표현)
- **Lab Mode**: `SensorySliderScreen` (수치 평가 슬라이더)

### 네비게이션 로직
```typescript
const handleNext = () => {
  const { mode } = tastingStore;
  switch (mode) {
    case 'cafe':
    case 'home_cafe':
      navigation.navigate('SensoryExpression');
      break;
    case 'lab':
      navigation.navigate('SensorySlider');
      break;
  }
};
```

## 📈 성능 최적화

### 렌더링 최적화
```typescript
// 메모이제이션으로 불필요한 리렌더링 방지
const FlavorButton = React.memo(({ flavor, isSelected, onToggle }) => {
  return (
    <Button
      variant={isSelected ? "selected" : "default"}
      onPress={() => onToggle(flavor.id)}
    >
      {flavor.name}
    </Button>
  );
});

// 가상화 스크롤 (향후 60+ 항목 최적화)
const virtualizedFlavors = useMemo(() => 
  flavors.slice(visibleStart, visibleEnd), 
  [flavors, visibleStart, visibleEnd]
);
```

### 상태 관리 최적화
- **로컬 상태**: 선택 상태는 컴포넌트 로컬에서 관리
- **배치 업데이트**: 다음 버튼 클릭 시 한번에 저장
- **메모리 효율**: 불필요한 객체 생성 최소화

## 🧪 테스트 시나리오

### 기능 테스트
1. **선택 제한**: 5개 초과 선택 시 제한 동작
2. **중복 방지**: 동일 항목 중복 선택 불가
3. **상태 동기화**: 선택/해제 상태 정확한 반영
4. **진행 조건**: 1개 이상 선택 시 다음 버튼 활성화

### 사용성 테스트
1. **초보자**: 향미 이름만으로 적절한 선택 가능
2. **전문가**: 정확한 향미 구분을 통한 정밀 선택
3. **속도**: 평균 1-2분 내 선택 완료

### 성능 테스트
1. **렌더링**: 60+ 버튼 동시 렌더링 성능
2. **응답성**: 버튼 터치 후 150ms 이내 시각적 피드백
3. **메모리**: 장시간 사용 시 메모리 사용량 안정성

## 🚀 기술적 확장점

### 향후 개선사항
- **강도 측정**: 선택된 향미별 강도 스재일 (1-5) 추가
- **커스텀 향미**: 사용자 정의 향미 데이터베이스
- **추천 알고리즘**: 머신러닝 기반 향미 예측

### 고급 기능
- **2D 맵 인터페이스**: 좌표 기반 향미 선택 UI
- **시계열 데이터**: 추출 시간별 향미 변화 추적
- **비교 기능**: 다중 커피 향미 프로필 동시 분석

## 🎯 데이터 처리 및 분석

### Match Score 알고리즘
선택된 향미와 로스터 노트 간 일치도 계산 로직
```typescript
const calculateMatchScore = (
  selectedFlavors: FlavorNote[],
  roasterNotes: string
): number => {
  // 직접 일치, 카테고리 일치, 연관 일치 기반 점수 연산
  // 0-100% 스코어 반환 알고리즘
};
```

### 사용자 프로필 분석
- **선호도 분석**: 자주 선택하는 향미 카테고4리 패턴 추출
- **시계열 분석**: 시간에 따른 취향 변화 데이터 추적
- **추천 시스템**: 과거 선택 데이터 기반 커피 추천 알고리즘

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: SENSORY_EXPRESSION_SCREEN.md, SENSORY_SLIDER_SCREEN.md  
**구현 상태**: ✅ 완료