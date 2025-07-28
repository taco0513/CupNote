# SensorySliderScreen - 수치 평가 화면 (Lab 모드 전용)

> Lab 모드 전용 6개 항목 수치 슬라이더 평가 화면, 과학적 커피 분석을 위한 정량적 데이터 수집

## 📱 화면 개요

**구현 파일**: `[screens]/enhanced/SensorySliderScreen`  
**역할**: 6개 감각 항목의 정량적 평가 (1-5 스케일)
**소요시간**: 2-3분
**진행률**: 75% (Lab 모드 전용)

## 🎯 기능 정의

### 기술적 목표
- Lab 모드 전용 정량적 센서리 평가 시스템
- 1-5 스케일 기반 수치 데이터 수집
- 표준화된 평가 기준을 통한 일관성 확보

### 핵심 기능
- **정밀 스케일**: 1-5 범위 0.5 단위 조정 가능
- **표준화**: 국제 표준 큐핑 기준 준수
- **데이터 비교**: 수치 데이터 기반 객관적 분석

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (75%) + "수치 평가"
├── 안내 메시지
│   └── "각 항목을 1-5 스케일로 평가해주세요"
├── 평가 항목 (6개 슬라이더)
│   ├── 1️⃣ Body (바디감)
│   │   ├── 슬라이더: 1(가벼움) ←→ 5(묵직함)
│   │   ├── 현재값: 3.5 표시
│   │   └── 설명: "커피의 무게감과 질감"
│   ├── 2️⃣ Acidity (산미)
│   │   ├── 슬라이더: 1(약함) ←→ 5(강함)  
│   │   ├── 현재값: 4.0 표시
│   │   └── 설명: "밝고 상쾌한 산미의 강도"
│   ├── 3️⃣ Sweetness (단맛)
│   │   ├── 슬라이더: 1(약함) ←→ 5(강함)
│   │   ├── 현재값: 3.0 표시  
│   │   └── 설명: "자연스러운 단맛의 정도"
│   ├── 4️⃣ Finish (여운)
│   │   ├── 슬라이더: 1(짧음) ←→ 5(긺)
│   │   ├── 현재값: 3.5 표시
│   │   └── 설명: "맛이 지속되는 시간과 품질"
│   ├── 5️⃣ Bitterness (쓴맛)
│   │   ├── 슬라이더: 1(약함) ←→ 5(강함)
│   │   ├── 현재값: 2.5 표시
│   │   └── 설명: "쓴맛의 강도와 품질"
│   └── 6️⃣ Balance (밸런스)
│       ├── 슬라이더: 1(불균형) ←→ 5(완벽)
│       ├── 현재값: 4.0 표시
│       └── 설명: "전체적인 조화와 균형"
├── 추가 평가 (선택사항)
│   └── Texture 선택: Juicy/Soft/Round/Velvety
├── 평가 요약
│   ├── 총점: 20.5/30
│   ├── 평균: 3.4/5
│   └── 강점/약점 하이라이트
└── Footer: "다음" Button
```

### 디자인 원칙
- **명확한 스케일**: 1-5 숫자와 텍스트 설명 병행
- **시각적 피드백**: 슬라이더 값 실시간 표시
- **일관된 순서**: 표준 큐핑 평가 순서 준수
- **도움말 제공**: 각 항목별 명확한 설명

## 💾 데이터 처리

### 입력 데이터
```typescript
interface PreviousLabData {
  coffee_info: CoffeeInfo;
  experimental_data: ExperimentalData;
  selected_flavors: FlavorNote[];
}
```

### 출력 데이터
```typescript
interface SensoryScores {
  // 필수 6개 항목 (1-5 스케일)
  body: number;              // 바디감 (1: 가벼움 ~ 5: 묵직함)
  acidity: number;           // 산미 (1: 약함 ~ 5: 강함)
  sweetness: number;         // 단맛 (1: 약함 ~ 5: 강함) 
  finish: number;            // 여운 (1: 짧음 ~ 5: 긺)
  bitterness: number;        // 쓴맛 (1: 약함 ~ 5: 강함)
  balance: number;           // 밸런스 (1: 불균형 ~ 5: 완벽)
  
  // 선택 항목
  texture?: TextureType;     // 질감 선택
  
  // 계산 결과
  total_score: number;       // 총점 (6-30)
  average_score: number;     // 평균 (1-5)
  
  // 메타데이터
  evaluation_time: number;   // 평가 소요 시간 (초)
  evaluator_confidence: number; // 평가자 신뢰도 (1-5)
  evaluation_timestamp: Date;
}

enum TextureType {
  JUICY = 'Juicy',      // 과즙감
  SOFT = 'Soft',        // 부드러움
  ROUND = 'Round',      // 둥글둥글함
  VELVETY = 'Velvety'   // 벨벳감
}
```

### 기본값 설정
```typescript
const DEFAULT_SCORES = {
  body: 3.0,        // 중간값으로 시작
  acidity: 3.0,
  sweetness: 3.0,
  finish: 3.0,
  bitterness: 3.0,
  balance: 3.0,
  texture: undefined // 선택 안함
};
```

## 🔄 사용자 인터랙션

### 주요 액션
1. **슬라이더 조정**: 각 항목별 1-5 값 설정
2. **실시간 피드백**: 값 변경 시 즉시 시각적 반영
3. **질감 선택**: 4가지 텍스처 중 선택 (선택사항)
4. **요약 확인**: 총점/평균 자동 계산 확인
5. **신뢰도 설정**: 자신의 평가에 대한 확신 정도

### 인터랙션 플로우
```
항목별 평가 → 실시간 계산 확인 → 질감 선택 → 최종 검토 → 다음 화면
```

### 평가 가이드라인
각 항목별 1-5 스케일 기준:
- **1점**: 매우 약함/부족함
- **2점**: 약함/아쉬움  
- **3점**: 보통/적당함 (기본값)
- **4점**: 좋음/우수함
- **5점**: 매우 좋음/탁월함

## 📊 평가 항목 상세

### 1. Body (바디감) - 커피의 무게감과 질감
- **1점**: 물 같이 가벼움, 얇은 질감
- **3점**: 적당한 바디감, 표준적인 무게
- **5점**: 크리미하고 묵직한 바디감

### 2. Acidity (산미) - 밝고 상쾌한 산미의 강도  
- **1점**: 산미 거의 없음, 평면적
- **3점**: 적당한 산미, 균형감 있음
- **5점**: 강하고 생동감 있는 산미

### 3. Sweetness (단맛) - 자연스러운 단맛의 정도
- **1점**: 단맛 부족, 건조함
- **3점**: 은은한 자연 단맛
- **5점**: 풍부하고 지속적인 단맛

### 4. Finish (여운) - 맛이 지속되는 시간과 품질
- **1point**: 여운이 짧고 급격히 사라짐
- **3점**: 적당한 길이의 깔끔한 여운
- **5점**: 길고 복합적인 아름다운 여운

### 5. Bitterness (쓴맛) - 쓴맛의 강도와 품질
- **1점**: 쓴맛 거의 없음
- **3점**: 적당하고 균형잡힌 쓴맛
- **5점**: 강하지만 불쾌하지 않은 쓴맛

### 6. Balance (밸런스) - 전체적인 조화와 균형
- **1점**: 특정 요소가 과도하게 강함
- **3점**: 무난한 균형감
- **5점**: 모든 요소가 완벽하게 조화

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **SensorySlider**: 1-5 스케일 슬라이더 컴포넌트
- **ScoreDisplay**: 현재 값 표시 (숫자 + 바)
- **TextureSelector**: 4가지 질감 선택 컴포넌트
- **EvaluationSummary**: 총점/평균 요약 표시
- **ConfidenceRating**: 평가 신뢰도 입력

### Tamagui 스타일링
```typescript
const SliderContainer = styled(YStack, {
  paddingVertical: '$md',
  paddingHorizontal: '$sm',
  marginBottom: '$sm',
  backgroundColor: '$background',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const ScoreDisplay = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$xs',
});

const SliderTrack = styled(View, {
  height: 6,
  backgroundColor: '$gray5',
  borderRadius: '$2',
  flex: 1,
});

const SliderThumb = styled(View, {
  width: 24,
  height: 24,
  backgroundColor: '$cupBlue',
  borderRadius: '$6',
  elevation: 2,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
});
```

## 📱 반응형 고려사항

### 슬라이더 최적화
- **터치 영역**: 슬라이더 썸(thumb) 최소 44px
- **정밀도**: 0.5 단위 조정 가능
- **햅틱 피드백**: 값 변경 시 진동 피드백
- **접근성**: VoiceOver 지원

### 화면 크기별 대응
- **작은 화면**: 슬라이더 간격 축소, 스크롤 지원
- **큰 화면**: 2열 배치로 한 번에 더 많이 표시
- **가로모드**: 가로 배치로 공간 효율성 증대

## 🔗 네비게이션

### 이전 화면
- **UnifiedFlavorScreen**: 향미 선택 완료 (Lab 모드만)

### 다음 화면  
- **SensoryExpressionScreen**: 한국어 감각 표현 선택

### Lab 모드 전용 흐름
```
ExperimentalData → UnifiedFlavor → SensorySlider → SensoryExpression → ...
```

## 📈 성능 최적화

### 슬라이더 최적화
```typescript
// 디바운싱으로 과도한 업데이트 방지
const debouncedScoreUpdate = useMemo(
  () => debounce((item: string, value: number) => {
    updateScore(item, value);
  }, 150),
  []
);

// 메모이제이션으로 불필요한 계산 방지
const calculatedSummary = useMemo(() => ({
  total: Object.values(scores).reduce((sum, score) => sum + score, 0),
  average: Object.values(scores).reduce((sum, score) => sum + score, 0) / 6,
  highlight: getHighlights(scores)
}), [scores]);
```

### 상태 관리
- **로컬 상태**: 슬라이더 값은 컴포넌트 로컬에서 관리
- **배치 업데이트**: 다음 버튼 클릭 시 한번에 저장
- **실시간 계산**: 총점/평균은 실시간 계산

## 🧪 테스트 시나리오

### 기능 테스트
1. **슬라이더 동작**: 각 슬라이더 정확한 값 반영
2. **실시간 계산**: 값 변경 시 총점/평균 즉시 업데이트
3. **질감 선택**: 4가지 옵션 정확한 선택/해제
4. **데이터 저장**: 모든 평가 값 정확한 저장

### 정확성 테스트
1. **스케일 일관성**: 1-5 범위 내 정확한 값
2. **계산 정확도**: 총점/평균 계산 정확성
3. **소수점 처리**: 0.5 단위 정밀도 유지

### 사용성 테스트
1. **전문가 워크플로우**: 바리스타/큐퍼 실제 사용 패턴
2. **일관성**: 동일 커피 재평가 시 일관된 결과
3. **속도**: 6개 항목 평가 2-3분 내 완료

## 🚀 확장 가능성

### Phase 2 개선사항
- **평가 템플릿**: 표준 큐핑 양식 제공
- **비교 모드**: 여러 커피 동시 평가
- **자동 분석**: 점수 패턴 기반 자동 코멘트

### Phase 3 고급 기능
- **AI 보정**: 개인 편향 보정 기능
- **전문가 캘리브레이션**: 표준 샘플로 평가 기준 보정
- **팀 평가**: 여러 평가자 결과 통합

## 🎯 전문가 도구로서의 가치

### 큐핑 표준 준수
- **SCA 프로토콜**: Specialty Coffee Association 기준 준수
- **국제 표준**: 전세계 큐핑 평가와 호환 가능한 데이터
- **재현성**: 표준화된 평가로 일관된 결과

### 품질 관리 활용
- **QC 도구**: 로스터리 품질 관리 시스템 연동
- **배치 비교**: 동일 원두 로스팅 배치 간 비교
- **트렌드 분석**: 시간에 따른 품질 변화 추적

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: UNIFIED_FLAVOR_SCREEN.md, SENSORY_EXPRESSION_SCREEN.md  
**구현 상태**: ✅ 완료 (Lab 모드 전용)