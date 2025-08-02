# Hybrid Component Guide

## 🎨 Overview

CupNote의 하이브리드 디자인 시스템 구현을 위한 핵심 컴포넌트 사용 가이드입니다. "Minimal Structure + Premium Visual Quality" 철학을 바탕으로 설계되었습니다.

## 🧩 Core Components

### PageHeader Component

모든 페이지에서 일관된 헤더를 제공하는 핵심 컴포넌트입니다.

#### 기본 사용법
```tsx
import PageHeader from '../components/ui/PageHeader'
import { Coffee } from 'lucide-react'

<PageHeader 
  title="내 기록"
  description="커피 기록을 보고 분석해보세요"
  icon={<Coffee className="h-6 w-6" />}
/>
```

#### Props Interface
```typescript
interface PageHeaderProps {
  title: string                    // 페이지 제목 (필수)
  description?: string             // 페이지 설명 (선택)
  icon?: React.ReactNode          // 아이콘 (선택)
  action?: React.ReactNode        // 액션 버튼 (선택)
  className?: string              // 추가 CSS 클래스
  variant?: 'default' | 'compact' // 표시 스타일
}
```

#### 사용 예시
```tsx
// 기본 헤더
<PageHeader title="설정" />

// 아이콘과 설명 포함
<PageHeader 
  title="성취"
  description="커피 여정의 성취를 확인하세요"
  icon={<Trophy className="h-6 w-6" />}
/>

// 액션 버튼 포함
<PageHeader 
  title="내 기록"
  description="커피 기록 관리"
  icon={<Coffee className="h-6 w-6" />}
  action={
    <UnifiedButton variant="primary">
      새 기록 추가
    </UnifiedButton>
  }
/>
```

### Card Component

하이브리드 디자인의 핵심인 글래스모픽 카드 컴포넌트입니다.

#### 기본 사용법
```tsx
import { Card, CardContent } from '../components/ui/Card'

<Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
  <CardContent className="p-6">
    <h3>카드 제목</h3>
    <p>카드 내용</p>
  </CardContent>
</Card>
```

#### Variants
```tsx
// 기본 카드 (일반적인 용도)
<Card variant="default" />

// 승격된 카드 (중요한 콘텐츠)
<Card variant="elevated" />

// 상호작용 카드 (클릭 가능)
<Card variant="interactive" />
```

#### 하이브리드 스타일 클래스
```tsx
// 표준 하이브리드 카드
className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md"

// 프리미엄 카드
className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg"

// 인터랙티브 카드
className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-shadow"

// 그라데이션 카드
className="bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm border border-blue-200/50 shadow-md"
```

### UnifiedButton Component

일관된 버튼 스타일을 제공하는 통합 버튼 컴포넌트입니다.

#### 기본 사용법
```tsx
import UnifiedButton from '../components/ui/UnifiedButton'

<UnifiedButton variant="primary" size="medium">
  확인
</UnifiedButton>
```

#### Variants
```tsx
// 주요 액션 (하이브리드 그라데이션)
<UnifiedButton variant="primary" />

// 보조 액션
<UnifiedButton variant="secondary" />

// 외곽선 버튼
<UnifiedButton variant="outline" />

// 위험한 액션
<UnifiedButton variant="danger" />
```

#### Sizes
```tsx
<UnifiedButton size="small" />   // 작은 버튼
<UnifiedButton size="medium" />  // 기본 크기
<UnifiedButton size="large" />   // 큰 버튼
```

#### 하이브리드 스타일 예시
```tsx
// 프리미엄 그라데이션 버튼
<UnifiedButton 
  variant="primary"
  className="bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
>
  시작하기
</UnifiedButton>

// 글래스모픽 보조 버튼
<UnifiedButton 
  variant="outline"
  className="bg-white/50 hover:bg-coffee-50/80 border-coffee-200/50"
>
  취소
</UnifiedButton>
```

## 🎨 Hybrid Design Patterns

### 1. Glassmorphism Effect
하이브리드 디자인의 핵심 시각적 효과입니다.

```css
/* 기본 글래스모픽 */
.glass-basic {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 119, 101, 0.3);
}

/* 프리미엄 글래스모픽 */
.glass-premium {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 119, 101, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### 2. Gradient Buttons
프리미엄 느낌의 그라데이션 버튼 패턴입니다.

```css
/* 커피 테마 그라데이션 */
.gradient-coffee {
  background: linear-gradient(to right, #8B7765, #6B5B47);
}

/* 호버 효과 포함 */
.gradient-coffee:hover {
  background: linear-gradient(to right, #6B5B47, #5D4E37);
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### 3. Smooth Transitions
모든 상호작용에 부드러운 전환 효과를 적용합니다.

```css
/* 표준 전환 */
.smooth-transition {
  transition: all 0.2s ease-in-out;
}

/* 스케일 전환 */
.scale-transition {
  transition: transform 0.2s ease-in-out;
}
.scale-transition:hover {
  transform: scale(1.05);
}
```

## 📱 Mobile Optimization

### Touch-Friendly Components
모바일 환경에 최적화된 컴포넌트 패턴입니다.

```tsx
// 터치 친화적 카드
<Card className="active:scale-95 active:bg-coffee-50 transition-all duration-200">
  <CardContent className="p-4 min-h-[44px]">
    {/* 최소 44px 터치 영역 보장 */}
  </CardContent>
</Card>

// 터치 피드백 버튼
<UnifiedButton 
  className="min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
>
  버튼
</UnifiedButton>
```

### Responsive Design
반응형 디자인을 위한 컴포넌트 패턴입니다.

```tsx
// 반응형 그리드
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id} />
  ))}
</div>

// 반응형 패딩/마진
<Card className="p-4 md:p-6 lg:p-8">
  <CardContent className="space-y-4 md:space-y-6">
    {content}
  </CardContent>
</Card>
```

## 🎯 Best Practices

### 1. Consistent Spacing
일관된 간격 시스템을 사용합니다.

```tsx
// Tailwind 간격 스케일 사용
className="space-y-4"      // 16px
className="space-y-6"      // 24px
className="space-y-8"      // 32px

// 패딩 일관성
className="p-4"            // 16px (모바일)
className="md:p-6"         // 24px (태블릿)
className="lg:p-8"         // 32px (데스크톱)
```

### 2. Color Harmony
커피 테마 색상 팔레트를 일관되게 사용합니다.

```tsx
// 텍스트 색상
className="text-coffee-800"    // 제목
className="text-coffee-600"    // 본문
className="text-coffee-400"    // 보조 텍스트

// 배경 색상
className="bg-coffee-50/80"    // 연한 배경
className="bg-coffee-100/80"   // 약간 진한 배경
className="bg-coffee-500"      // 액센트 색상
```

### 3. Interactive States
모든 인터랙티브 요소에 적절한 상태를 제공합니다.

```tsx
// 호버 상태
className="hover:bg-coffee-50/80 hover:shadow-lg transition-all duration-200"

// 포커스 상태 (키보드 접근성)
className="focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2"

// 액티브 상태 (터치 피드백)
className="active:scale-95 active:bg-coffee-100/80"

// 비활성 상태
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

## 🔧 Implementation Examples

### 완전한 페이지 구조
```tsx
import PageLayout from '../components/ui/PageLayout'
import PageHeader from '../components/ui/PageHeader'
import { Card, CardContent } from '../components/ui/Card'
import UnifiedButton from '../components/ui/UnifiedButton'

export default function ExamplePage() {
  return (
    <>
      <Navigation showBackButton currentPage="example" />
      <PageLayout>
        <PageHeader 
          title="예시 페이지"
          description="하이브리드 디자인 적용 예시"
          icon={<Coffee className="h-6 w-6" />}
        />

        {/* 메인 콘텐츠 카드 */}
        <Card variant="elevated" className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-coffee-800 mb-4">콘텐츠 제목</h2>
            <p className="text-coffee-600 mb-6">콘텐츠 설명</p>
            
            <div className="flex space-x-4">
              <UnifiedButton 
                variant="primary"
                className="bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 shadow-md hover:shadow-lg"
              >
                주요 액션
              </UnifiedButton>
              
              <UnifiedButton 
                variant="outline"
                className="bg-white/50 hover:bg-coffee-50/80 border-coffee-200/50"
              >
                보조 액션
              </UnifiedButton>
            </div>
          </CardContent>
        </Card>

        {/* 그리드 레이아웃 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} variant="interactive" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-coffee-800">카드 {i}</h3>
                <p className="text-sm text-coffee-600 mt-1">설명 텍스트</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    </>
  )
}
```

## 📚 Related Documentation

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - 전체 디자인 시스템 가이드
- [MOBILE_UX_GUIDE.md](./MOBILE_UX_GUIDE.md) - 모바일 UX 최적화
- [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) - 전체 컴포넌트 라이브러리
- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) - 접근성 가이드라인

---

**📅 Created**: 2025-08-03  
**✏️ Author**: Claude Code SuperClaude  
**🔄 Version**: 1.0.0  
**📋 Status**: Complete