# 라우팅 구조

## 🗺️ 전체 라우팅 아키텍처

TastingFlow는 모드별 차별화와 통합 플로우를 지원하는 라우팅 구조를 가집니다.

### 기본 라우팅 구조

```typescript
// Next.js App Router 기반 구조
app/
├── page.tsx                 // 홈페이지 (/)
├── mode-selection/
│   └── page.tsx            // 모드 선택 (/mode-selection)
└── record/
    ├── step1/
    │   └── page.tsx        // 커피 인포 (/record/step1)
    ├── step2/
    │   └── page.tsx        // 모드별 핵심 (/record/step2)
    ├── step3/
    │   └── page.tsx        // 맛 & 감각 (/record/step3)
    └── step4/
        └── page.tsx        // 노트 & 완료 (/record/step4)
```

## 📍 세부 라우팅 정의

### 1. 홈페이지 (`/`)

```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <Hero />
      <QuickActions>
        <Link href="/mode-selection">새로운 기록 시작</Link>
        <Link href="/demo">데모 체험하기</Link>
      </QuickActions>
      <RecentRecords />
    </div>
  )
}
```

### 2. 모드 선택 (`/mode-selection`)

```typescript
// app/mode-selection/page.tsx
export default function ModeSelectionPage() {
  const handleModeSelect = (mode: CoffeeMode) => {
    // 선택된 모드를 쿼리 파라미터로 전달
    router.push(`/record/step1?mode=${mode}`)
  }

  return (
    <ModeSelection onModeSelect={handleModeSelect} />
  )
}
```

### 3. Step1: 커피 인포 (`/record/step1?mode={cafe|homecafe|pro}`)

```typescript
// app/record/step1/page.tsx
export default function Step1Page() {
  const searchParams = useSearchParams()
  const selectedMode = searchParams.get('mode') as CoffeeMode

  const handleNext = () => {
    // 모드 정보 유지하며 다음 단계로
    router.push('/record/step2')
  }

  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <CoffeeInfoForm 
          mode={selectedMode}
          onNext={handleNext}
        />
      </Suspense>
    </ProtectedRoute>
  )
}
```

### 4. Step2: 모드별 핵심 (`/record/step2`)

```typescript
// app/record/step2/page.tsx
export default function Step2Page() {
  const coffeeRecordStore = useCoffeeRecordStore()
  const mode = coffeeRecordStore.currentSession.mode

  // 모드별 컴포넌트 렌더링
  const renderModeSpecificContent = () => {
    switch (mode) {
      case 'cafe':
        return <CafeModeStep2 />
      case 'homecafe':
        return <HomeCafeModeStep2 />
      case 'pro':
        return <ProModeStep2 />
      default:
        return <DefaultStep2 />
    }
  }

  return (
    <ProtectedRoute>
      <div className="step2-container">
        <StepHeader step={2} mode={mode} />
        {renderModeSpecificContent()}
        <StepNavigation />
      </div>
    </ProtectedRoute>
  )
}
```

### 5. Step3: 맛 & 감각 (`/record/step3`)

```typescript
// app/record/step3/page.tsx
export default function Step3Page() {
  const mode = useCoffeeRecordStore().currentSession.mode

  return (
    <ProtectedRoute>
      <div className="step3-container">
        <StepHeader step={3} mode={mode} />
        
        {/* 공통: 향미 선택 */}
        <FlavorSelection />
        
        {/* 공통: 한국어 감각 표현 */}
        <SensoryExpression />
        
        {/* Pro 모드만: SCA 평가 */}
        {mode === 'pro' && <SCAEvaluation />}
        
        <StepNavigation />
      </div>
    </ProtectedRoute>
  )
}
```

### 6. Step4: 노트 & 완료 (`/record/step4`)

```typescript
// app/record/step4/page.tsx
export default function Step4Page() {
  const mode = useCoffeeRecordStore().currentSession.mode

  const renderResultSection = () => {
    switch (mode) {
      case 'cafe':
        return <CafeResult />
      case 'homecafe':
        return <HomeCafeResult />
      case 'pro':
        return <ProResult />
    }
  }

  return (
    <ProtectedRoute>
      <div className="step4-container">
        <PersonalNotes mode={mode} />
        <RoasterNotes />
        {renderResultSection()}
      </div>
    </ProtectedRoute>
  )
}
```

## 🔒 라우트 보호 및 인증

### Protected Route 구현

```typescript
// components/auth/ProtectedRoute.tsx
export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

### 데모 모드 라우팅

```typescript
// app/demo/[...slug]/page.tsx
export default function DemoPage({ 
  params 
}: { 
  params: { slug: string[] } 
}) {
  // 데모 모드는 인증 없이 접근 가능
  const demoStep = params.slug?.[0] || 'mode-selection'
  
  return (
    <DemoProvider>
      <DemoStepComponent step={demoStep} />
    </DemoProvider>
  )
}
```

## 🌊 데이터 흐름과 라우팅

### 세션 상태 관리

```typescript
// hooks/useCoffeeRecordSession.ts
export function useCoffeeRecordSession() {
  const router = useRouter()
  const pathname = usePathname()

  // 현재 단계 파악
  const getCurrentStep = (): number => {
    if (pathname.includes('step1')) return 1
    if (pathname.includes('step2')) return 2
    if (pathname.includes('step3')) return 3
    if (pathname.includes('step4')) return 4
    return 0
  }

  // 다음 단계로 이동
  const goToNextStep = () => {
    const currentStep = getCurrentStep()
    const nextStep = currentStep + 1
    
    if (nextStep <= 4) {
      router.push(`/record/step${nextStep}`)
    }
  }

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    const currentStep = getCurrentStep()
    const prevStep = currentStep - 1
    
    if (prevStep >= 1) {
      router.push(`/record/step${prevStep}`)
    } else {
      router.push('/mode-selection')
    }
  }

  return {
    getCurrentStep,
    goToNextStep,
    goToPreviousStep
  }
}
```

### URL 파라미터 관리

```typescript
// utils/routingUtils.ts
export interface RouteParams {
  mode?: CoffeeMode
  step?: number
  demo?: boolean
}

export function buildRecordRoute(params: RouteParams): string {
  const { mode, step, demo } = params
  
  if (demo) {
    return step ? `/demo/step${step}` : '/demo'
  }
  
  if (step) {
    const query = mode ? `?mode=${mode}` : ''
    return `/record/step${step}${query}`
  }
  
  return '/record/step1'
}

export function parseRouteParams(
  pathname: string, 
  searchParams: URLSearchParams
): RouteParams {
  const isDemo = pathname.startsWith('/demo')
  const stepMatch = pathname.match(/step(\d+)/)
  const step = stepMatch ? parseInt(stepMatch[1]) : undefined
  const mode = searchParams.get('mode') as CoffeeMode
  
  return { mode, step, demo: isDemo }
}
```

## 🔄 네비게이션 컴포넌트

### Step Navigation

```typescript
// components/navigation/StepNavigation.tsx
export default function StepNavigation() {
  const { getCurrentStep, goToNextStep, goToPreviousStep } = 
    useCoffeeRecordSession()
  const { validateCurrentStep } = useCoffeeRecordValidation()

  const currentStep = getCurrentStep()
  const canGoNext = validateCurrentStep()

  const handleNext = () => {
    if (canGoNext) {
      goToNextStep()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToPreviousStep()
    } else {
      router.push('/mode-selection')
    }
  }

  return (
    <div className="step-navigation">
      <button onClick={handlePrevious}>
        이전
      </button>
      
      <div className="progress-indicator">
        {currentStep} / 4
      </div>
      
      <button 
        onClick={handleNext}
        disabled={!canGoNext}
      >
        {currentStep === 4 ? '완료' : '다음'}
      </button>
    </div>
  )
}
```

### Breadcrumb Navigation

```typescript
// components/navigation/Breadcrumb.tsx
export default function Breadcrumb() {
  const pathname = usePathname()
  const { mode } = useCoffeeRecordStore()

  const getBreadcrumbItems = () => {
    const items = [{ label: '홈', href: '/' }]
    
    if (pathname.includes('mode-selection')) {
      items.push({ label: '모드 선택', href: '/mode-selection' })
    }
    
    if (pathname.includes('record')) {
      items.push({ label: '모드 선택', href: '/mode-selection' })
      
      if (pathname.includes('step1')) {
        items.push({ label: '커피 정보', href: '/record/step1' })
      }
      // ... 다른 단계들
    }
    
    return items
  }

  return (
    <nav className="breadcrumb">
      {getBreadcrumbItems().map((item, index) => (
        <span key={index}>
          <Link href={item.href}>{item.label}</Link>
          {index < getBreadcrumbItems().length - 1 && ' > '}
        </span>
      ))}
    </nav>
  )
}
```

## 🔧 개발자 도구

### 라우팅 디버깅

```typescript
// hooks/useRoutingDebug.ts (개발 환경용)
export function useRoutingDebug() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentSession } = useCoffeeRecordStore()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🗺️ Routing Debug')
      console.log('Pathname:', pathname)
      console.log('Search Params:', Object.fromEntries(searchParams))
      console.log('Current Session:', currentSession)
      console.log('Parsed Route:', parseRouteParams(pathname, searchParams))
      console.groupEnd()
    }
  }, [pathname, searchParams, currentSession])
}
```

### 라우팅 테스트

```typescript
// __tests__/routing.test.ts
describe('TastingFlow Routing', () => {
  test('모드 선택 후 step1으로 이동', () => {
    const { result } = renderHook(() => useRouter())
    
    act(() => {
      result.current.push('/record/step1?mode=cafe')
    })
    
    expect(result.current.pathname).toBe('/record/step1')
    expect(result.current.searchParams.get('mode')).toBe('cafe')
  })

  test('Step 네비게이션 흐름', () => {
    const { result } = renderHook(() => useCoffeeRecordSession())
    
    // Step 1 → Step 2
    act(() => {
      result.current.goToNextStep()
    })
    
    expect(result.current.getCurrentStep()).toBe(2)
  })
})
```

---

**📅 문서 생성**: 2025-07-31  
**버전**: v1.0.0-rc  
**구현 상태**: Production Ready