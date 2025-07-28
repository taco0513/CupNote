# ExperimentalDataScreen - 실험 데이터 입력 화면

> Lab 모드 전용 과학적 측정 데이터와 실험 조건을 기록하는 화면

## 📱 화면 개요

**구현 파일**: `[screens]/enhanced/ExperimentalDataScreen`  
**역할**: 과학적 커피 분석을 위한 실험 데이터 수집
**소요시간**: 1-2분
**진행률**: 38% (Lab 모드 전용)

## 🎯 기능 정의

### 기술적 목표
- Lab 모드 전용 과학적 측정 데이터 수집
- 정량적 커피 분석을 위한 데이터 구조
- 전문가 수준의 정밀 측정 지원

### 핵심 기능
- **정량적 측정**: TDS, 추출 수율 등 수치 데이터
- **실험 데이터 관리**: 변수별 결과 비교 분석
- **재현성 지원**: 표준화된 실험 조건 기록

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (38%) + "실험 데이터"
├── 측정값 섹션
│   ├── TDS (Total Dissolved Solids)
│   │   ├── 입력: 숫자 (1.0-2.5%)
│   │   └── 도구: 측정 기기 선택 옵션
│   ├── 추출 수율 (Extraction Yield)
│   │   ├── 입력: 숫자 (18-25%)
│   │   └── 자동 계산: TDS 기반 계산 옵션
│   └── 측정 시간
│       └── 현재 시간 자동 기록
├── 실험 조건 섹션
│   ├── 그라인드 설정
│   │   ├── 분쇄도 (1-10 스케일)
│   │   └── 그라인더 모델 (선택)
│   ├── 추출 변수
│   │   ├── 물 온도 (°C)
│   │   ├── 추출 시간 (초)
│   │   ├── 원두량 (g)
│   │   └── 물량 (ml)
│   └── 환경 조건
│       ├── 실내 온도 (°C)
│       ├── 습도 (%)
│       └── 기압 (hPa) - 선택
├── 실험 메모 섹션
│   ├── 실험 목적
│   ├── 변경된 변수
│   └── 기타 관찰사항
└── Footer: "다음" Button
```

### 디자인 원칙
- **과학적 정확성**: 정밀한 수치 입력 지원
- **단위 명시**: 모든 측정값에 단위 표시
- **자동 계산**: 관련 수치 자동 계산 제공
- **선택적 입력**: 필수/선택 데이터 구분

## 💾 데이터 처리

### 입력 데이터
```typescript
interface CoffeeInfo {
  // 이전 화면에서 전달
  cafe_name: string;
  coffee_name: string;
  // ... 기타 기본 정보
}
```

### 출력 데이터
```typescript
interface ExperimentalData {
  // 측정값
  measurements: {
    tds?: number;                    // TDS (%)
    extraction_yield?: number;       // 추출 수율 (%)
    measurement_time?: Date;         // 측정 시간
    measurement_device?: string;     // 측정 기기
  };
  
  // 실험 조건
  experimental_conditions: {
    // 그라인드
    grind_setting?: number;          // 분쇄도 (1-10)
    grinder_model?: string;          // 그라인더 모델
    
    // 추출 변수
    water_temp?: number;             // 물 온도 (°C)
    brew_time?: number;              // 추출 시간 (초)
    coffee_amount?: number;          // 원두량 (g)
    water_amount?: number;           // 물량 (ml)
    
    // 환경 조건
    room_temp?: number;              // 실내 온도 (°C)
    humidity?: number;               // 습도 (%)
    atmospheric_pressure?: number;   // 기압 (hPa)
  };
  
  // 실험 메모
  experiment_notes: {
    purpose?: string;                // 실험 목적
    variables_changed?: string;      // 변경된 변수
    observations?: string;           // 기타 관찰사항
  };
  
  // 메타데이터
  recorded_at: Date;
  lab_session_id?: string;          // 실험 세션 ID
}
```

### 계산 로직
```typescript
// 추출 수율 자동 계산
const calculateExtractionYield = (
  tds: number, 
  waterAmount: number, 
  coffeeAmount: number
): number => {
  return (tds * waterAmount) / coffeeAmount;
};

// 농도비 계산
const calculateRatio = (coffeeAmount: number, waterAmount: number): string => {
  const ratio = waterAmount / coffeeAmount;
  return `1:${ratio.toFixed(1)}`;
};
```

## 🔄 사용자 인터랙션

### 주요 액션
1. **측정값 입력**: TDS, 추출 수율 등 정밀 수치 입력
2. **자동 계산**: TDS 입력 시 추출 수율 자동 계산
3. **조건 기록**: 그라인드, 추출 변수 상세 입력
4. **메모 작성**: 실험 목적과 관찰사항 텍스트 입력
5. **데이터 검증**: 입력값 범위 검증

### 인터랙션 플로우
```
측정값 입력 → 자동 계산 확인 → 실험 조건 기록 → 메모 작성 → 다음 화면
```

### 유효성 검증
- **TDS 범위**: 0.5-3.0% (일반적 범위)
- **추출 수율**: 15-30% (이론적 범위)
- **온도 범위**: 80-100°C (추출 온도)
- **시간 범위**: 30-600초 (추출 시간)

## 📊 측정 기기 지원

### 지원 TDS 미터
```typescript
enum TDSMeter {
  ATAGO_PAL3 = 'ATAGO PAL-3',
  VST_REFRACTOMETER = 'VST Coffee Refractometer',
  HANNA_HI96801 = 'Hanna HI96801',
  MILWAUKEE_MA887 = 'Milwaukee MA887',
  GENERIC_TDS = 'Generic TDS Meter',
  MANUAL_CALCULATION = 'Manual Calculation'
}
```

### 자동 계산 기능
- **추출 수율**: TDS 기반 자동 계산
- **농도비**: 원두량/물량 기반 비율 계산
- **EBV(Effective Bean Volume)**: 고급 계산 (Phase 2)

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **PrecisionInput**: 소수점 정밀 입력 필드
- **UnitDisplay**: 단위 표시 라벨
- **AutoCalculator**: 자동 계산 결과 표시
- **RangeValidator**: 입력값 범위 검증 표시
- **ExperimentTimer**: 실시간 측정 시간 기록

### Tamagui 스타일링
```typescript
const MeasurementCard = styled(Card, {
  padding: '$md',
  marginVertical: '$xs',
  backgroundColor: '$background',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const PrecisionInput = styled(Input, {
  textAlign: 'right',
  fontVariant: ['tabular-nums'],
  fontSize: '$4',
  color: '$color',
});
```

## 📱 반응형 고려사항

### 숫자 입력 최적화
- **키보드 타입**: 숫자 패드 자동 표시
- **소수점 처리**: 정확한 소수점 입력 지원
- **단위 변환**: 다양한 단위 간 변환 지원

### 화면 크기별 대응
- **작은 화면**: 섹션별 접기/펼치기
- **큰 화면**: 2열 배치로 효율성 증대
- **가로모드**: 계산기 스타일 레이아웃

## 🔗 네비게이션

### 이전 화면
- **CoffeeInfoScreen**: 커피 기본 정보 입력 완료

### 다음 화면
- **UnifiedFlavorScreen**: 향미 선택 화면

### 조건부 접근
- Lab 모드에서만 접근 가능
- 다른 모드에서는 건너뛰기

## 📈 성능 최적화

### 계산 최적화
```typescript
// 메모이제이션을 통한 계산 최적화
const memoizedCalculations = useMemo(() => ({
  extractionYield: calculateExtractionYield(tds, waterAmount, coffeeAmount),
  ratio: calculateRatio(coffeeAmount, waterAmount),
  strength: calculateStrength(tds)
}), [tds, waterAmount, coffeeAmount]);
```

### 데이터 검증
- **실시간 검증**: 입력 시 즉시 범위 체크
- **시각적 피드백**: 유효/무효 상태 색상 표시

## 🧪 테스트 시나리오

### 기능 테스트
1. **자동 계산**: TDS 입력 시 추출 수율 정확 계산
2. **범위 검증**: 비정상 값 입력 시 경고 표시
3. **데이터 저장**: 모든 입력값 정확한 저장
4. **단위 표시**: 모든 수치에 올바른 단위 표시

### 정확성 테스트
1. **계산 정확도**: 수동 계산과 자동 계산 결과 일치
2. **소수점 처리**: 정밀한 소수점 입력/표시
3. **데이터 무결성**: 입력-저장-표시 일관성

### 사용성 테스트
1. **전문가 워크플로우**: 바리스타/큐퍼 실제 사용 시나리오
2. **측정 도구 연동**: 다양한 TDS 미터 사용 환경
3. **반복 실험**: 연속 실험 시 효율성

## 🚀 확장 가능성

### Phase 2 개선사항
- **기기 연동**: Bluetooth TDS 미터 자동 데이터 수신
- **실험 템플릿**: 표준 실험 프로토콜 제공
- **데이터 시각화**: 실시간 그래프 표시

### Phase 3 고급 기능
- **AI 분석**: 실험 데이터 패턴 분석
- **품질 예측**: 조건 기반 맛 품질 예측
- **프로토콜 공유**: 전문가 실험 방법 공유

## 🎯 전문가 특화 기능

### 큐핑 프로토콜 지원
- **SCA 표준**: Specialty Coffee Association 프로토콜 준수
- **COE 방식**: Cup of Excellence 심사 기준 지원
- **연구 목적**: 학술/연구 목적 데이터 수집

### 비즈니스 연동
- **QC 시스템**: 품질 관리 시스템 연동 가능
- **로스터리 대시보드**: B2B 서비스 연동
- **데이터 내보내기**: 분석 도구 연동

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: COFFEE_INFO_SCREEN.md, SENSORY_SLIDER_SCREEN.md  
**구현 상태**: ✅ 완료 (Lab 모드 전용)