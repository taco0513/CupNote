# 온보딩 시스템 문서

_최종 업데이트: 2025-01-30_

## 🎯 온보딩 개요

CupNote의 온보딩은 첫 사용자가 앱의 핵심 기능을 빠르게 이해하고 시작할 수 있도록 돕는 4단계 가이드입니다.

## 📱 온보딩 플로우

### **자동 리다이렉트 로직**

```typescript
// app/page.tsx
useEffect(() => {
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
  if (!hasCompletedOnboarding) {
    router.push('/onboarding')
  }
}, [router])
```

## 🎨 4단계 구성

### **Step 1: 환영 메시지**

```typescript
{
  icon: Coffee,
  title: "CupNote에 오신 것을 환영합니다!",
  description: "당신의 커피 여정을 기록하고 성장하는 공간입니다.",
  content: "매일 마시는 커피가 특별한 경험이 되도록, CupNote가 함께합니다."
}
```

**주요 요소**:

- 앱 아이덴티티 소개
- 핵심 가치 전달
- 친근한 톤 설정

### **Step 2: 기록 모드 소개**

```typescript
{
  icon: Zap,
  title: "나에게 맞는 기록 방법을 선택하세요",
  description: "상황에 따라 3가지 모드를 자유롭게 사용할 수 있어요.",
  content: (
    <div className="space-y-4">
      <ModeCard mode="cafe" />
      <ModeCard mode="homecafe" />
      <ModeCard mode="lab" />
    </div>
  )
}
```

**모드 설명**:

- ☕ Cafe: 카페에서 간단히 (3-5분)
- 🏠 HomeCafe: 집에서 여유롭게 (5-8분)
- 🔬 Lab: 전문적으로 분석 (10-15분)

### **Step 3: 핵심 기능 안내**

```typescript
{
  icon: Target,
  title: "커피 기록이 쌓일수록 성장합니다",
  description: "Match Score로 기록의 완성도를 확인하고 성취를 달성하세요.",
  content: (
    <div className="grid grid-cols-2 gap-4">
      <FeatureCard
        icon={Trophy}
        title="성취 시스템"
        description="배지와 레벨로 성장 확인"
      />
      <FeatureCard
        icon={BarChart3}
        title="통계 분석"
        description="나의 커피 취향 발견"
      />
    </div>
  )
}
```

### **Step 4: 시작하기**

```typescript
{
  icon: Rocket,
  title: "준비되셨나요?",
  description: "지금 바로 첫 커피를 기록해보세요!",
  content: "언제든 설정에서 도움말을 다시 볼 수 있어요."
}
```

## 🎮 인터랙션 디자인

### **진행 인디케이터**

```typescript
<div className="flex space-x-2 mb-8">
  {steps.map((_, index) => (
    <div
      key={index}
      className={`h-2 flex-1 rounded-full transition-colors ${
        index === currentStep
          ? 'bg-coffee-600'
          : index < currentStep
          ? 'bg-coffee-400'
          : 'bg-coffee-200'
      }`}
    />
  ))}
</div>
```

### **네비게이션 버튼**

- **다음**: 다음 단계로 진행
- **건너뛰기**: 온보딩 종료
- **이전**: 이전 단계로 (2단계부터)

### **애니메이션**

```typescript
<div className={`transition-all duration-300 ${
  transitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
}`}>
  {/* 콘텐츠 */}
</div>
```

## 💾 상태 관리

### **완료 상태 저장**

```typescript
const completeOnboarding = () => {
  localStorage.setItem('hasCompletedOnboarding', 'true')
  router.push('/')
}
```

### **재방문 처리**

```typescript
const skipOnboarding = () => {
  if (window.confirm('온보딩을 건너뛰시겠습니까?')) {
    completeOnboarding()
  }
}
```

## 🎨 디자인 특징

### **비주얼 계층**

1. 큰 아이콘 (64px)
2. 명확한 제목
3. 부제목 설명
4. 상세 콘텐츠

### **색상 사용**

- 주요 액션: coffee-600
- 진행 상태: coffee-400
- 비활성: coffee-200
- 배경: coffee-50

### **모바일 최적화**

- 세로 스크롤 지원
- 터치 제스처 (스와이프 예정)
- 반응형 그리드
- 안전 영역 고려

## 🔧 기술적 구현

### **컴포넌트 구조**

```typescript
const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const steps = [
    { icon: Coffee, title: "환영", ... },
    { icon: Zap, title: "모드", ... },
    { icon: Target, title: "기능", ... },
    { icon: Rocket, title: "시작", ... }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      {/* 온보딩 UI */}
    </div>
  )
}
```

### **접근성 고려**

- 키보드 네비게이션
- 스크린 리더 지원
- 충분한 색상 대비
- 포커스 관리

## 🚀 개선 계획

1. **인터랙티브 튜토리얼**: 실제 기능 체험
2. **개인화**: 사용자 선호 설정
3. **프로그레시브**: 단계별 기능 소개
4. **스킵 가능**: 숙련자용 빠른 설정
5. **다국어 지원**: 한국어/영어 선택
