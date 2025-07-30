# TastingFlow Pages - 테이스팅 워크플로우 페이지별 문서

> CupNote의 핵심 테이스팅 워크플로우 10단계 + 3가지 모드별 워크플로우 문서

## 📱 TastingFlow 시스템 개요

**TastingFlow**는 CupNote의 핵심 기능으로, 사용자의 커피 테이스팅 경험을 체계적으로 기록하는 10단계 워크플로우입니다.

### 🔄 3-Tier 모드 시스템

- **Cafe Mode**: 7단계 (3-5분) - 카페 방문자용 간편 기록
- **HomeCafe Mode**: 8단계 (5-8분) - 레시피 실험 중심
- **Lab Mode**: 9단계 (8-12분) - 전문가급 큐핑 시스템

## 📂 문서 구조

### 🖥️ 개별 화면 문서 (10개)

- [`screens/`](screens/) - TastingFlow를 구성하는 10개 화면의 상세 기술 명세
  - 공통 화면: ModeSelection, CoffeeInfo, UnifiedFlavor, SensoryExpression, PersonalComment, RoasterNotes, Result
  - 특화 화면: HomeCafe (HomeCafe/Lab), ExperimentalData (Lab 전용), SensorySlider (Lab 전용)
  - [`screens/README.md`](screens/README.md) - 개별 화면 문서 가이드

### 🔄 모드별 워크플로우 문서 (3개)

- [`workflows/`](workflows/) - 3가지 테이스팅 모드의 단계별 워크플로우 명세
  - Cafe Mode: 7단계 간편 테이스팅 (3-5분)
  - HomeCafe Mode: 8단계 레시피 실험 (5-8분)
  - Lab Mode: 9단계 전문가 분석 (8-12분)
  - [`workflows/README.md`](workflows/README.md) - 워크플로우 시스템 가이드

## 🎯 사용 가이드

### 개발자를 위한 활용법

#### 1. 화면별 구현 시

```bash
# screens/ 폴더의 개별 화면 문서 참조
- UI/UX 구조: 화면 레이아웃과 컴포넌트 구성
- 데이터 인터페이스: TypeScript 인터페이스 정의
- 사용자 인터랙션: 입력 처리 및 검증 로직
- 네비게이션: 이전/다음 화면 조건부 이동
```

#### 2. 워크플로우 구현 시

```bash
# workflows/ 폴더의 모드별 워크플로우 문서 참조
- 화면 순서: 모드별 화면 표시/건너뛰기 로직
- 진행률 계산: 모드별 진행률 계산 함수
- 데이터 수집: 모드별 필수/선택 데이터 구분
- 성능 최적화: 모드별 특화 최적화 방안
```

#### 3. 테스트 시나리오

각 문서의 **테스트 시나리오** 섹션을 활용하여:

- 기능 테스트 케이스 작성
- 사용성 테스트 설계
- 에러 케이스 검증
- 성능 측정 기준점

## 🔧 핵심 기술 요소

### 1. 조건부 네비게이션

```typescript
// 모드에 따른 화면 건너뛰기 로직
const getNextScreen = (currentScreen: string, mode: TastingMode): string => {
  // 각 워크플로우 문서의 네비게이션 로직 구현
}
```

### 2. 상태 관리

- **통합 상태**: TastingStore를 통한 10단계 데이터 관리
- **모드별 데이터**: CafeModeData, HomeCafeModeData, LabModeData
- **실시간 계산**: Match Score, 통계, 진행률

### 3. 성능 최적화

- **지연 로딩**: 사용하지 않는 모드 컴포넌트 최적화
- **메모이제이션**: 불필요한 재렌더링 방지
- **캐시 활용**: 이전 입력 기록 재사용

## 📊 모드별 특성 비교

| 특성              | Cafe Mode | HomeCafe Mode | Lab Mode                     |
| ----------------- | --------- | ------------- | ---------------------------- |
| **소요시간**      | 3-5분     | 5-8분         | 8-12분                       |
| **화면 수**       | 7단계     | 8단계         | 9단계                        |
| **핵심 기능**     | 간편 기록 | 레시피 실험   | 전문 분석                    |
| **특화 화면**     | -         | HomeCafe      | Experimental + SensorySlider |
| **데이터 정밀도** | 기본      | 상세          | 전문가급                     |
| **대상 사용자**   | 입문자    | 홈카페족      | 전문가                       |

## 🎨 UI/UX 일관성

### Tamagui 디자인 시스템

모든 TastingFlow 화면은 통일된 디자인 시스템을 따릅니다:

```typescript
// 공통 스타일링 패턴
const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
  padding: '$md',
})

const ProgressHeader = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: '$sm',
})

const NextButton = styled(Button, {
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  minHeight: '$navBarHeight',
})
```

### 공통 컴포넌트

- **ProgressBar**: 모든 화면의 진행률 표시
- **NavigationButtons**: 이전/다음 버튼 통일
- **InputValidation**: 일관된 입력 검증 UI
- **ToastContainer**: 통일된 알림 시스템

## 📈 확장 가능성

### Phase 2 개선사항

각 문서에서 제시하는 확장 계획:

- **AI 코칭**: 개인화된 테이스팅 가이드
- **소셜 기능**: 테이스팅 기록 공유
- **고급 분석**: 시간별 취향 변화 추적

### Phase 3 전문 기능

- **블라인드 테이스팅**: 편향 없는 평가 모드
- **팀 큐핑**: 다중 사용자 협업 기능
- **전문가 인증**: 공식 자격증 연동

---

## 🔗 관련 문서

- **상위 문서**: [`../README.md`](../README.md) - Foundation 전체 개요
- **시스템 문서**: [`../features/TASTING_FLOW.md`](../features/TASTING_FLOW.md) - 전체 시스템 명세
- **데이터 모델**: [`../data/DATA_MODEL.md`](../data/DATA_MODEL.md) - TastingFlow 데이터 구조

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**문서 개수**: 15개 (개별 화면 10개 + 워크플로우 3개 + 가이드 2개)  
**폴더 구조**: screens/ + workflows/ 세분화 완료  
**구현 상태**: ✅ 완료
