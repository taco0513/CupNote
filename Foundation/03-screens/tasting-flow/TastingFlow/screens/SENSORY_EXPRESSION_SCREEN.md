# SensoryExpressionScreen - 한국어 감각 표현 화면

> 모든 TastingFlow 모드의 핵심 화면, 44개 한국어 감각 표현으로 커피의 주관적 경험 기록

## 📱 화면 개요

**구현 파일**: `[screens]/tasting/SensoryExpressionScreen`  
**역할**: 6개 카테고리 44개 한국어 감각 표현 선택 (CATA 방법론)
**소요시간**: 2-3분
**진행률**: Lab Mode 88% / Cafe&HomeCafe Mode 75%

## 🎯 기능 정의

### 기술적 목표
- 한국어 네이티브 감각 표현 데이터 수집 시스템
- 44개 한국어 표현의 체계적 분류 및 관리
- CATA(Check All That Apply) 메소드 기반 다중선택 UI

### 핵심 기능
- **직관적 표현 인터페이스**: 한국어 고유 표현 선택
- **체계적 데이터**: 6개 카테고리 × 7개 표현 = 44개 체계
- **다중선택 지원**: 카테고리별 최대 3개 선택 제한

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar + "감각 표현"
├── 안내 메시지
│   ├── "느껴지는 감각을 자유롭게 선택해주세요"
│   └── "각 카테고리에서 최대 3개까지 선택 가능"
├── 선택 카운터
│   └── "총 8개 선택됨 (카테고리별 현황)"
├── 6개 카테고리 탭/아코디언
│   ├── 🍋 산미 (Acidity) - 7개 표현
│   │   ├── ✓ 싱그러운  ✓ 발랄한  □ 톡 쏘는
│   │   ├── □ 상큼한   □ 과일 같은  □ 와인 같은  
│   │   └── □ 시트러스 같은
│   ├── 🍯 단맛 (Sweetness) - 7개 표현  
│   │   ├── □ 농밀한   ✓ 달콤한   □ 꿀 같은
│   │   ├── □ 캐러멜 같은  □ 설탕 같은  □ 당밀 같은
│   │   └── □ 메이플 시럽 같은
│   ├── 🌰 쓴맛 (Bitterness) - 7개 표현
│   │   ├── □ 스모키한  ✓ 카카오 같은  □ 허브 느낌의
│   │   ├── ✓ 고소한   □ 견과류 같은  □ 다크 초콜릿 같은
│   │   └── □ 로스티한
│   ├── 💧 바디 (Body) - 7개 표현
│   │   ├── ✓ 크리미한  □ 벨벳 같은  □ 묵직한
│   │   ├── □ 가벼운   □ 실키한   □ 오일리한
│   │   └── □ 물 같은
│   ├── 🌬️ 애프터 (Aftertaste) - 7개 표현
│   │   ├── ✓ 깔끔한   □ 길게 남는  □ 산뜻한
│   │   ├── □ 여운이 좋은  □ 드라이한  □ 달콤한 여운의
│   │   └── □ 복합적인
│   └── ⚖️ 밸런스 (Balance) - 7개 표현
│       ├── ✓ 조화로운  □ 부드러운  □ 자연스러운
│       ├── □ 복잡한   □ 단순한   □ 안정된
│       └── □ 역동적인
├── 선택된 표현 요약
│   └── 카테고리별 선택된 표현 가로 스크롤 리스트
└── Footer: "다음" Button
```

### 디자인 원칙
- **카테고리 구분**: 색상과 이모지로 명확한 시각적 구분
- **선택 제한**: 카테고리당 최대 3개로 집중도 향상
- **한국어 우선**: 모든 표현을 자연스러운 한국어로 구성
- **직관적 선택**: 체크박스 + 색상 변경으로 선택 상태 표시

## 💾 데이터 처리

### 입력 데이터
```typescript
interface PreviousScreenData {
  // 공통 데이터
  coffee_info: CoffeeInfo;
  selected_flavors: FlavorNote[];
  
  // 모드별 선택적 데이터
  homecafe_data?: HomeCafeData;           // HomeCafe 모드
  experimental_data?: ExperimentalData;   // Lab 모드  
  sensory_scores?: SensoryScores;         // Lab 모드 (슬라이더 이후)
}
```

### 출력 데이터
```typescript
interface SensoryExpressions {
  // 카테고리별 선택된 표현 (최대 3개씩)
  expressions: {
    acidity: KoreanExpression[];      // 산미 표현들
    sweetness: KoreanExpression[];    // 단맛 표현들  
    bitterness: KoreanExpression[];   // 쓴맛 표현들
    body: KoreanExpression[];         // 바디 표현들
    aftertaste: KoreanExpression[];   // 애프터 표현들
    balance: KoreanExpression[];      // 밸런스 표현들
  };
  
  // 통계 정보
  total_selected: number;             // 총 선택 개수
  categories_used: number;            // 사용된 카테고리 수
  selection_distribution: {           // 카테고리별 선택 분포
    [category: string]: number;
  };
  
  // 메타데이터
  selection_time: number;             // 선택 소요 시간 (초)
  selection_timestamp: Date;
  cata_method: 'korean_native';       // CATA 방법론 표시
}

interface KoreanExpression {
  id: string;                         // 고유 식별자
  korean_text: string;                // 한국어 표현 ("싱그러운")
  category: SensoryCategory;          // 카테고리
  english_equivalent?: string;        // 영어 대응어 (분석용)
  intensity_level?: number;           // 강도 (1-3, Phase 2)
}

enum SensoryCategory {
  ACIDITY = 'acidity',       // 산미
  SWEETNESS = 'sweetness',   // 단맛
  BITTERNESS = 'bitterness', // 쓴맛
  BODY = 'body',             // 바디
  AFTERTASTE = 'aftertaste', // 애프터
  BALANCE = 'balance'        // 밸런스
}
```

## 🇰🇷 한국어 감각 표현 시스템

### 설계 철학
- **SCA 표준 준수**: 국제 표준을 한국 문화에 맞게 적응
- **자연스러운 표현**: 일상 대화에서 사용하는 한국어 활용
- **CATA 방법론**: Check All That Apply - 다중 선택 허용

### 6개 카테고리 × 7개 표현 = 44개 체계

#### 🍋 산미 (Acidity) - 7개
```
싱그러운      발랄한      톡 쏘는      상큼한
과일 같은     와인 같은    시트러스 같은
```
- **특징**: 밝고 생동감 있는 산미 표현
- **문화적 적응**: "톡 쏘는", "발랄한" 등 한국인 친숙 표현

#### 🍯 단맛 (Sweetness) - 7개  
```
농밀한       달콤한      꿀 같은      캐러멜 같은
설탕 같은    당밀 같은    메이플 시럽 같은
```
- **특징**: 자연스러운 단맛부터 구체적 단맛까지
- **문화적 적응**: "농밀한" 등 한국어 고유 표현 활용

#### 🌰 쓴맛 (Bitterness) - 7개
```
스모키한     카카오 같은   허브 느낌의   고소한
견과류 같은   다크 초콜릿 같은   로스티한
```
- **특징**: 부정적이지 않은 긍정적 쓴맛 표현
- **문화적 적응**: "고소한" 등 한국인 선호 표현

#### 💧 바디 (Body) - 7개  
```
크리미한     벨벳 같은    묵직한      가벼운
실키한      오일리한     물 같은
```
- **특징**: 질감과 무게감의 다양한 스펙트럼
- **문화적 적응**: "묵직한", "물 같은" 등 직관적 표현

#### 🌬️ 애프터 (Aftertaste) - 7개
```
깔끔한      길게 남는    산뜻한      여운이 좋은
드라이한    달콤한 여운의  복합적인
```
- **특징**: 여운의 길이, 품질, 특성 표현
- **문화적 적응**: "깔끔한", "여운이 좋은" 등 자연스러운 표현

#### ⚖️ 밸런스 (Balance) - 7개
```
조화로운     부드러운     자연스러운   복잡한
단순한      안정된      역동적인
```
- **특징**: 전체적인 균형감과 조화 표현
- **문화적 적응**: "조화로운", "자연스러운" 등 한국적 가치 반영

## 🔄 사용자 인터랙션

### 주요 액션
1. **카테고리 네비게이션**: 탭 또는 아코디언으로 카테고리 이동
2. **표현 선택**: 터치로 표현 토글 (최대 3개/카테고리)
3. **실시간 카운트**: 선택 개수 실시간 확인
4. **선택 해제**: 선택된 표현 재터치로 해제
5. **전체 요약**: 선택된 모든 표현 한눈에 확인

### 인터랙션 플로우
```
카테고리 탐색 → 표현 선택 (최대 3개/카테고리) → 다른 카테고리 이동 → 최종 확인 → 다음 화면
```

### 선택 규칙
- **카테고리당 최대 3개**: 집중력 유지, 명확한 표현
- **최소 선택 없음**: 느끼지 못한 특성은 선택하지 않아도 됨
- **실시간 제한**: 3개 선택 시 나머지 항목 비활성화
- **시각적 피드백**: 선택된 항목 색상 및 체크마크 표시

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **CategoryTab**: 6개 카테고리 탭 네비게이션
- **ExpressionButton**: 개별 감각 표현 선택 버튼
- **SelectionCounter**: 카테고리별/전체 선택 개수 표시  
- **ExpressionSummary**: 선택된 표현들의 요약 표시
- **CategoryIcon**: 카테고리별 이모지 아이콘

### Tamagui 스타일링
```typescript
const ExpressionButton = styled(Button, {
  size: '$3',
  backgroundColor: '$gray3',
  color: '$gray12',
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: '$borderColor',
  margin: '$xs',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue', 
        color: 'white',
        borderColor: '$cupBlue',
        scale: 0.98,
      }
    },
    disabled: {
      true: {
        backgroundColor: '$gray1',
        color: '$gray8',
        opacity: 0.5,
      }
    }
  } as const,
  
  pressStyle: {
    scale: 0.98,
  },
  
  animation: 'quick',
});

const CategorySection = styled(YStack, {
  padding: '$md',
  backgroundColor: '$background',
  borderRadius: '$3',
  marginBottom: '$sm',
});
```

### 카테고리별 색상 시스템
```typescript
const CATEGORY_COLORS = {
  acidity: '$green9',      // 싱그러운 녹색
  sweetness: '$orange9',   // 달콤한 오렌지
  bitterness: '$brown9',   // 쓴맛 브라운
  body: '$blue9',          // 바디 블루
  aftertaste: '$purple9',  // 애프터 퍼플
  balance: '$gold9'        // 밸런스 골드
};
```

## 📱 반응형 고려사항

### 표현 버튼 레이아웃
- **작은 화면**: 2-3열 그리드, 스크롤 지원
- **큰 화면**: 3-4열로 한 번에 더 많이 표시
- **터치 최적화**: 최소 44px 터치 영역, 8px 간격

### 카테고리 네비게이션
- **탭 방식**: 상단 6개 탭으로 빠른 이동
- **아코디언 방식**: 세로 스크롤로 모든 카테고리 표시
- **하이브리드**: 화면 크기에 따른 자동 전환

## 🔗 네비게이션

### 이전 화면 (모드별 분기)
- **Cafe/HomeCafe Mode**: `UnifiedFlavorScreen`
- **Lab Mode**: `SensorySliderScreen`

### 다음 화면 (모든 모드 공통)
- **PersonalCommentScreen**: 개인 코멘트 입력

### 네비게이션 로직
모든 모드에서 동일하게 다음 화면으로 이동

## 📈 성능 최적화

### 렌더링 최적화
```typescript
// 카테고리별 메모이제이션
const CategoryExpressions = React.memo(({ 
  category, 
  expressions, 
  selectedExpressions, 
  onToggle,
  maxReached 
}) => {
  return (
    <YStack>
      {expressions.map(expression => (
        <ExpressionButton
          key={expression.id}
          expression={expression}
          isSelected={selectedExpressions.includes(expression.id)}
          onToggle={onToggle}
          disabled={maxReached && !selectedExpressions.includes(expression.id)}
        />
      ))}
    </YStack>
  );
});

// 선택 상태 최적화
const useOptimizedSelection = () => {
  const [selections, setSelections] = useState({});
  
  const toggleExpression = useCallback((categoryId, expressionId) => {
    setSelections(prev => {
      const categorySelections = prev[categoryId] || [];
      const isSelected = categorySelections.includes(expressionId);
      
      if (isSelected) {
        // 선택 해제
        return {
          ...prev,
          [categoryId]: categorySelections.filter(id => id !== expressionId)
        };
      } else if (categorySelections.length < 3) {
        // 새로 선택 (3개 제한)
        return {
          ...prev,
          [categoryId]: [...categorySelections, expressionId]
        };
      }
      
      return prev; // 3개 초과 시 변경 없음
    });
  }, []);
  
  return { selections, toggleExpression };
};
```

### 상태 관리 최적화
- **카테고리별 독립성**: 각 카테고리 선택이 다른 카테고리에 영향 없음
- **실시간 검증**: 3개 제한 실시간 적용
- **배치 저장**: 다음 버튼 클릭 시 한번에 저장

## 🧪 테스트 시나리오

### 기능 테스트
1. **선택 제한**: 카테고리당 3개 초과 선택 시 제한 동작
2. **중복 방지**: 동일 표현 중복 선택 불가
3. **상태 동기화**: 선택/해제 상태 정확한 반영
4. **카테고리 독립성**: 각 카테고리 선택이 다른 카테고리에 영향 없음

### 문화적 적합성 테스트
1. **표현 이해도**: 한국인 사용자의 표현 이해 정도
2. **자연스러움**: 일상 대화에서 사용하는 표현과의 일치도
3. **정확성**: 실제 커피 특성과 표현의 일치도

### 사용성 테스트
1. **초보자**: 커피 용어 모르는 사용자도 쉬운 선택
2. **전문가**: 정확한 표현을 통한 정밀한 기록  
3. **일관성**: 동일 커피 재평가 시 유사한 선택 패턴

## 🚀 확장 가능성

### Phase 2 개선사항
- **강도 설정**: 선택된 표현별 강도 설정 (1-3)
- **개인 표현**: 사용자 정의 감각 표현 추가
- **AI 추천**: 향미 선택 기반 감각 표현 추천

### Phase 3 고급 기능
- **지역별 표현**: 경상도, 전라도 등 지역별 표현 차이 반영
- **세대별 표현**: 연령대별 친숙한 표현 제공
- **감정 연결**: 감각 표현과 감정 연결 분석

## 🎯 차별화 가치

### 시장 차별화
- **국내 유일**: 한국어 네이티브 감각 표현 시스템
- **문화적 우월성**: 영어 번역보다 자연스러운 한국어 원생 표현
- **진입장벽 해소**: 전문 용어 없이도 정확한 표현 가능

### 데이터 가치
- **개인 취향 프로필**: 한국인 특유의 감각 표현 패턴 분석
- **문화적 인사이트**: 한국인의 커피 감각 표현 데이터베이스 구축
- **비즈니스 연동**: 로스터리, 카페 한국인 고객 맞춤 데이터 제공

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: SENSORY_SLIDER_SCREEN.md, PERSONAL_COMMENT_SCREEN.md, KOREAN_SENSORY_SYSTEM.md  
**구현 상태**: ✅ 완료 (핵심 차별화 기능)