# CupNote 개발팀 코드 스타일 가이드 v2.0

## 🎯 개발 철학

### Core Principles
1. **Clean Code First**: 읽기 쉽고 유지보수 가능한 코드 작성
2. **Type Safety**: TypeScript 엄격 모드로 런타임 에러 최소화
3. **Component Composition**: 재사용 가능한 작은 컴포넌트 조합
4. **Performance by Design**: 성능을 고려한 설계 및 구현
5. **Accessibility First**: 모든 사용자를 위한 접근 가능한 인터페이스

---

## 📁 프로젝트 구조

### 디렉토리 구조
```
src/
├── app/                      # Next.js App Router 페이지
│   ├── (auth)/              # 인증 관련 라우트 그룹
│   ├── responsive-concept/   # 반응형 컨셉 페이지
│   └── globals.css          # 글로벌 스타일
├── components/              # React 컴포넌트
│   ├── ui/                  # 기본 UI 컴포넌트
│   │   ├── FluidText.tsx    # 반응형 텍스트
│   │   ├── FluidContainer.tsx # 반응형 컨테이너
│   │   └── UnifiedButton.tsx # 통합 버튼
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── ResponsiveLayout.tsx
│   │   ├── MobileLayout.tsx
│   │   ├── TabletLayout.tsx
│   │   └── DesktopLayout.tsx
│   ├── navigation/          # 네비게이션 컴포넌트
│   │   ├── MobileNavigation.tsx
│   │   ├── TabletSidebar.tsx
│   │   └── MenuTree.tsx
│   ├── records/             # 기록 관련 컴포넌트
│   │   ├── RecordsList.tsx
│   │   ├── RecordDetail.tsx
│   │   └── RecordForm.tsx
│   └── __tests__/           # 컴포넌트 테스트
├── contexts/                # React Context
│   ├── ResponsiveContext.tsx
│   ├── AuthContext.tsx
│   └── RecordsContext.tsx
├── hooks/                   # 커스텀 훅
│   ├── useBreakpoint.ts
│   ├── useResponsive.ts
│   └── useSwipeGesture.ts
├── lib/                     # 라이브러리 설정
│   ├── supabase.ts
│   └── utils.ts
├── styles/                  # 스타일 파일
│   ├── design-tokens.css    # 디자인 토큰
│   ├── fluid.css           # Fluid Design System
│   └── components.css       # 컴포넌트별 스타일
├── types/                   # TypeScript 타입 정의
│   ├── coffee.ts
│   ├── user.ts
│   └── responsive.ts
└── utils/                   # 유틸리티 함수
    ├── responsive-helpers.ts
    ├── performance.ts
    └── accessibility.ts
```

---

## 🧩 컴포넌트 아키텍처

### 컴포넌트 명명 규칙
```typescript
// ✅ Good: PascalCase + 명확한 의미
export default function CoffeeRecordCard() {}
export const SwipeableRecordItem = () => {}

// ❌ Bad: 모호하거나 일관성 없음
export default function card() {}
export const item = () => {}
```

### 컴포넌트 구조 템플릿
```typescript
/**
 * ComponentName - 컴포넌트 설명
 * 사용 목적과 주요 기능 설명
 */
'use client' // Client Component인 경우

import { useState, useEffect, memo } from 'react'
import { type ComponentProps } from '../types/component'

// Props 인터페이스 정의
interface ComponentNameProps {
  // Required props
  id: string
  title: string
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  
  // Event handlers
  onClick?: (id: string) => void
  onHover?: () => void
  
  // Children and className
  children?: React.ReactNode
  className?: string
}

// 기본값 정의
const defaultProps: Partial<ComponentNameProps> = {
  variant: 'primary',
  size: 'md',
  disabled: false
}

// 메인 컴포넌트 (memo로 최적화)
const ComponentName = memo(function ComponentName({
  id,
  title,
  variant = defaultProps.variant,
  size = defaultProps.size,
  disabled = defaultProps.disabled,
  onClick,
  onHover,
  children,
  className = ''
}: ComponentNameProps) {
  // 상태 관리
  const [isActive, setIsActive] = useState(false)
  
  // 커스텀 훅 사용
  const { isMobile } = useResponsive()
  
  // 이펙트
  useEffect(() => {
    // 사이드 이펙트 로직
  }, [id])
  
  // 이벤트 핸들러
  const handleClick = () => {
    if (disabled) return
    onClick?.(id)
    setIsActive(prev => !prev)
  }
  
  // 조건부 클래스명 생성
  const combinedClassName = [
    'base-class',
    `variant-${variant}`,
    `size-${size}`,
    disabled && 'disabled',
    isActive && 'active',
    isMobile && 'mobile',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div 
      className={combinedClassName}
      onClick={handleClick}
      onMouseEnter={onHover}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <h2>{title}</h2>
      {children}
    </div>
  )
})

export default ComponentName

// 타입 export (다른 곳에서 사용할 경우)
export type { ComponentNameProps }
```

### 반응형 컴포넌트 패턴
```typescript
// useResponsive 훅 활용
const ResponsiveComponent = () => {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive()
  
  // 조건부 렌더링
  if (isMobile) {
    return <MobileView />
  }
  
  if (isTablet) {
    return <TabletView />
  }
  
  return <DesktopView />
}

// 조건부 props 패턴
const AdaptiveComponent = ({ data }: Props) => {
  const { isMobile } = useResponsive()
  
  return (
    <DataList
      items={data}
      columns={isMobile ? 1 : isTablet ? 2 : 3}
      showDetails={!isMobile}
      enableBatch={!isMobile}
    />
  )
}
```

---

## 🎨 스타일링 가이드

### CSS 클래스 명명 규칙
```css
/* BEM 방법론 기반 + Tailwind 조합 */

/* Block */
.record-card { }

/* Element */
.record-card__title { }
.record-card__content { }
.record-card__actions { }

/* Modifier */
.record-card--featured { }
.record-card--compact { }
.record-card__title--large { }

/* State */
.record-card.is-loading { }
.record-card.is-selected { }
.record-card.is-disabled { }
```

### 디자인 토큰 사용
```typescript
// ✅ Good: 디자인 토큰 활용
const StyledCard = styled.div`
  padding: var(--fluid-space-md);
  background: var(--coffee-50);
  border-radius: var(--fluid-radius-lg);
  box-shadow: var(--fluid-shadow-md);
`

// ✅ Good: Tailwind + 커스텀 프로퍼티
<div className="p-[var(--fluid-space-md)] bg-coffee-50 rounded-[var(--fluid-radius-lg)]">

// ❌ Bad: 하드코딩된 값
const BadCard = styled.div`
  padding: 16px;
  background: #FAF7F2;
  border-radius: 12px;
`
```

### 반응형 스타일링
```css
/* Mobile-first 접근법 */
.component {
  /* Mobile styles (기본) */
  padding: var(--fluid-space-sm);
  font-size: var(--fluid-text-base);
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    padding: var(--fluid-space-md);
    font-size: var(--fluid-text-lg);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: var(--fluid-space-lg);
    font-size: var(--fluid-text-xl);
  }
}

/* Container Queries (고급) */
@container (min-width: 400px) {
  .component {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

---

## 🔧 훅스 & 유틸리티

### 커스텀 훅 작성 가이드
```typescript
// useResponsive 훅 예시
interface ResponsiveState {
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    breakpoint: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0
  })
  
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      const breakpoint = 
        width >= 1024 ? 'desktop' :
        width >= 768 ? 'tablet' : 'mobile'
      
      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
        height
      })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  return state
}
```

### 유틸리티 함수 작성
```typescript
// 타입 안전한 유틸리티 함수
export function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

// 제네릭을 활용한 타입 안전성
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// 성능 최적화를 위한 메모이제이션
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
```

---

## 🧪 테스팅 가이드

### 컴포넌트 테스트
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ResponsiveProvider } from '../contexts/ResponsiveContext'
import ComponentName from './ComponentName'

// 테스트 헬퍼 함수
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(
    <ResponsiveProvider>
      {ui}
    </ResponsiveProvider>,
    options
  )
}

describe('ComponentName', () => {
  const defaultProps = {
    id: 'test-id',
    title: 'Test Title'
  }
  
  test('기본 렌더링이 정상적으로 동작한다', () => {
    renderWithProviders(<ComponentName {...defaultProps} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  
  test('클릭 이벤트가 정상적으로 동작한다', () => {
    const handleClick = jest.fn()
    
    renderWithProviders(
      <ComponentName {...defaultProps} onClick={handleClick} />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith('test-id')
  })
  
  test('disabled 상태에서는 클릭이 동작하지 않는다', () => {
    const handleClick = jest.fn()
    
    renderWithProviders(
      <ComponentName {...defaultProps} disabled onClick={handleClick} />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
  
  test('반응형 동작이 정상적으로 작동한다', () => {
    // Mock useResponsive hook
    jest.mock('../hooks/useResponsive', () => ({
      useResponsive: () => ({ isMobile: true, isTablet: false, isDesktop: false })
    }))
    
    renderWithProviders(<ComponentName {...defaultProps} />)
    
    expect(screen.getByRole('button')).toHaveClass('mobile')
  })
})
```

### 훅 테스트
```typescript
// useResponsive.test.ts
import { renderHook, act } from '@testing-library/react'
import { useResponsive } from './useResponsive'

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 320,
})

describe('useResponsive', () => {
  test('모바일 너비에서 올바른 상태를 반환한다', () => {
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.breakpoint).toBe('mobile')
  })
  
  test('창 크기 변경 시 상태가 업데이트된다', () => {
    const { result } = renderHook(() => useResponsive())
    
    act(() => {
      window.innerWidth = 1024
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.breakpoint).toBe('desktop')
  })
})
```

### E2E 테스트
```typescript
// responsive-layout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('반응형 레이아웃', () => {
  test('모바일에서 5-tab 네비게이션이 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    
    // 하단 네비게이션 확인
    const bottomNav = page.getByTestId('mobile-navigation')
    await expect(bottomNav).toBeVisible()
    
    // 5개 탭 확인
    const tabs = bottomNav.locator('.nav-tab')
    await expect(tabs).toHaveCount(5)
  })
  
  test('태블릿에서 사이드바가 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')
    
    // 사이드바 확인
    const sidebar = page.getByTestId('tablet-sidebar')
    await expect(sidebar).toBeVisible()
    
    // 분할 뷰 확인
    const splitView = page.getByTestId('split-view')
    await expect(splitView).toBeVisible()
  })
  
  test('데스크탑에서 3-column 레이아웃이 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/dashboard')
    
    // 3개 컬럼 확인
    const leftSidebar = page.getByTestId('left-sidebar')
    const mainContent = page.getByTestId('main-content')
    const rightPanel = page.getByTestId('right-panel')
    
    await expect(leftSidebar).toBeVisible()
    await expect(mainContent).toBeVisible()
    await expect(rightPanel).toBeVisible()
  })
})
```

---

## ⚡ 성능 최적화

### React 최적화 패턴
```typescript
// 1. memo를 활용한 리렌더링 방지
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* 복잡한 렌더링 로직 */}</div>
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return prevProps.data.id === nextProps.data.id
})

// 2. useMemo를 활용한 연산 최적화
const DataList = ({ items, filter }: Props) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter)
  }, [items, filter])
  
  return <List items={filteredItems} />
}

// 3. useCallback을 활용한 함수 메모이제이션
const ParentComponent = () => {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback((id: string) => {
    // 이벤트 핸들러 로직
    setCount(prev => prev + 1)
  }, []) // count 의존성 제거
  
  return <ChildComponent onClick={handleClick} />
}

// 4. lazy loading을 활용한 코드 분할
const HeavyComponent = lazy(() => import('./HeavyComponent'))

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### 이미지 최적화
```typescript
// Next.js Image 컴포넌트 활용
import Image from 'next/image'

const OptimizedImage = ({ src, alt }: Props) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false} // Above-the-fold가 아닌 경우
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### 번들 최적화
```typescript
// 동적 import를 활용한 코드 분할
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js')
  return Chart
}

// 조건부 로딩
const ConditionalFeature = ({ isDesktop }: Props) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  
  useEffect(() => {
    if (isDesktop) {
      import('./DesktopOnlyFeature').then(module => {
        setComponent(() => module.default)
      })
    }
  }, [isDesktop])
  
  return Component ? <Component /> : null
}
```

---

## 🔒 접근성 가이드

### 키보드 네비게이션
```typescript
const AccessibleComponent = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        // 버튼 활성화
        handleClick()
        event.preventDefault()
        break
      case 'Escape':
        // 모달 닫기
        onClose()
        break
      case 'ArrowDown':
        // 다음 항목으로 이동
        focusNextItem()
        event.preventDefault()
        break
    }
  }
  
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-label="커피 기록 카드"
      aria-describedby="record-description"
    >
      {/* 컨텐츠 */}
    </div>
  )
}
```

### ARIA 속성 활용
```typescript
const ModalComponent = ({ isOpen, onClose }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null)
  
  // 포커스 트랩
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      tabIndex={-1}
    >
      <h2 id="modal-title">모달 제목</h2>
      <p id="modal-description">모달 설명</p>
      {/* 모달 컨텐츠 */}
    </div>
  )
}
```

---

## 📊 코드 품질 도구

### ESLint 설정
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Prettier 설정
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript 설정
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 🚀 배포 & CI/CD

### GitHub Actions 워크플로우
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse-ci
```

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 formatting, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 도구 변경

예시:
feat(responsive): 태블릿 1.5-column 레이아웃 구현
fix(mobile): 스와이프 제스처 터치 이벤트 충돌 해결
docs(api): 반응형 훅 API 문서 업데이트
```

---

## 📋 체크리스트

### 코드 리뷰 체크리스트
- [ ] TypeScript 타입 안전성 확보
- [ ] 접근성 (ARIA, 키보드 네비게이션) 준수
- [ ] 성능 최적화 (memo, useMemo, useCallback) 적용
- [ ] 반응형 디자인 정상 동작
- [ ] 테스트 커버리지 80% 이상
- [ ] ESLint/Prettier 규칙 준수
- [ ] 컴포넌트 재사용성 고려
- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 처리
- [ ] 브라우저 호환성 확인

### 배포 전 체크리스트
- [ ] 빌드 에러 없음
- [ ] 모든 테스트 통과
- [ ] Lighthouse 점수 90점 이상
- [ ] 번들 크기 최적화 확인
- [ ] 환경 변수 설정 완료
- [ ] 에러 모니터링 설정
- [ ] 롤백 계획 준비

---

*문서 버전: v2.0 | 최종 수정: 2024-08-04 | 담당: 개발팀*