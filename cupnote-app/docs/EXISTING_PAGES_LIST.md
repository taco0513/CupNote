# 📄 CupNote 현존하는 페이지 리스트

## 📋 개요

CupNote Vue.js 애플리케이션의 현재 페이지 구현 상태와 향후 개발 계획을 정리한 문서입니다.

**작성일**: 2025년 1월 29일  
**프로젝트**: CupNote Vue.js App  
**목적**: 페이지별 개발 현황 파악 및 우선순위 설정

---

## 🎯 구현 완료된 페이지

### 1. **OnboardingView** ✅ 완전 구현

```
📍 위치: /src/views/onboarding/OnboardingView.vue
🔗 라우터: 미등록 (직접 접근 불가)
📊 상태: 100% 완성
```

**주요 기능**:

- 4단계 온보딩 프로세스
- 테이스팅 모드 선택 (카페/홈카페/랩)
- 애니메이션 전환 효과
- Pinia 스토어 연동

**기술 스택**:

- Vue 3 Composition API
- Pinia Store (useTastingStore)
- Vue Router 연동
- 반응형 디자인

**프로토타입 매핑**: Screen 1 (Mode Selection)

---

## 🔧 교체/수정 필요한 페이지

### 2. **HomeView** 🔄 기본 Vue 템플릿

```
📍 위치: /src/views/HomeView.vue
🔗 라우터: / (루트 경로)
📊 상태: Vue CLI 기본 템플릿 (교체 필요)
```

**현재 상태**:

- Vue CLI 생성 시 기본 템플릿
- TheWelcome 컴포넌트 포함
- CupNote와 무관한 내용

**개선 방안**:

- **Option A**: 온보딩으로 리다이렉트하는 랜딩 페이지
- **Option B**: 테이스팅 히스토리 대시보드
- **Option C**: OnboardingView로 완전 교체

### 3. **AboutView** 🔄 기본 Vue 템플릿

```
📍 위치: /src/views/AboutView.vue
🔗 라우터: /about
📊 상태: 단순 텍스트 (교체 필요)
```

**현재 상태**:

- "This is an about page" 텍스트만 존재
- 기능적 의미 없음

**개선 방안**:

- **Option A**: CupNote 소개 및 사용법 페이지
- **Option B**: 설정 및 프로필 페이지
- **Option C**: 페이지 삭제

---

## 🏗️ 구현 예정인 페이지

### 4. **CoffeeSetupView** ⏳ 미구현

```
📍 위치: /src/views/coffee-setup/ (빈 디렉토리)
🔗 라우터: 미등록
📊 상태: 구현 예정
```

**계획된 기능**:

- 커피 정보 입력 (카페명, 커피명, 원산지 등)
- 브루 설정 (홈카페/랩 모드)
- 실험 데이터 입력 (랩 모드 전용)
- 단계별 진행 상태 표시

**프로토타입 매핑**:

- Screen 2: Coffee Info
- Screen 3: Brew Settings
- Screen 3.5: Lab Experimental Data

### 5. **TastingFlowView** ⏳ 미구현

```
📍 위치: /src/views/tasting-flow/ (빈 디렉토리)
🔗 라우터: 미등록
📊 상태: 구현 예정
```

**계획된 기능**:

- 4단계 테이스팅 플로우
  1. 향미 선택 (Flavor Selection)
  2. 감각 표현 (Sensory Expression)
  3. 개인 노트 (Personal Notes)
  4. 로스터 노트 (Roaster Notes)
- 단계 간 데이터 연동
- 동적 매치 스코어 계산

**프로토타입 매핑**:

- Screen 4: Flavor Selection
- Screen 5: Sensory Expression
- Screen 6: Personal Notes
- Screen 7: Roaster Notes

### 6. **ResultView** ⏳ 미구현

```
📍 위치: /src/views/result/ (빈 디렉토리)
🔗 라우터: 미등록
📊 상태: 구현 예정
```

**계획된 기능**:

- 매치 스코어 시각화
- 선택한 향미/감각 표현 요약
- 테이스팅 결과 저장
- 공유 기능
- 새로운 테이스팅 시작

**프로토타입 매핑**: Screen 8 (Result)

---

## 📊 페이지 현황 매트릭스

| 페이지명            | 구현 상태    | 라우터 등록 | Pinia 연동 | 프로토타입 매핑 | 우선순위  |
| ------------------- | ------------ | ----------- | ---------- | --------------- | --------- |
| **OnboardingView**  | ✅ 완성      | ⏳ 미등록   | ✅ 완료    | Screen 1        | 🔥 완료   |
| **HomeView**        | 🔧 교체 필요 | ✅ 등록     | ❌ 없음    | -               | 🟡 Medium |
| **AboutView**       | 🔧 교체 필요 | ✅ 등록     | ❌ 없음    | -               | 🟢 Low    |
| **CoffeeSetupView** | ⏳ 미구현    | ⏳ 미등록   | ⏳ 예정    | Screen 2-3.5    | 🔥 High   |
| **TastingFlowView** | ⏳ 미구현    | ⏳ 미등록   | ⏳ 예정    | Screen 4-7      | 🔥 High   |
| **ResultView**      | ⏳ 미구현    | ⏳ 미등록   | ⏳ 예정    | Screen 8        | 🔥 High   |

---

## 🗺️ 프로토타입 화면 매핑

### 📱 HTML 프로토타입 8개 화면 → Vue 페이지 구조

```
프로토타입                    →  Vue 페이지
├── Screen 1: Mode Selection  →  ✅ OnboardingView.vue
├── Screen 2: Coffee Info     →  ⏳ CoffeeSetupView.vue
├── Screen 3: Brew Settings   →  ⏳ CoffeeSetupView.vue (통합)
├── Screen 3.5: Lab Data      →  ⏳ CoffeeSetupView.vue (조건부)
├── Screen 4: Flavor Select   →  ⏳ TastingFlowView.vue (Step 1)
├── Screen 5: Sensory Expr    →  ⏳ TastingFlowView.vue (Step 2)
├── Screen 6: Personal Notes  →  ⏳ TastingFlowView.vue (Step 3)
├── Screen 7: Roaster Notes   →  ⏳ TastingFlowView.vue (Step 4)
└── Screen 8: Result          →  ⏳ ResultView.vue
```

### 🔄 구조 변경 사항

- **화면 통합**: Screen 2-3.5 → CoffeeSetupView 하나로 통합
- **플로우 재구성**: Screen 4-7 → TastingFlowView 내 4단계 진행
- **라우팅 최적화**: 페이지 간 상태 공유를 위한 중앙집중식 관리

---

## 🚀 개발 로드맵

### 🔥 Phase 1: 핵심 기능 (우선순위 높음)

**목표**: MVP 완성

- [ ] **CoffeeSetupView** 구현
  - 커피 정보 입력 폼
  - 모드별 조건부 UI
  - 데이터 검증 및 저장

- [ ] **TastingFlowView** 구현
  - 4단계 플로우 컴포넌트
  - 향미/감각 선택 인터페이스
  - 실시간 매치 스코어 계산

- [ ] **ResultView** 구현
  - 결과 시각화 차트
  - 테이스팅 요약 카드
  - 저장 및 공유 기능

### 🟡 Phase 2: 사용자 경험 개선 (중간 우선순위)

**목표**: UX 완성도 향상

- [ ] **HomeView** 재설계
  - 테이스팅 히스토리 대시보드
  - 빠른 시작 버튼
  - 통계 및 인사이트

- [ ] **라우터 설정** 완성
  - 모든 페이지에 대한 라우팅
  - 네비게이션 가드
  - 딥링크 지원

### 🟢 Phase 3: 부가 기능 (낮은 우선순위)

**목표**: 완성도 및 편의성

- [ ] **AboutView** 재설계
  - 앱 소개 및 가이드
  - 설정 페이지
  - 도움말 및 FAQ

- [ ] **추가 페이지** 검토
  - 설정 페이지
  - 프로필 페이지
  - 통계 페이지

---

## 🤝 논의가 필요한 사항

### 1. **HomeView 방향성**

- **현재**: Vue CLI 기본 템플릿
- **제안**: 테이스팅 히스토리 대시보드로 변경
- **대안**: OnboardingView로 리다이렉트

### 2. **TastingFlowView 라우팅 구조**

- **Single Page 방식**: `/tasting` 하나의 경로에서 4단계 진행
- **Multi Route 방식**: `/tasting/flavor`, `/tasting/sensory` 등으로 분리
- **권장**: Single Page (상태 관리 단순화)

### 3. **AboutView 필요성**

- **유지**: CupNote 소개 및 사용법
- **변경**: 설정 페이지로 전환
- **삭제**: 불필요한 페이지 제거

### 4. **개발 우선순위**

- **Phase 1 집중**: CoffeeSetupView → TastingFlowView → ResultView
- **병렬 개발**: 여러 페이지 동시 진행
- **순차 개발**: 하나씩 완성 후 다음 진행

---

## 📈 예상 개발 시간

| 페이지              | 예상 시간  | 복잡도 | 의존성                |
| ------------------- | ---------- | ------ | --------------------- |
| **CoffeeSetupView** | 16시간     | Medium | Pinia Store, Supabase |
| **TastingFlowView** | 24시간     | High   | Match Score, Supabase |
| **ResultView**      | 12시간     | Medium | Chart.js, 공유 API    |
| **HomeView 개선**   | 8시간      | Low    | Supabase 히스토리     |
| **라우터 설정**     | 4시간      | Low    | Vue Router            |
| **총 예상 시간**    | **64시간** | -      | -                     |

---

## 🎯 결론

### ✅ 현재 상태

- **OnboardingView**: 완전 구현 완료
- **기본 구조**: Supabase, Pinia, UI 컴포넌트 완성
- **개발 환경**: 모든 도구 및 설정 완료

### 🚀 다음 단계

1. **CoffeeSetupView** 구현 시작
2. **라우터 설정** 및 네비게이션 연결
3. **TastingFlowView** 단계별 구현
4. **ResultView** 및 데이터 시각화

### 💡 권장사항

**순차적 개발**을 통해 각 페이지의 완성도를 높이고, 페이지 간 데이터 플로우를 점진적으로 구축하는 것을 권장합니다.

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 1월 29일_  
_버전: 1.0_
