# 하이브리드 컴포넌트 구현 가이드

## 📋 개요

이 문서는 CupNote의 하이브리드 디자인 시스템을 기반으로 한 컴포넌트 구현 가이드입니다. "Minimal Structure + Premium Visual Quality" 철학을 실제 코드로 구현하는 방법을 상세히 설명합니다.

## 🧩 핵심 컴포넌트

### 1. PageHeader 컴포넌트

페이지 상단에 일관된 제목 영역을 제공하는 컴포넌트입니다.

```tsx
interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
}

// 사용 예시
<PageHeader 
  title="내 기록"
  description="커피 기록을 보고 분석해보세요"
  icon={<Coffee className="h-6 w-6" />}
  actions={
    <UnifiedButton variant="primary" size="md">
      새 기록 추가
    </UnifiedButton>
  }
/>
```

**구현 특징:**
- 하이브리드 타이포그래피 적용
- 아이콘과 텍스트의 일관된 간격
- 액션 버튼 영역 제공
- 모바일/데스크탑 반응형 최적화

### 2. Card 컴포넌트

하이브리드 디자인의 핵심 컨테이너 컴포넌트입니다.

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'premium'
  children: ReactNode
  className?: string
}

// 기본 카드
<Card variant="default" className="bg-white/80 backdrop-blur-sm">
  <CardContent className="p-6">
    일반 콘텐츠
  </CardContent>
</Card>

// 프리미엄 카드 (중요한 정보)
<Card variant="elevated" className="shadow-xl">
  <CardContent className="p-8">
    중요한 콘텐츠
  </CardContent>
</Card>

// 특별 카드 (CTA, 성취 등)
<Card variant="premium" className="bg-gradient-to-br from-coffee-50/90 to-amber-50/90">
  <CardContent className="p-6">
    특별한 콘텐츠
  </CardContent>
</Card>
```

**스타일 특징:**
- **글래스모픽 효과**: `backdrop-blur-sm`, `bg-white/90`
- **그라데이션 배경**: 커피 테마 그라데이션 활용
- **그림자 계층**: default < elevated < premium
- **경계선**: `border border-coffee-200/30` 투명도 활용

### 3. UnifiedButton 컴포넌트

통합 버튼 시스템의 핵심 컴포넌트입니다.

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'filter-active' | 'filter-inactive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  loading?: boolean
  fullWidth?: boolean
  ripple?: boolean
}

// Primary 액션 (주요 작업)
<UnifiedButton variant="primary" size="md">
  새 기록 추가
</UnifiedButton>

// Secondary 액션 (보조 작업)
<UnifiedButton variant="secondary" size="md">
  설정
</UnifiedButton>

// 필터 버튼 (활성/비활성)
<UnifiedButton variant="filter-active" size="sm">
  선택됨
</UnifiedButton>

// 위험한 작업
<UnifiedButton variant="danger" size="md">
  삭제
</UnifiedButton>
```

**버튼 시스템 계층:**
1. **Primary**: 주요 액션 (커피 그라데이션)
2. **Secondary**: 보조 액션 (밝은 배경)
3. **Filter-Active**: 활성 필터 (커피 그라데이션)
4. **Filter-Inactive**: 비활성 필터 (투명 배경)
5. **Outline**: 보더만 있는 버튼
6. **Ghost**: 완전 투명 버튼

### 4. Alert 컴포넌트

사용자 피드백을 위한 알림 시스템입니다.

```tsx
interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info'
  children: ReactNode
  onClose?: () => void
  className?: string
}

// 성공 알림
<Alert variant="success" onClose={() => setAlert(null)}>
  데이터가 성공적으로 저장되었습니다.
</Alert>

// 오류 알림
<Alert variant="error" onClose={() => setAlert(null)}>
  파일 업로드에 실패했습니다.
</Alert>
```

**시각적 특징:**
- 하이브리드 글래스모픽 배경
- 색상별 아이콘 자동 매핑
- 부드러운 애니메이션 효과
- 자동 닫기 기능

## 🎨 디자인 토큰 활용

### 1. 글로벌 CSS 변수 (`globals.css`)

```css
/* 버튼 디자인 토큰 */
.btn-base {
  @apply relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  background: var(--btn-primary-bg);
  @apply text-white shadow-md hover:shadow-lg active:scale-95;
}

.btn-secondary {
  background: var(--btn-secondary-bg);
  @apply text-coffee-700 border border-coffee-200 hover:bg-coffee-50 active:scale-95;
}

/* 필터 버튼 토큰 */
.filter-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border;
}

.filter-btn-active {
  background: var(--filter-active-bg);
  @apply text-white border-coffee-400 shadow-md;
}

.filter-btn-inactive {
  background: var(--filter-inactive-bg);
  @apply text-coffee-700 border-coffee-200/50 hover:bg-white hover:border-coffee-300;
}

/* 텍스트 대비율 시스템 */
.text-high-contrast {
  color: rgb(var(--text-high-contrast));
}

.text-medium-contrast {
  color: rgb(var(--text-medium-contrast));
}

.text-on-dark {
  color: rgb(var(--text-on-dark));
}

.text-on-light {
  color: rgb(var(--text-on-light));
}
```

### 2. 크기 시스템

```css
/* 버튼 크기 */
.btn-xs { @apply px-2 py-1 text-xs; }
.btn-sm { @apply px-3 py-1.5 text-sm; }
.btn-md { @apply px-4 py-2 text-sm; }
.btn-lg { @apply px-6 py-2.5 text-base; }
.btn-xl { @apply px-8 py-3 text-lg; }

/* 아이콘 크기 */
.icon { @apply h-4 w-4; }
.icon-sm { @apply h-3 w-3; }
.icon-lg { @apply h-5 w-5; }
```

## 🎯 구현 베스트 프랙티스

### 1. 필터 버튼 구현

```tsx
// ✅ 올바른 방법 - 통합 디자인 토큰 사용
const FilterButton = ({ isActive, children, onClick }) => (
  <button
    onClick={onClick}
    className={`btn-base filter-btn ${isActive ? 'filter-btn-active' : 'filter-btn-inactive'}`}
  >
    <Icon className="icon" />
    <span className={isActive ? 'text-on-dark' : 'text-high-contrast'}>
      {children}
    </span>
  </button>
)

// ❌ 잘못된 방법 - 인라인 스타일
const FilterButton = ({ isActive, children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: isActive ? '#8b4513' : 'rgba(255,255,255,0.9)',
      color: isActive ? 'white' : '#2d150f'
    }}
  >
    {children}
  </button>
)
```

### 2. 카드 레이아웃 구현

```tsx
// ✅ 올바른 방법 - 하이브리드 스타일
<Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
  <CardContent className="p-6">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-high-contrast">제목</h3>
        <p className="text-medium-contrast">설명</p>
      </div>
    </div>
  </CardContent>
</Card>

// ❌ 잘못된 방법 - 하드코딩된 스타일
<div className="bg-white p-4 rounded shadow">
  <h3 className="text-black font-bold">제목</h3>
  <p className="text-gray-600">설명</p>
</div>
```

### 3. 모바일 최적화

```tsx
// ✅ 모바일/데스크탑 반응형
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <Card className="bg-white/70 md:bg-white/80">
    <CardContent className="p-4 md:p-6">
      {/* 콘텐츠 */}
    </CardContent>
  </Card>
</div>

// ✅ 터치 최적화
<button className="btn-base btn-primary active:scale-95 transition-transform duration-100">
  터치 버튼
</button>
```

## 🔍 접근성 구현

### 1. 고대비 텍스트

```tsx
// ✅ 접근성 준수
<h1 className="text-high-contrast">중요한 제목</h1>
<p className="text-medium-contrast">일반 본문</p>
<span className="text-on-dark">어두운 배경 위 텍스트</span>

// ❌ 접근성 위반
<h1 className="text-gray-400">희미한 제목</h1>
<p className="text-gray-300">읽기 어려운 본문</p>
```

### 2. 키보드 접근성

```tsx
// ✅ 키보드 네비게이션 지원
<button
  className="btn-base btn-primary focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  접근 가능한 버튼
</button>
```

### 3. ARIA 레이블

```tsx
// ✅ 스크린 리더 지원
<button
  aria-label="새 커피 기록 추가"
  aria-describedby="add-record-description"
  className="btn-base btn-primary"
>
  <Plus className="icon" />
  <span className="sr-only">새 기록 추가</span>
</button>
<div id="add-record-description" className="sr-only">
  새로운 커피 경험을 기록할 수 있습니다
</div>
```

## 📊 성능 최적화

### 1. CSS 최적화

```css
/* ✅ CSS 변수로 런타임 성능 향상 */
:root {
  --btn-primary-bg: linear-gradient(135deg, rgb(139 69 19), rgb(109 52 16));
  --transition-standard: all 0.2s ease-in-out;
}

.btn-primary {
  background: var(--btn-primary-bg);
  transition: var(--transition-standard);
}

/* ❌ 중복 스타일 */
.button1 { background: linear-gradient(135deg, rgb(139 69 19), rgb(109 52 16)); }
.button2 { background: linear-gradient(135deg, rgb(139 69 19), rgb(109 52 16)); }
```

### 2. 컴포넌트 최적화

```tsx
// ✅ React.memo로 불필요한 리렌더링 방지
const OptimizedCard = React.memo(({ title, content, isActive }) => (
  <Card variant="default">
    <CardContent>
      <h3 className="text-high-contrast">{title}</h3>
      <p className="text-medium-contrast">{content}</p>
    </CardContent>
  </Card>
))

// ✅ 조건부 클래스명 최적화
const getButtonClass = useCallback((isActive: boolean) => 
  `btn-base filter-btn ${isActive ? 'filter-btn-active' : 'filter-btn-inactive'}`,
  []
)
```

## 🎨 커스텀 컴포넌트 생성 가이드

### 1. 새 컴포넌트 생성 템플릿

```tsx
/**
 * [ComponentName] - 하이브리드 디자인 시스템
 * [간단한 설명]
 */
'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '../ui/Card'

interface ComponentNameProps {
  // Props 정의
  children?: ReactNode
  variant?: 'default' | 'premium'
  className?: string
}

export default function ComponentName({
  children,
  variant = 'default',
  className = ''
}: ComponentNameProps) {
  return (
    <Card 
      variant={variant}
      className={`bg-white/80 backdrop-blur-sm border border-coffee-200/30 ${className}`}
    >
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}
```

### 2. 스타일 가이드라인

- **색상**: 커피 테마 팔레트 활용
- **간격**: Tailwind 기본 간격 시스템 (4px 단위)
- **그림자**: 계층별 그림자 시스템
- **애니메이션**: 200ms 기본 트랜지션
- **경계선**: 투명도 활용 (`/30`, `/50` 등)

## 🔄 업데이트 가이드

### 1. 디자인 토큰 업데이트

새로운 디자인 토큰 추가 시:

1. `globals.css`에 CSS 변수 추가
2. 해당 컴포넌트 클래스 정의
3. TypeScript 타입 업데이트
4. 문서 업데이트

### 2. 컴포넌트 마이그레이션

기존 컴포넌트를 하이브리드 시스템으로 마이그레이션:

1. 인라인 스타일 → CSS 클래스
2. 하드코딩된 색상 → 디자인 토큰
3. 접근성 개선 사항 적용
4. 테스트 케이스 업데이트

---

이 가이드를 통해 CupNote의 하이브리드 디자인 시스템을 일관되게 구현하고 유지할 수 있습니다.