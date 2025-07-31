# TastingFlow 4-Mode System Implementation Plan

## 개요

현재 단순한 4단계 구조를 4가지 모드로 확장하여 다양한 사용자층을 만족시키는 시스템으로 발전

## 4-Mode 시스템 설계

### 모드 분류 기준

#### 📱 남이 내려준 커피 (카페 방문)
1. **Quick Mode** - 빠른 기록
2. **Cafe Mode** - 상세 카페 경험

#### 🏠 직접 내려 마시는 커피 (홈 추출)  
3. **HomeCafe Mode** - 레시피 중심
4. **Pro Mode** - 전문가 분석

### 각 모드별 상세 정의

#### 1. Quick Mode (신규)
- **대상**: 빠른 기록을 원하는 사용자, 초보자
- **단계**: 4단계 (현재 구조 활용)
  - Step1: 기본 정보 (커피명, 로스터, 날짜)
  - Step2: 간단 추가 정보 (선택)
  - Step3: 맛 평가 (별점 + 간단 메모)
  - Step4: 완료 및 저장
- **특징**: 1-2분 내 완성, 최소 필수 정보만

#### 2. Cafe Mode
- **대상**: 카페 방문자, 커피 애호가
- **단계**: 7단계 (문서 기준)
  - 모드 선택
  - 커피 정보 (카페명 필수)
  - 맛 평가
  - 감각 표현
  - 퍼스널 노트
  - 로스터 노트
  - 완료
- **특징**: 카페 정보, 감각적 경험 중심

#### 3. HomeCafe Mode
- **대상**: 홈카페 애호가, 레시피 실험자
- **단계**: 8단계 (문서 기준)
  - 모드 선택
  - 커피 정보
  - 홈카페 설정 (드리퍼, 레시피)
  - 향미 선택
  - 감각 표현
  - 퍼스널 코멘트
  - 로스터 노트
  - 결과
- **특징**: 드리퍼, 레시피, 추출 데이터 중심

#### 4. Pro Mode
- **대상**: 전문가, 바리스타, Q-Grader
- **단계**: 8단계 (문서 기준)
  - 모드 선택
  - 커피 정보 (상세)
  - 실험 데이터 (SCA 표준)
  - 향미 선택
  - 감각 슬라이더
  - 감각 표현
  - 퍼스널 코멘트
  - 결과
- **특징**: SCA 표준, TDS/수율, 전문 분석

## 기술적 구현 계획

### 1. 라우팅 구조 변경

```
/mode-selection          # 4개 모드 선택
/record/quick/*         # Quick Mode (4 steps)
/record/cafe/*          # Cafe Mode (7 steps)  
/record/homecafe/*      # HomeCafe Mode (8 steps)
/record/pro/*           # Pro Mode (8 steps)
```

### 2. Token System 구현

```typescript
// src/config/tasting-modes.config.ts
export const TASTING_MODES_CONFIG = {
  quick: {
    id: 'quick',
    label: 'Quick Mode',
    labelKr: '빠른 기록',
    icon: '⚡',
    color: 'orange',
    steps: 4,
    description: '1-2분 내 간단 기록',
    target: '빠른 기록이 필요한 순간'
  },
  cafe: {
    id: 'cafe',
    label: 'Cafe Mode',
    labelKr: '카페 모드',
    icon: '☕',
    color: 'blue',
    steps: 7,
    description: '카페 방문 경험 기록',
    target: '카페에서 마신 커피'
  },
  homecafe: {
    id: 'homecafe',
    label: 'HomeCafe Mode',
    labelKr: '홈카페 모드',
    icon: '🏠',
    color: 'green',
    steps: 8,
    description: '홈카페 레시피 기록',
    target: '집에서 직접 내린 커피'
  },
  pro: {
    id: 'pro',
    label: 'Pro Mode',
    labelKr: '프로 모드',
    icon: '🔬',
    color: 'purple',
    steps: 8,
    description: 'SCA 표준 전문 분석',
    target: '전문가급 상세 분석'
  }
} as const
```

### 3. 공통 컴포넌트 추출

```
/src/components/record/
├── common/
│   ├── CoffeeInfo.tsx      # 커피 기본 정보
│   ├── TasteEvaluation.tsx # 맛 평가
│   ├── SensoryExpression.tsx # 감각 표현
│   └── PersonalNote.tsx    # 개인 메모
├── quick/                   # Quick 전용
├── cafe/                    # Cafe 전용
├── homecafe/               # HomeCafe 전용
└── pro/                    # Pro 전용
```

### 4. 데이터 구조 통합

```typescript
interface TastingRecord {
  // 공통 필드
  mode: 'quick' | 'cafe' | 'homecafe' | 'pro'
  coffeeName: string
  date: Date
  rating: number
  
  // 모드별 선택 필드
  cafeData?: CafeData
  homecafeData?: HomeCafeData
  proData?: ProData
  
  // 공통 선택 필드
  sensoryExpressions?: SensoryData
  matchScore?: number
}
```

## 구현 단계

### Phase 1 (1주차)
- [ ] Token System 구현
- [ ] Mode Selection 화면 4개 모드로 업데이트
- [ ] Quick Mode 구현 (현재 4단계 재활용)
- [ ] 라우팅 구조 설정

### Phase 2 (2-3주차)
- [ ] 공통 컴포넌트 추출 및 리팩토링
- [ ] Cafe Mode 7단계 구현
- [ ] 단계별 네비게이션 로직 구현

### Phase 3 (4-5주차)
- [ ] HomeCafe Mode 8단계 완성
- [ ] 레시피 관리 시스템 구현
- [ ] 타이머 기능 추가

### Phase 4 (6-7주차)
- [ ] Pro Mode 8단계 구현
- [ ] SCA 표준 필드 완성
- [ ] 전문 분석 기능 추가

### Phase 5 (8주차)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 사용자 피드백 반영

## 기대 효과

1. **사용자 만족도 향상**
   - 초보자: Quick Mode로 부담 없이 시작
   - 애호가: Cafe/HomeCafe로 상세 기록
   - 전문가: Pro Mode로 전문 분석

2. **차별화된 가치**
   - 국내 유일 4-Mode 커피 기록 시스템
   - 사용 상황별 최적화된 UX
   - 단계적 성장 가능한 구조

3. **확장 가능성**
   - 모드별 독립적 발전 가능
   - 새로운 모드 추가 용이
   - 기능별 A/B 테스트 가능

## 참고 문서
- `/docs/tastingflow/README.md` - Master TastingFlow 문서
- `/docs/tastingflow/screens/*` - 각 화면별 상세 문서
- `/Foundation/03-screens/tasting-flow/*` - 기존 설계 문서

---

작성일: 2025-01-31
작성자: SuperClaude