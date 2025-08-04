# Phase 2: 태블릿 레이아웃 시스템 설계 명세서

**버전**: v2.0  
**작성일**: 2025-08-04  
**대상**: 태블릿 디바이스 (768px - 1024px)  
**기간**: Week 2 (5일)

---

## 🎯 Phase 2 목표

### 핵심 목적
CupNote의 태블릿 사용자에게 **데스크탑 수준의 생산성**과 **모바일 수준의 직관성**을 동시에 제공하는 하이브리드 인터페이스 구현

### 성과 지표
- **공간 활용도**: 태블릿 화면 공간 90% 이상 효율적 사용
- **작업 효율성**: 모바일 대비 40% 빠른 작업 완료
- **사용자 만족도**: 터치+키보드 하이브리드 UX 지원

---

## 📐 1.5-Column 레이아웃 시스템

### 레이아웃 구조
```
┌─────────────────────────────────┐
│ Header (고정)                    │
├─────────────┬───────────────────┤
│             │                   │
│ Primary     │ Secondary         │
│ Column      │ Column            │
│ (40%)       │ (60%)             │
│             │                   │
│ - 네비게이션   │ - 메인 컨텐츠       │
│ - 목록       │ - 상세 정보        │
│ - 필터       │ - 편집 도구        │
│             │                   │
├─────────────┴───────────────────┤
│ Footer (선택적)                  │
└─────────────────────────────────┘
```

### 반응형 Breakpoint 전략
```typescript
// 768px - 1024px: 태블릿 영역
const tabletBreakpoint = {
  min: 768,
  max: 1024,
  columns: {
    primary: '40%',    // 좌측 네비게이션/목록
    secondary: '60%'   // 우측 메인 컨텐츠
  }
}

// 세로 모드 (Portrait): 9:16 ratio
const portraitMode = {
  layout: 'stacked',  // 상하 배치
  transition: 'smooth'
}

// 가로 모드 (Landscape): 16:9 ratio  
const landscapeMode = {
  layout: 'split',    // 좌우 분할
  interaction: 'dual-pane'
}
```

---

## 🧩 TabletLayout 컴포넌트 설계

### 컴포넌트 아키텍처
```typescript
interface TabletLayoutProps {
  // 레이아웃 설정
  splitRatio?: [number, number]     // [40, 60] 기본값
  orientation?: 'portrait' | 'landscape' | 'auto'
  
  // 컨텐츠 영역
  primarySlot: ReactNode            // 좌측 영역
  secondarySlot: ReactNode          // 우측 영역
  headerSlot?: ReactNode            // 상단 헤더
  
  // 인터랙션
  resizable?: boolean               // 분할 비율 조절 가능
  collapsible?: boolean             // 좌측 영역 접기/펼치기
  
  // 키보드 네비게이션
  keyboardNavigation?: boolean      // 키보드 네비게이션 활성화
  shortcutKeys?: KeyboardShortcut[]
  
  // 접근성
  'aria-label'?: string
  role?: string
}
```

### 상태 관리 시스템
```typescript
interface TabletLayoutState {
  // 레이아웃 상태
  splitRatio: [number, number]
  isLeftCollapsed: boolean
  orientation: 'portrait' | 'landscape'
  
  // 네비게이션 상태  
  activeSection: string
  focusedElement: string | null
  
  // 인터랙션 상태
  isDragging: boolean
  dragStartX: number
  
  // 키보드 상태
  keyboardMode: boolean
  shortcuts: Map<string, () => void>
}
```

---

## 🔀 분할 뷰 시스템 (Split View)

### Primary Column (좌측 40%)
**역할**: 네비게이션, 목록, 빠른 액세스 도구

**구성 요소:**
1. **네비게이션 패널**
   - 주요 섹션 바로가기 (홈/기록/분석/설정)
   - 빠른 액션 버튼 (새 기록 작성, 검색)
   - 현재 위치 표시

2. **목록 뷰**
   - 커피 기록 목록 (최신순/평점순)
   - 무한 스크롤 또는 페이지네이션
   - 필터 바로가기 (오늘/이번 주/즐겨찾기)

3. **빠른 필터**
   - 카테고리 태그 (Café/HomeCafe/Lab)
   - 평점 필터 (★★★★★)
   - 날짜 범위 선택

### Secondary Column (우측 60%)
**역할**: 메인 컨텐츠, 상세 정보, 편집 도구

**구성 요소:**
1. **컨텐츠 영역**
   - 선택된 커피 기록 상세보기
   - 편집 모드 전환
   - 이미지 갤러리

2. **액션 바**
   - 편집/삭제/공유 버튼
   - 즐겨찾기 토글
   - 추가 메뉴 (복사, 내보내기)

3. **관련 정보**
   - 비슷한 커피 추천
   - 태그 관련 기록들
   - 통계 요약

---

## ⌨️ 키보드 네비게이션 시스템

### 키보드 단축키 매핑
```typescript
const keyboardShortcuts = {
  // 네비게이션
  'Tab': 'focusNext',           // 다음 요소로 포커스
  'Shift+Tab': 'focusPrev',     // 이전 요소로 포커스
  'ArrowLeft': 'focusLeft',     // 좌측 패널로 이동
  'ArrowRight': 'focusRight',   // 우측 패널로 이동
  
  // 액션
  'Enter': 'activate',          // 선택된 요소 활성화
  'Space': 'select',            // 체크박스/버튼 선택/해제
  'Escape': 'cancel',           // 현재 작업 취소
  
  // 빠른 액션
  'Cmd+N': 'newRecord',         // 새 기록 작성
  'Cmd+F': 'search',            // 검색 활성화
  'Cmd+E': 'edit',              // 편집 모드
  'Cmd+S': 'save',              // 저장
  
  // 뷰 제어
  'Cmd+1': 'toggleLeftPanel',   // 좌측 패널 토글
  'Cmd+2': 'toggleRightPanel',  // 우측 패널 토글
  'Cmd+\\': 'resetLayout',      // 레이아웃 초기화
}
```

### 포커스 관리 시스템
```typescript
interface FocusManager {
  // 포커스 트래킹
  currentFocus: HTMLElement | null
  focusHistory: HTMLElement[]
  
  // 영역별 포커스 관리
  leftPanelFocus: FocusZone
  rightPanelFocus: FocusZone
  
  // 포커스 이동 메서드
  moveFocus(direction: 'up' | 'down' | 'left' | 'right'): void
  trapFocus(container: HTMLElement): void
  restoreFocus(): void
  
  // 접근성 향상
  announceChanges: boolean
  skipLinks: SkipLink[]
}
```

---

## 🎨 태블릿 전용 디자인 토큰

### 레이아웃 토큰
```css
:root {
  /* 태블릿 레이아웃 변수 */
  --tablet-split-ratio-left: 40%;
  --tablet-split-ratio-right: 60%;
  --tablet-min-panel-width: 280px;
  --tablet-max-panel-width: 480px;
  
  /* 간격 및 여백 */
  --tablet-gutter: 24px;
  --tablet-section-gap: 32px;
  --tablet-card-gap: 16px;
  
  /* 터치 타겟 */
  --tablet-touch-target: 48px;
  --tablet-button-height: 44px;
  --tablet-row-height: 56px;
  
  /* 애니메이션 */
  --tablet-transition-fast: 200ms ease-out;
  --tablet-transition-normal: 300ms ease-in-out;
  --tablet-transition-slow: 500ms ease-in-out;
}
```

### 타이포그래피 스케일
```css
/* 태블릿 전용 폰트 스케일 */
--tablet-text-xs: clamp(0.75rem, 1vw, 0.875rem);
--tablet-text-sm: clamp(0.875rem, 1.2vw, 1rem);
--tablet-text-base: clamp(1rem, 1.4vw, 1.125rem);
--tablet-text-lg: clamp(1.125rem, 1.6vw, 1.25rem);
--tablet-text-xl: clamp(1.25rem, 1.8vw, 1.5rem);
--tablet-text-2xl: clamp(1.5rem, 2vw, 1.875rem);
--tablet-text-3xl: clamp(1.875rem, 2.5vw, 2.25rem);
```

---

## 🔧 구현 우선순위

### Week 2 - Day 1-2: 기본 구조
```typescript
// 1. TabletLayout 컴포넌트 구현
├── TabletLayout.tsx          // 메인 레이아웃 컴포넌트
├── SplitPane.tsx            // 분할 패널 시스템
├── ResizeHandle.tsx         // 크기 조절 핸들
└── TabletProvider.tsx       // 상태 관리 컨텍스트

// 2. 기본 레이아웃 적용
├── 기존 ResponsiveLayout에 태블릿 모드 추가
├── 768px-1024px breakpoint 처리
└── 세로/가로 모드 대응
```

### Week 2 - Day 3-4: 인터랙션 기능
```typescript
// 1. 키보드 네비게이션
├── useKeyboardNavigation.ts  // 키보드 관리 훅
├── FocusManager.ts          // 포커스 관리 클래스
├── KeyboardShortcuts.ts     // 단축키 정의
└── AccessibilityUtils.ts    // 접근성 도구

// 2. 터치/마우스 인터랙션
├── 분할 바 드래그 리사이징
├── 패널 접기/펼치기 제스처
└── 스와이프 네비게이션 확장
```

### Week 2 - Day 5: 통합 및 테스트
```typescript
// 1. 태블릿 테스트 페이지
├── tablet-test/page.tsx     // 태블릿 기능 종합 테스트
├── 키보드 네비게이션 시나리오
├── 분할 뷰 리사이징 테스트
└── 성능 최적화 검증

// 2. Phase 2 완료 보고서
├── 구현 완료 항목 정리
├── 성능 메트릭 측정
└── Phase 3 준비 사항
```

---

## 📊 성능 목표

### 반응 속도
- **레이아웃 전환**: < 300ms
- **패널 리사이징**: < 16ms (60fps)
- **키보드 반응**: < 100ms
- **터치 반응**: < 50ms

### 메모리 사용량
- **컴포넌트 렌더링**: < 50ms
- **상태 업데이트**: < 10ms
- **애니메이션**: GPU 가속 사용
- **가상화**: 긴 목록 성능 최적화

### 접근성 준수
- **WCAG 2.1 AA**: 100% 준수
- **키보드 네비게이션**: 모든 기능 접근 가능
- **스크린 리더**: ARIA 라벨 완전 지원
- **포커스 관리**: 논리적 탭 순서

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **레이아웃 전환**
   - 모바일 → 태블릿 자동 전환
   - 세로 ↔ 가로 모드 전환
   - 분할 비율 조절

2. **키보드 네비게이션**
   - Tab 키로 요소 간 이동
   - 화살표 키로 패널 간 이동
   - 단축키로 빠른 액션 실행

3. **터치 인터랙션**
   - 분할 바 드래그 리사이징
   - 패널 스와이프 접기/펼치기
   - 기존 스와이프 액션 유지

### 성능 테스트
1. **렌더링 성능**
   - 레이아웃 변경 시 리렌더링 최소화
   - 애니메이션 끊김 없음
   - 메모리 누수 없음

2. **사용성 테스트**
   - 실제 태블릿 디바이스 테스트
   - 다양한 화면 크기 대응
   - 키보드+터치 하이브리드 사용

---

**다음**: Phase 2 구현 시작 → TabletLayout 컴포넌트 개발

*문서 버전: v2.0 | 작성자: CupNote 개발팀 | 최종 수정: 2025-08-04*