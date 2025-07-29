# CupNote 파일 변경 추적 리스트

Lab Mode → Pro Mode 전환 및 새로운 기능 구현을 위한 파일 변경 추적 문서

## 📋 변경 개요

**주요 변경사항**:
1. Lab Mode → Pro Mode 리브랜딩
2. SCA 표준 통합
3. 모드별 속성 매핑 시스템
4. Pro Mode 감각 평가 확장
5. 새로운 화면 추가

## 🔄 파일 변경 유형

### 🆕 생성 (CREATE)
새로 만들어야 하는 파일들

#### 새로운 Vue 컴포넌트
- `/src/views/tasting-flow/ProBrewingView.vue` - Pro Mode 전용 추출 프로토콜
- `/src/views/tasting-flow/QcMeasurementView.vue` - TDS 측정 및 QC 데이터
- `/src/views/tasting-flow/ScaFlavorView.vue` - SCA Flavor Wheel 구현
- `/src/views/tasting-flow/ScaEvaluationView.vue` - SCA 관능 평가 (기존 SensorySliderView 대체)
- `/src/views/tasting-flow/ProQcReportView.vue` - Pro QC 리포트 생성

#### 새로운 스토어 모듈
- `/src/stores/auth.js` - 인증 시스템 (Supabase 연동)
- `/src/stores/proMode.js` - Pro Mode 전용 상태 관리

#### 새로운 유틸리티
- `/src/utils/scaCalculations.js` - SCA 표준 계산 로직
- `/src/utils/reportGenerator.js` - PDF/CSV 리포트 생성
- `/src/utils/modeMapping.js` - 모드별 속성 매핑 로직

#### 새로운 문서
- `/docs/modes/cafe-mode.md` ✅ 완료
- `/docs/modes/homecafe-mode.md` ✅ 완료
- `/docs/modes/pro-mode.md` ✅ 완료
- `/docs/file-changes-tracking.md` ✅ 완료 (현재 파일)

### ✏️ 수정 (MODIFY)
기존 파일의 내용을 변경해야 하는 파일들

#### 라우터 설정
- `/src/router/index.js`
  - Lab Mode → Pro Mode 경로 변경
  - 새로운 Pro Mode 화면들 라우팅 추가
  - 레거시 경로 리다이렉트 설정

#### 메인 스토어 업데이트
- `/src/stores/coffeeRecord.js`
  - Lab → Pro 리브랜딩
  - ProModeData 타입 추가
  - SCA 평가 데이터 구조 추가
  - 모드별 속성 매핑 로직

#### 기존 컴포넌트 업데이트
- `/src/views/tasting-flow/ModeSelectionView.vue`
  - "Lab Mode" → "Pro Mode" 리브랜딩
  - 아이콘, 설명, 색상 업데이트
  
- `/src/views/tasting-flow/CoffeeInfoView.vue`
  - Pro Mode일 때 Origin Details 확장 표시
  - 고도(altitude) 필드 표시 로직 수정

- `/src/views/tasting-flow/ExperimentalDataView.vue`
  - 파일명: `ExperimentalDataView.vue` → `ProBrewingView.vue`로 변경
  - SCA 표준 프로토콜 추가
  - 물 품질 측정 섹션 강화

- `/src/views/tasting-flow/SensorySliderView.vue`
  - 모드별 속성 매핑 시스템 구현
  - Pro Mode: SCA 표준 속성
  - 기존 모드: 기존 속성 유지
  - 조건부 렌더링 로직 추가

- `/src/views/tasting-flow/PersonalCommentView.vue`
  - Pro Mode 전용 전문가 태그 추가
  - 텍스트 제한 500자로 확장 (Pro Mode)

- `/src/views/tasting-flow/ResultView.vue`
  - Pro Mode QC 리포트 링크 추가
  - SCA 점수 표시
  - PDF 다운로드 기능

#### 기존 문서 업데이트
- `/docs/navigation-flow.md`
  - Lab Mode → Pro Mode 변경
  - 새로운 Pro Mode 플로우 반영
  - 진행률 재계산

- `/docs/user-flows.md`
  - Scenario 3: Lab Mode → Pro Mode 변경
  - Pro Mode 상세 플로우 업데이트
  - SCA 평가 과정 설명

- `/docs/tasting-flow-screens.md`
  - 모든 Lab Mode 참조 → Pro Mode 변경
  - 새로운 화면들 추가 설명

#### 프로젝트 설정
- `/package.json`
  - PDF 생성 라이브러리 추가 (jsPDF, html2canvas)
  - CSV 생성 라이브러리 추가

### 🗑️ 삭제 (DELETE)
제거해야 하는 파일들

#### 불필요한 파일
- 현재는 없음 (기존 파일들을 리네이밍하거나 수정하여 재사용)

## 📊 변경 통계

| 유형 | 개수 | 설명 |
|------|------|------|
| **생성** | 9개 | 새로운 Vue 컴포넌트, 스토어, 유틸리티 |
| **수정** | 12개 | 기존 컴포넌트, 문서, 설정 파일 |
| **삭제** | 0개 | 제거할 파일 없음 |
| **총합** | 21개 | 전체 변경 대상 파일 |

## 🗂️ 디렉토리 구조 변화

### 기존 구조
```
src/
├── views/tasting-flow/
│   ├── ModeSelectionView.vue
│   ├── CoffeeInfoView.vue  
│   ├── HomeCafeView.vue
│   ├── ExperimentalDataView.vue (Lab Mode)
│   ├── UnifiedFlavorView.vue
│   ├── SensoryExpressionView.vue
│   ├── SensorySliderView.vue (Lab Mode only)
│   ├── PersonalCommentView.vue
│   ├── RoasterNotesView.vue
│   └── ResultView.vue
├── stores/
│   └── coffeeRecord.js
└── docs/
    ├── navigation-flow.md
    ├── user-flows.md
    └── tasting-flow-screens.md
```

### 새로운 구조
```
src/
├── views/tasting-flow/
│   ├── ModeSelectionView.vue (업데이트)
│   ├── CoffeeInfoView.vue (업데이트)
│   ├── HomeCafeView.vue
│   ├── ProBrewingView.vue (새로 생성)
│   ├── QcMeasurementView.vue (새로 생성)
│   ├── UnifiedFlavorView.vue
│   ├── ScaFlavorView.vue (새로 생성)
│   ├── SensoryExpressionView.vue
│   ├── SensorySliderView.vue (업데이트 - 모드별 매핑)
│   ├── ScaEvaluationView.vue (새로 생성)
│   ├── PersonalCommentView.vue (업데이트)
│   ├── RoasterNotesView.vue
│   ├── ResultView.vue (업데이트)
│   └── ProQcReportView.vue (새로 생성)
├── stores/
│   ├── coffeeRecord.js (업데이트)
│   ├── auth.js (새로 생성)
│   └── proMode.js (새로 생성)
├── utils/
│   ├── scaCalculations.js (새로 생성)
│   ├── reportGenerator.js (새로 생성)
│   └── modeMapping.js (새로 생성)
└── docs/
    ├── navigation-flow.md (업데이트)
    ├── user-flows.md (업데이트)
    ├── tasting-flow-screens.md (업데이트)
    ├── modes/
    │   ├── cafe-mode.md (새로 생성) ✅
    │   ├── homecafe-mode.md (새로 생성) ✅
    │   └── pro-mode.md (새로 생성) ✅
    └── file-changes-tracking.md (새로 생성) ✅
```

## 🎯 우선순위별 구현 계획

### Phase 1: 기본 리브랜딩 (1주)
**우선순위: 높음**
1. Lab → Pro 용어 변경
2. ModeSelectionView 업데이트
3. 라우터 경로 변경
4. 기본 문서 업데이트

### Phase 2: 핵심 Pro Mode 기능 (2주)
**우선순위: 높음**
1. ProBrewingView 생성
2. QcMeasurementView 생성
3. SCA 계산 로직 구현
4. 모드별 속성 매핑 시스템

### Phase 3: SCA 표준 통합 (2주)
**우선순위: 중간**
1. ScaFlavorView 생성
2. ScaEvaluationView 생성
3. SensorySliderView 모드별 분기
4. SCA 표준 검증

### Phase 4: 고급 기능 (1주)
**우선순위: 낮음**
1. ProQcReportView 생성
2. PDF/CSV 리포트 기능
3. 인증 시스템 연동
4. 최종 테스트 및 문서화

## 🔍 검증 체크리스트

### 기능 검증
- [ ] Lab Mode → Pro Mode 완전 리브랜딩
- [ ] 기존 Cafe/HomeCafe Mode 정상 동작
- [ ] Pro Mode 새로운 플로우 완전 구현
- [ ] SCA 표준 계산 정확성 검증
- [ ] 모드별 속성 매핑 정상 동작

### 데이터 검증
- [ ] 기존 데이터와 새 데이터 구조 호환성
- [ ] 모드별 데이터 분리 정상 동작
- [ ] SCA 평가 데이터 무결성
- [ ] 리포트 생성 정확성

### UI/UX 검증
- [ ] 모든 화면 반응형 디자인
- [ ] Pro Mode 전문가 UI 완성도
- [ ] 성능 최적화 (8-12분 목표 시간)
- [ ] 접근성 및 사용성 검증

## 📅 마일스톤

| 날짜 | 마일스톤 | 완료 기준 |
|------|----------|-----------|
| Week 1 | 기본 리브랜딩 완료 | Lab → Pro 변경, 기본 라우팅 |
| Week 2-3 | 핵심 기능 구현 | Pro Mode 핵심 화면 완성 |
| Week 4-5 | SCA 표준 통합 | SCA 평가 시스템 완성 |
| Week 6 | 고급 기능 및 검증 | 리포트 기능, 최종 테스트 |

## 📝 추가 고려사항

### 호환성 유지
- 기존 Cafe/HomeCafe Mode 사용자 경험 보존
- 기존 데이터 마이그레이션 전략
- 점진적 기능 롤아웃

### 성능 최적화
- 새로운 화면들의 로딩 성능
- SCA 계산 로직 최적화
- PDF 생성 성능 개선

### 품질 보증
- 전문가 베타 테스트 계획
- SCA 표준 준수 검증 방법
- 커피 업계 피드백 수집 계획