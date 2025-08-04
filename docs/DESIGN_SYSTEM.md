# CupNote 하이브리드 디자인 시스템 v2.0

## 🎨 Core Design Philosophy

**"Minimal Structure + Premium Visual Quality"**

1. **미니멀 구조**: 깔끔하고 직관적인 레이아웃
2. **프리미엄 비주얼**: 고급스러운 시각적 품질  
3. **일관된 경험**: 모든 플랫폼에서 동일한 UX

## 🏗️ Layout Architecture

### 기본 페이지 구조
```tsx
<>
  <Navigation showBackButton={boolean} currentPage="page-name" />
  <PageLayout>
    <PageHeader 
      title="페이지 제목"
      description="페이지 설명"
      icon={<Icon />}
    />
    {/* 페이지 콘텐츠 */}
  </PageLayout>
</>
```

### Container System
- **Desktop**: `max-w-7xl mx-auto px-4 py-6 md:py-8`
- **Mobile**: `px-4 py-6 pb-20` (하단 네비게이션 공간 확보)

## 🎨 Visual Design Tokens

### Colors
```css
/* Coffee Palette */
--coffee-50: #faf8f5;
--coffee-100: #f5f1eb;
--coffee-200: #e8ddd1;
--coffee-300: #d4c4b0;
--coffee-400: #b8a082;
--coffee-500: #8b6914;
--coffee-600: #7a5c12;
--coffee-700: #6b4f10;
--coffee-800: #5c430e;

/* Neutral System */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-800: #262626;
--neutral-900: #171717;
```

### Typography
```css
/* Headings */
.heading-xl { @apply text-3xl md:text-4xl font-bold text-coffee-800; }
.heading-lg { @apply text-2xl md:text-3xl font-bold text-coffee-800; }
.heading-md { @apply text-xl md:text-2xl font-semibold text-coffee-800; }
.heading-sm { @apply text-lg font-medium text-coffee-800; }

/* Body Text */
.body-lg { @apply text-base md:text-lg text-coffee-600; }
.body-md { @apply text-sm md:text-base text-coffee-600; }
.body-sm { @apply text-xs md:text-sm text-coffee-500; }
```

### Spacing System
```css
/* Sections */
.section-spacing { @apply mb-8 md:mb-12; }
.card-spacing { @apply p-4 md:p-6; }
.element-spacing { @apply mb-4 md:mb-6; }

/* Button Groups */
.button-group-mobile { @apply gap-3; }  /* 12px */
.button-group-desktop { @apply gap-4; } /* 16px */

/* Icon Spacing */
.icon-text-gap { @apply gap-2; }       /* 8px - consistent icon to text spacing */

/* Container Padding */
.container-mobile { @apply px-4; }     /* 16px */
.container-tablet { @apply sm:px-6; }  /* 24px */
.container-desktop { @apply lg:px-8; } /* 32px */
```

### Touch Target System (Mobile First)
```css
/* Minimum Touch Targets - WCAG AAA & Platform Guidelines */
.touch-target-min { min-height: 44px; min-width: 44px; }  /* iOS/WCAG minimum */
.touch-target-recommended { min-height: 48px; min-width: 48px; } /* Android/Recommended */
.touch-target-large { min-height: 56px; }  /* Large CTAs */

/* Button Size Tokens */
--btn-height-xs-mobile: 44px;  /* Minimum on mobile */
--btn-height-sm-mobile: 44px;  
--btn-height-md-mobile: 48px;  /* Recommended default */
--btn-height-lg-mobile: 52px;
--btn-height-xl-mobile: 56px;

--btn-height-xs-desktop: 36px;  /* Can be smaller on desktop */
--btn-height-sm-desktop: 40px;
--btn-height-md-desktop: 44px;
--btn-height-lg-desktop: 48px;
--btn-height-xl-desktop: 52px;
```

## 🧩 Component Patterns

### 1. PageHeader Component
```tsx
interface PageHeaderProps {
  title: string
  description?: string  
  icon?: React.ReactNode
  action?: React.ReactNode
}

<PageHeader 
  title="성취"
  description="커피 여정의 발자취를 확인해보세요"
  icon={<Trophy className="h-6 w-6" />}
  action={<Button>새 기록</Button>}
/>
```

### 2. Card System
```tsx
// 기본 카드
<Card variant="default" hover>
  <CardContent>
    {/* 콘텐츠 */}
  </CardContent>
</Card>

// 강조 카드  
<Card variant="elevated">
  <CardContent>
    {/* 중요 콘텐츠 */}
  </CardContent>
</Card>
```

### 3. Button System (UnifiedButton)
```tsx
// Size variants with guaranteed touch targets
<UnifiedButton size="xs">  // 44px min height on mobile
<UnifiedButton size="sm">  // 44px min height on mobile  
<UnifiedButton size="md">  // 48px min height on mobile (default)
<UnifiedButton size="lg">  // 52px min height on mobile
<UnifiedButton size="xl">  // 56px min height on mobile
<UnifiedButton size="icon"> // 44x44px minimum square

// Variant styles
<UnifiedButton variant="primary">   // Coffee gradient
<UnifiedButton variant="secondary"> // White with border
<UnifiedButton variant="outline">   // Transparent with border
<UnifiedButton variant="ghost">     // Transparent, no border
<UnifiedButton variant="danger">    // Red for destructive actions
<UnifiedButton variant="hero">      // Large CTA with gradient

// Mobile-optimized examples
<UnifiedButton size="md" fullWidth>
  시작하기
</UnifiedButton>

<UnifiedButton size="icon" variant="ghost">
  <Settings className="h-6 w-6" />
</UnifiedButton>
```

### 4. 하이브리드 스타일링
```css
/* 글래스모피즘 배경 */
.glass-bg {
  @apply bg-white/80 backdrop-blur-sm border border-coffee-200/30;
}

/* 카드 그림자 */
.card-shadow {
  @apply shadow-md hover:shadow-lg transition-shadow duration-200;
}

/* 그라디언트 요소 */
.gradient-accent {
  @apply bg-gradient-to-r from-coffee-400 to-coffee-500;
}

/* Button interactions */
.btn-interactive {
  @apply active:scale-95 transition-transform duration-150;
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm: '640px',   /* 작은 태블릿 */
md: '768px',   /* 태블릿 */
lg: '1024px',  /* 작은 데스크톱 */
xl: '1280px',  /* 일반 데스크톱 */
2xl: '1536px'  /* 큰 데스크톱 */
```

## 🚀 Page Implementation Guide

### 기본 템플릿
```tsx
export default function SamplePage() {
  return (
    <>
      <Navigation showBackButton currentPage="sample" />
      <PageLayout>
        <PageHeader 
          title="페이지 제목"
          description="페이지 설명"
        />
        
        {/* 메인 콘텐츠 */}
        <div className="section-spacing">
          <Card variant="default">
            <CardContent>
              {/* 카드 내용 */}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </>
  )
}
```

## ✅ Design Consistency Checklist

### 모든 페이지가 포함해야 할 요소:
- [ ] Navigation 컴포넌트 (페이지 외부)
- [ ] PageLayout 래퍼
- [ ] PageHeader (제목 + 설명 + 아이콘)
- [ ] 일관된 카드 스타일링
- [ ] 적절한 spacing (section-spacing, element-spacing)
- [ ] 모바일 하단 네비게이션 공간 확보 (pb-20)

### 금지사항:
- ❌ PageLayout 내부에 Navigation 배치
- ❌ 커스텀 container div 추가 (PageLayout이 제공)
- ❌ 페이지별 개별 헤더 디자인
- ❌ 일관성 없는 spacing 시스템