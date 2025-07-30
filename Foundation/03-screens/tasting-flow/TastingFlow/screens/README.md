# TastingFlow Screens - 개별 화면 문서

> TastingFlow 워크플로우를 구성하는 10개 개별 화면의 상세 기술 명세

## 📱 화면 구성 개요

TastingFlow는 총 **10개의 개별 화면**으로 구성되며, 사용자가 선택한 모드(Cafe/HomeCafe/Lab)에 따라 일부 화면이 조건부로 표시됩니다.

## 📂 화면별 문서

### 🔄 **공통 화면** (모든 모드)

#### 1. 시작 단계

- [`MODE_SELECTION_SCREEN.md`](MODE_SELECTION_SCREEN.md) - 테이스팅 모드 선택
- [`COFFEE_INFO_SCREEN.md`](COFFEE_INFO_SCREEN.md) - 커피 기본 정보 입력

#### 2. 향미 평가 단계

- [`UNIFIED_FLAVOR_SCREEN.md`](UNIFIED_FLAVOR_SCREEN.md) - 60+ 향미 선택 시스템
- [`SENSORY_EXPRESSION_SCREEN.md`](SENSORY_EXPRESSION_SCREEN.md) - 44개 한국어 감각 표현 ⭐

#### 3. 완료 단계

- [`PERSONAL_COMMENT_SCREEN.md`](PERSONAL_COMMENT_SCREEN.md) - 개인 코멘트 및 실험 노트
- [`ROASTER_NOTES_SCREEN.md`](ROASTER_NOTES_SCREEN.md) - Match Score 계산
- [`RESULT_SCREEN.md`](RESULT_SCREEN.md) - 종합 결과 및 저장

### ⚙️ **모드별 특화 화면**

#### HomeCafe & Lab 모드

- [`HOMECAFE_SCREEN.md`](HOMECAFE_SCREEN.md) - 드리퍼, 레시피, 다이얼 제어 시스템

#### Lab 모드 전용

- [`EXPERIMENTAL_DATA_SCREEN.md`](EXPERIMENTAL_DATA_SCREEN.md) - TDS, 수율 등 과학적 측정
- [`SENSORY_SLIDER_SCREEN.md`](SENSORY_SLIDER_SCREEN.md) - SCA 표준 6개 항목 수치 평가

## 🔄 모드별 화면 사용 패턴

### Cafe Mode (7단계)

```
ModeSelection → CoffeeInfo → UnifiedFlavor → SensoryExpression
→ PersonalComment → RoasterNotes → Result
```

**건너뛰는 화면**: HomeCafe, ExperimentalData, SensorySlider

### HomeCafe Mode (8단계)

```
ModeSelection → CoffeeInfo → HomeCafe → UnifiedFlavor → SensoryExpression
→ PersonalComment → RoasterNotes → Result
```

**건너뛰는 화면**: ExperimentalData, SensorySlider

### Lab Mode (9단계)

```
ModeSelection → CoffeeInfo → ExperimentalData → (HomeCafe) → UnifiedFlavor
→ SensorySlider → SensoryExpression → PersonalComment → RoasterNotes → Result
```

**모든 화면 사용**: 전문가급 완전한 워크플로우

## 📋 각 문서의 구성 요소

각 화면 문서는 다음과 같은 표준화된 구조를 가집니다:

### 1. **화면 개요**

- 위치 (파일 경로)
- 역할 및 목적
- 소요 시간
- 진행률

### 2. **기능 정의**

- 기술적 목표
- 핵심 기능
- 사용자 가치

### 3. **UI/UX 구조**

- 화면 레이아웃
- 컴포넌트 구성
- 디자인 원칙

### 4. **데이터 처리**

- 입력 데이터 인터페이스
- 출력 데이터 구조
- 검증 및 변환 로직

### 5. **사용자 인터랙션**

- 입력 방식
- 인터랙션 플로우
- 에러 처리

### 6. **기술 구현**

- TypeScript 인터페이스
- Tamagui 스타일링
- 상태 관리
- 네비게이션 로직

### 7. **테스트 시나리오**

- 기능 테스트
- 사용성 테스트
- 에러 케이스

## 🎯 개발 활용 가이드

### 화면별 구현 순서 (권장)

1. **기본 워크플로우**: ModeSelection → CoffeeInfo → UnifiedFlavor → SensoryExpression → PersonalComment → RoasterNotes → Result
2. **HomeCafe 확장**: HomeCafe 화면 추가
3. **Lab 모드 완성**: ExperimentalData, SensorySlider 추가

### 공통 컴포넌트 활용

```typescript
// 모든 화면에서 사용하는 공통 요소
- ProgressBar: 진행률 표시
- NavigationButtons: 이전/다음 버튼
- ValidationMessage: 입력 검증 메시지
- LoadingSpinner: 데이터 처리 중 표시
```

### 상태 관리 패턴

```typescript
// TastingStore를 통한 통합 상태 관리
const tastingStore = useTastingStore(state => ({
  currentStep: state.currentStep,
  tastingData: state.tastingData,
  updateStep: state.updateStep,
  saveData: state.saveData,
}))
```

## 🔧 기술적 고려사항

### 조건부 렌더링

- 모드에 따른 화면 표시/숨김 로직
- 필수/선택 필드 동적 처리
- 진행률 계산 조정

### 성능 최적화

- 사용하지 않는 모드 화면은 지연 로딩
- 메모이제이션을 통한 불필요한 재렌더링 방지
- 이미지 및 에셋 최적화

### 접근성 고려

- 화면 읽기 프로그램 지원
- 키보드 내비게이션
- 색상 대비 및 폰트 크기

---

## 🔗 관련 문서

- **워크플로우 문서**: [`../workflows/`](../workflows/) - 모드별 전체 플로우
- **상위 가이드**: [`../README.md`](../README.md) - TastingFlow 전체 개요

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**화면 개수**: 10개  
**구현 상태**: ✅ 문서화 완료
