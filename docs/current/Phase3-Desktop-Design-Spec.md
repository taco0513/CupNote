# Phase 3: 데스크탑 멀티 컬럼 시스템 설계 명세서

**버전**: v3.0  
**작성일**: 2025-08-04  
**대상**: 데스크탑 디바이스 (1024px+)  
**기간**: Week 3-4 (10일)

---

## 🎯 Phase 3 목표

### 핵심 목적
CupNote의 데스크탑 사용자에게 **프로페셔널급 생산성 도구**를 제공하여 커피 전문가와 파워유저의 복잡한 워크플로우를 완벽 지원

### 성과 지표
- **작업 효율성**: 태블릿 대비 60% 빠른 멀티태스킹
- **화면 활용도**: 데스크탑 화면 공간 95% 이상 효율적 사용
- **전문가 만족도**: 커피 큐레이터, 로스터리 전문가 도구 완비

---

## 📐 3-Column 멀티 패널 시스템

### 레이아웃 구조
```
┌─────────────────────────────────────────────────────────┐
│ Global Header (고정)                                      │
├──────────┬─────────────────────────────┬─────────────────┤
│          │                             │                 │
│ Left     │ Main Content                │ Right Panel     │
│ Sidebar  │ (Primary Workspace)         │ (Tools/Info)    │
│ (20%)    │ (60%)                       │ (20%)           │
│          │                             │                 │
│ • 네비    │ • 메인 콘텐츠                  │ • 필터 도구      │
│ • 즐겨찾기 │ • 상세 정보                   │ • 통계 위젯      │
│ • 검색    │ • 편집 영역                   │ • 빠른 액션      │
│ • 태그    │ • 데이터 테이블                │ • 알림 센터      │
│          │                             │                 │
├──────────┴─────────────────────────────┴─────────────────┤
│ Status Bar (선택적)                                        │
└─────────────────────────────────────────────────────────┘
```

### 반응형 Breakpoint 전략
```typescript
// 1024px+: 데스크탑 영역
const desktopBreakpoint = {
  min: 1024,
  max: Infinity,
  layouts: {
    standard: { left: '20%', main: '60%', right: '20%' },    // 기본 3-컬럼
    focus: { left: '15%', main: '70%', right: '15%' },       // 집중 모드
    analysis: { left: '25%', main: '50%', right: '25%' },    // 분석 모드
    minimal: { left: '0%', main: '80%', right: '20%' }       // 미니멀 모드
  }
}

// 와이드 스크린 (1440px+): 고해상도 대응
const wideScreenOptimization = {
  maxContentWidth: '1400px',  // 콘텐츠 최대 너비 제한
  sidePanelExpansion: true,   // 사이드 패널 확장 가능
  multiWorkspace: true        // 멀티 워크스페이스 지원
}
```

---

## 🧩 DesktopLayout 컴포넌트 설계

### 컴포넌트 아키텍처
```typescript
interface DesktopLayoutProps {
  // 컨텐츠 영역 슬롯
  leftSidebarSlot: ReactNode        // 좌측 사이드바 (20%)
  mainContentSlot: ReactNode        // 메인 콘텐츠 (60%)
  rightPanelSlot: ReactNode         // 우측 패널 (20%)
  headerSlot?: ReactNode            // 글로벌 헤더
  statusBarSlot?: ReactNode         // 하단 상태바
  
  // 레이아웃 설정
  layoutMode?: 'standard' | 'focus' | 'analysis' | 'minimal'
  columnRatios?: [number, number, number]  // [20, 60, 20] 기본값
  
  // 패널 관리
  collapsiblePanels?: {
    left?: boolean      // 좌측 패널 접기 가능
    right?: boolean     // 우측 패널 접기 가능
  }
  resizablePanels?: boolean         // 패널 크기 조절 가능
  
  // 워크스페이스 관리
  workspaceMode?: boolean           // 멀티 워크스페이스 지원
  activeWorkspace?: string          // 현재 활성 워크스페이스
  workspaces?: WorkspaceConfig[]    // 워크스페이스 설정
  
  // 고급 키보드 네비게이션
  keyboardNavigation?: boolean      // 키보드 네비게이션 활성화
  shortcuts?: DesktopShortcut[]     // 데스크탑 전용 단축키
  commandPalette?: boolean          // 명령 팔레트 활성화
  
  // 전문가 도구
  enableAdvancedTools?: boolean     // 고급 도구 패널 활성화
  batchOperations?: boolean         // 배치 작업 지원
  dataVisualization?: boolean       // 데이터 시각화 도구
  
  // 성능 최적화
  virtualization?: boolean          // 가상화 스크롤 지원
  lazyLoading?: boolean            // 지연 로딩 활성화
  
  // 접근성
  'aria-label'?: string
  role?: string
  
  // 이벤트 핸들러
  onLayoutModeChange?: (mode: LayoutMode) => void
  onColumnRatioChange?: (ratios: [number, number, number]) => void
  onWorkspaceChange?: (workspace: string) => void
  onPanelToggle?: (panel: 'left' | 'right', collapsed: boolean) => void
}

// 워크스페이스 설정
interface WorkspaceConfig {
  id: string
  name: string
  description?: string
  layoutMode: LayoutMode
  columnRatios: [number, number, number]
  shortcuts: DesktopShortcut[]
  panels: {
    left: { collapsed: boolean, width?: number }
    right: { collapsed: boolean, width?: number }
  }
}

// 데스크탑 전용 단축키
interface DesktopShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean  // macOS Cmd 키 지원
  action: () => void
  description: string
  category: 'navigation' | 'workspace' | 'tools' | 'view'
  scope?: 'global' | 'panel' | 'workspace'
}
```

### 상태 관리 시스템
```typescript
interface DesktopLayoutState {
  // 레이아웃 상태
  layoutMode: LayoutMode
  columnRatios: [number, number, number]
  
  // 패널 상태
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  resizingPanel: 'left' | 'right' | null
  
  // 워크스페이스 상태
  activeWorkspace: string
  workspaces: Map<string, WorkspaceConfig>
  
  // 네비게이션 상태
  focusedPanel: 'left' | 'main' | 'right'
  keyboardMode: boolean
  commandPaletteOpen: boolean
  
  // 도구 상태
  batchMode: boolean
  selectedItems: string[]
  filtersPanelOpen: boolean
  
  // 성능 상태
  virtualizationEnabled: boolean
  visibleRange: { start: number, end: number }
}
```

---

## 🎛️ 멀티 패널 시스템

### Left Sidebar (좌측 20%)
**역할**: 주요 네비게이션, 프로젝트 관리, 빠른 접근

**구성 요소:**
1. **메인 네비게이션**
   - 홈/대시보드/분석/설정 섹션
   - 아이콘 + 라벨 조합, 접기 시 아이콘만
   - 현재 위치 하이라이트

2. **프로젝트/워크스페이스 관리**
   - 워크스페이스 전환 드롭다운
   - 즐겨찾기 커피 기록 (⭐)
   - 최근 작업 기록 (🕒)

3. **스마트 검색**
   - 전역 검색 바
   - 자동완성 및 필터 제안
   - 검색 히스토리

4. **태그 & 분류**
   - 계층적 태그 트리
   - 동적 필터링
   - 커스텀 분류 시스템

### Main Content (중앙 60%)
**역할**: 주요 작업 영역, 상세 정보, 편집 도구

**구성 요소:**
1. **브레드크럼 네비게이션**
   - 현재 위치 경로 표시
   - 클릭 가능한 계층 네비게이션
   - 뒤로/앞으로 버튼

2. **메인 콘텐츠 영역**
   - 커피 기록 상세보기
   - 편집 모드 (인라인 편집)
   - 이미지 갤러리 (확대/축소)

3. **데이터 테이블 뷰**
   - 정렬 가능한 컬럼
   - 인라인 편집
   - 배치 선택/작업
   - 가상화 스크롤 (수천 개 기록 지원)

4. **액션 바**
   - 편집/삭제/공유/내보내기
   - 배치 작업 도구
   - 실행 취소/다시 실행

### Right Panel (우측 20%)
**역할**: 보조 도구, 컨텍스트 정보, 실시간 데이터

**구성 요소:**
1. **필터 & 정렬 도구**
   - 고급 필터 빌더
   - 저장된 필터 프리셋
   - 동적 정렬 옵션

2. **통계 위젯**
   - 실시간 요약 통계
   - 미니 차트 (평점 분포, 월별 트렌드)
   - 성과 지표

3. **빠른 액션 패널**
   - 자주 사용하는 기능
   - 커스터마이즈 가능한 버튼
   - 드래그 앤 드롭 재정렬

4. **알림 센터**
   - 시스템 알림
   - 작업 진행 상태
   - 에러/경고 메시지

5. **도구 팔레트**
   - 고급 편집 도구
   - 배치 작업 설정
   - 내보내기 옵션

---

## ⌨️ 고급 키보드 네비게이션 시스템

### 워크스페이스 단위 단축키
```typescript
const workspaceShortcuts = {
  // 워크스페이스 관리
  'Ctrl+1-9': 'switchWorkspace',     // 워크스페이스 1-9 전환
  'Ctrl+Tab': 'nextWorkspace',       // 다음 워크스페이스
  'Ctrl+Shift+Tab': 'prevWorkspace', // 이전 워크스페이스
  'Ctrl+Shift+N': 'newWorkspace',    // 새 워크스페이스
  
  // 패널 네비게이션
  'Ctrl+Shift+L': 'focusLeftPanel',  // 좌측 패널 포커스
  'Ctrl+Shift+M': 'focusMainPanel',  // 메인 패널 포커스
  'Ctrl+Shift+R': 'focusRightPanel', // 우측 패널 포커스
  
  // 패널 토글
  'Ctrl+B': 'toggleLeftPanel',       // 좌측 패널 토글
  'Ctrl+Shift+B': 'toggleRightPanel', // 우측 패널 토글
  'Ctrl+\\': 'resetLayout',          // 레이아웃 초기화
  
  // 레이아웃 모드
  'Ctrl+Shift+1': 'standardMode',    // 표준 모드
  'Ctrl+Shift+2': 'focusMode',       // 집중 모드
  'Ctrl+Shift+3': 'analysisMode',    // 분석 모드
  'Ctrl+Shift+4': 'minimalMode',     // 미니멀 모드
}
```

### 명령 팔레트 시스템
```typescript
interface CommandPalette {
  // 명령 검색 및 실행
  trigger: 'Ctrl+Shift+P'            // 명령 팔레트 열기
  
  commands: {
    // 네비게이션 명령
    'Go to Home': () => navigate('/'),
    'Go to Records': () => navigate('/records'),
    'Go to Analytics': () => navigate('/analytics'),
    
    // 레이아웃 명령
    'Switch to Focus Mode': () => setLayoutMode('focus'),
    'Toggle Left Panel': () => togglePanel('left'),
    'Reset Layout': () => resetLayout(),
    
    // 작업 명령
    'New Coffee Record': () => createRecord(),
    'Export All Records': () => exportRecords(),
    'Batch Delete': () => batchDelete(),
    
    // 검색 명령
    'Search Records': () => focusSearch(),
    'Filter by Rating': () => openRatingFilter(),
    'Advanced Search': () => openAdvancedSearch(),
  }
  
  // 자동완성 및 퍼지 검색
  fuzzySearch: boolean
  recentCommands: string[]
  favoriteCommands: string[]
}
```

### 접근성 향상 시스템
```typescript
interface AccessibilityFeatures {
  // 키보드 전용 네비게이션
  skipLinks: SkipLink[]               // 스킵 링크
  focusManagement: FocusManager       // 포커스 관리
  tabOrder: TabOrderManager          // 탭 순서 관리
  
  // 스크린 리더 지원
  ariaLive: 'polite' | 'assertive'   // 동적 콘텐츠 알림
  ariaLabels: Map<string, string>    // ARIA 라벨 관리
  landmarks: LandmarkManager         // 랜드마크 영역
  
  // 키보드 시각적 피드백
  focusIndicator: FocusIndicator     // 포커스 표시기
  keyboardHints: KeyboardHintSystem  // 키보드 힌트
  
  // 고대비 모드
  highContrast: boolean              // 고대비 모드
  textScaling: number                // 텍스트 크기 조절
  reducedMotion: boolean             // 애니메이션 줄이기
}
```

---

## 🎨 데스크탑 전용 디자인 토큰

### 레이아웃 토큰
```css
:root {
  /* 데스크탑 레이아웃 변수 */
  --desktop-sidebar-width: 20%;
  --desktop-main-width: 60%;
  --desktop-panel-width: 20%;
  --desktop-min-sidebar-width: 240px;
  --desktop-max-sidebar-width: 400px;
  --desktop-min-panel-width: 200px;
  --desktop-max-panel-width: 350px;
  
  /* 간격 및 여백 */
  --desktop-gutter: 32px;
  --desktop-section-gap: 40px;
  --desktop-card-gap: 20px;
  --desktop-toolbar-height: 48px;
  --desktop-statusbar-height: 24px;
  
  /* 멀티 레벨 간격 */
  --desktop-level-1-padding: 24px;
  --desktop-level-2-padding: 16px;
  --desktop-level-3-padding: 8px;
  
  /* 고밀도 디스플레이 */
  --desktop-density-comfortable: 1.2;
  --desktop-density-compact: 1.0;
  --desktop-density-cozy: 0.9;
  
  /* 애니메이션 */
  --desktop-transition-panel: 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
  --desktop-transition-layout: 300ms ease-in-out;
  --desktop-transition-focus: 150ms ease-out;
}
```

### 타이포그래피 스케일 (데스크탑 최적화)
```css
/* 데스크탑 전용 폰트 스케일 - 고해상도 최적화 */
--desktop-text-xs: clamp(0.75rem, 0.8vw, 0.875rem);
--desktop-text-sm: clamp(0.875rem, 0.9vw, 1rem);
--desktop-text-base: clamp(1rem, 1vw, 1.125rem);
--desktop-text-lg: clamp(1.125rem, 1.1vw, 1.25rem);
--desktop-text-xl: clamp(1.25rem, 1.2vw, 1.5rem);
--desktop-text-2xl: clamp(1.5rem, 1.4vw, 1.875rem);
--desktop-text-3xl: clamp(1.875rem, 1.6vw, 2.25rem);
--desktop-text-4xl: clamp(2.25rem, 1.8vw, 3rem);

/* 제목 계층 */
--desktop-display-small: clamp(2.5rem, 2vw, 3.5rem);
--desktop-display-medium: clamp(3rem, 2.5vw, 4.5rem);
--desktop-display-large: clamp(4rem, 3vw, 5.7rem);
```

### 그리드 시스템
```css
/* 24-컬럼 그리드 시스템 (데스크탑) */
.desktop-grid {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: var(--desktop-gutter);
  max-width: 1440px;
  margin: 0 auto;
}

/* 패널 기본 그리드 할당 */
.sidebar-panel { grid-column: span 5; }      /* ~20% */
.main-content { grid-column: span 14; }      /* ~60% */
.tools-panel { grid-column: span 5; }        /* ~20% */

/* 레이아웃 모드별 그리드 */
.layout-focus .sidebar-panel { grid-column: span 4; }    /* 15% */
.layout-focus .main-content { grid-column: span 16; }    /* 70% */
.layout-focus .tools-panel { grid-column: span 4; }      /* 15% */

.layout-analysis .sidebar-panel { grid-column: span 6; }  /* 25% */
.layout-analysis .main-content { grid-column: span 12; }  /* 50% */
.layout-analysis .tools-panel { grid-column: span 6; }    /* 25% */
```

---

## 🔧 구현 우선순위

### Week 3 - Day 1-3: 기본 구조
```typescript
// 1. DesktopLayout 컴포넌트 구현
├── DesktopLayout.tsx            // 메인 데스크탑 레이아웃
├── MultiColumnPanel.tsx         // 3-컬럼 패널 시스템
├── ResizablePanel.tsx          // 크기 조절 가능한 패널
├── WorkspaceManager.tsx        // 워크스페이스 관리
└── DesktopProvider.tsx         // 데스크탑 상태 관리

// 2. 패널 시스템 구현
├── LeftSidebar.tsx             // 좌측 사이드바
├── MainWorkspace.tsx           // 메인 작업 영역
├── RightToolsPanel.tsx         // 우측 도구 패널
└── PanelResizeHandles.tsx      // 패널 리사이징 핸들
```

### Week 3 - Day 4-5: 키보드 네비게이션
```typescript
// 1. 고급 키보드 시스템
├── useDesktopKeyboard.ts        // 데스크탑 키보드 관리
├── CommandPalette.tsx          // 명령 팔레트
├── WorkspaceShortcuts.ts       // 워크스페이스 단축키
└── AccessibilityManager.ts     // 접근성 관리

// 2. 포커스 관리 시스템
├── FocusZone.tsx               // 포커스 영역 관리
├── TabOrderManager.ts          // 탭 순서 제어
├── KeyboardHints.tsx           // 키보드 힌트 시스템
└── SkipLinks.tsx               // 스킵 링크 네비게이션
```

### Week 4 - Day 1-3: 전문가 도구
```typescript
// 1. 배치 작업 시스템
├── BatchOperations.tsx         // 배치 작업 도구
├── BulkEditor.tsx             // 대량 편집 도구
├── SelectionManager.ts        // 선택 항목 관리
└── ProgressTracker.tsx        // 진행 상태 추적

// 2. 고급 필터 & 검색
├── AdvancedFilters.tsx        // 고급 필터 빌더
├── SearchBuilder.tsx          // 검색 쿼리 빌더
├── FilterPresets.tsx          // 필터 프리셋 관리
└── SmartSuggestions.tsx       // 스마트 제안 시스템
```

### Week 4 - Day 4-5: 통합 및 테스트
```typescript
// 1. 데스크탑 테스트 페이지
├── desktop-test/page.tsx       // 데스크탑 기능 종합 테스트
├── 멀티 패널 레이아웃 테스트
├── 키보드 네비게이션 시나리오
└── 전문가 도구 워크플로우 테스트

// 2. Phase 3 완료 보고서
├── 구현 완료 항목 정리
├── 성능 메트릭 측정
└── 전체 시스템 통합 검증
```

---

## 📊 성능 목표

### 반응 속도 (데스크탑 최적화)
- **패널 전환**: < 200ms
- **레이아웃 모드 변경**: < 250ms
- **키보드 반응**: < 50ms
- **명령 팔레트**: < 100ms
- **배치 작업**: < 500ms (1000개 항목)

### 메모리 효율성
- **가상화 스크롤**: 10,000+ 항목 지원
- **워크스페이스 관리**: < 100MB 추가 메모리
- **실시간 업데이트**: < 16ms 렌더링
- **대용량 데이터**: 스트리밍 로드 지원

### 접근성 성능
- **스크린 리더**: 100% 호환성
- **키보드 전용**: 모든 기능 접근 가능
- **고대비 모드**: 완전 지원
- **텍스트 확대**: 200%까지 지원

---

## 🧪 테스트 시나리오

### 레이아웃 테스트
1. **3-컬럼 시스템**
   - 기본 20%-60%-20% 비율
   - 레이아웃 모드 전환 (표준/집중/분석/미니멀)
   - 패널 접기/펼치기
   - 동적 크기 조절

2. **워크스페이스 관리**
   - 멀티 워크스페이스 전환
   - 워크스페이스별 설정 저장
   - 단축키로 빠른 전환

### 키보드 네비게이션 테스트
1. **패널 간 이동**
   - Ctrl+Shift+L/M/R 패널 포커스
   - Tab 키 순차 이동
   - 포커스 트랩 및 복원

2. **명령 팔레트**
   - Ctrl+Shift+P 명령 팔레트 열기
   - 퍼지 검색 기능
   - 최근/즐겨찾기 명령

### 전문가 도구 테스트
1. **배치 작업**
   - 다중 선택 및 편집
   - 배치 삭제/내보내기
   - 진행 상태 표시

2. **고급 필터**
   - 복합 조건 필터
   - 필터 프리셋 저장/로드
   - 실시간 필터링

---

**다음**: Phase 3 구현 시작 → DesktopLayout 컴포넌트 개발

*문서 버전: v3.0 | 작성자: CupNote 개발팀 | 최종 수정: 2025-08-04*