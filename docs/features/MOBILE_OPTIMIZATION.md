# 모바일 최적화 가이드

_최종 업데이트: 2025-01-30_

## 📱 모바일 최적화 개요

CupNote는 모바일 우선(Mobile-First) 접근 방식으로 개발되었으며, 스마트폰에서 최적의 사용 경험을 제공합니다.

## 🎨 반응형 디자인 시스템

### **브레이크포인트**

```css
/* Tailwind CSS 기본 브레이크포인트 */
- sm: 640px   /* 태블릿 세로 */
- md: 768px   /* 태블릿 가로 */
- lg: 1024px  /* 노트북 */
- xl: 1280px  /* 데스크톱 */
- 2xl: 1536px /* 대형 모니터 */
```

### **모바일 우선 클래스 패턴**

```typescript
// 텍스트 크기
'text-2xl md:text-4xl' // 모바일: 2xl, 태블릿 이상: 4xl

// 패딩
'p-4 md:p-6' // 모바일: 16px, 태블릿 이상: 24px

// 그리드
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // 반응형 그리드
```

## 🧭 모바일 네비게이션

### **하단 네비게이션 바**

```typescript
// MobileNavigation.tsx
const navItems = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/stats', icon: BarChart3, label: '통계' },
  { href: '/mode-selection', icon: Coffee, label: '기록' }, // 강조
  { href: '/achievements', icon: Trophy, label: '성취' },
  { href: '/settings', icon: Settings, label: '설정' },
]
```

### **특징**

- 고정 하단 위치 (fixed bottom)
- 5개 주요 메뉴
- 기록 버튼 특별 디자인
- Safe Area 지원

## 👆 터치 최적화

### **터치 타겟 크기**

```css
/* 최소 44px (Apple HIG 권장) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### **터치 피드백**

```typescript
// mobile.ts
export const addTouchFeedback = (element: HTMLElement) => {
  element.addEventListener('touchstart', () => {
    element.classList.add('touch-active')
  })

  element.addEventListener('touchend', () => {
    setTimeout(() => {
      element.classList.remove('touch-active')
    }, 150)
  })
}
```

## 📱 Safe Area 지원

### **CSS 환경 변수**

```css
/* globals.css */
.safe-area-inset {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
```

### **레이아웃 적용**

```typescript
// layout.tsx
<div className="pb-16 md:pb-0 safe-area-inset">
  {children}
</div>
```

## 🔍 입력 필드 최적화

### **줌 방지**

```css
/* 16px 이상으로 설정하여 iOS 줌 방지 */
@media (max-width: 768px) {
  input[type='text'],
  input[type='email'],
  input[type='number'],
  textarea,
  select {
    font-size: 16px !important;
  }
}
```

### **부드러운 스크롤**

```typescript
// mobile.ts
export const enableSmoothScroll = (element: HTMLElement) => {
  ;(element.style as any).webkitOverflowScrolling = 'touch'
  element.style.overflowY = 'auto'
}
```

## 📊 성능 최적화

### **이미지 최적화**

- Next.js Image 컴포넌트 사용
- WebP 포맷 자동 변환
- Lazy loading 기본 적용
- 반응형 srcset 자동 생성

### **번들 크기**

- 코드 스플리팅 자동 적용
- 동적 임포트 활용
- Tree shaking 최적화

### **렌더링 최적화**

- React.memo 활용
- useMemo, useCallback 최적화
- 가상 스크롤 (대량 리스트)

## 🎯 모바일 특화 기능

### **장치 감지**

```typescript
// mobile.ts
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
```

### **뷰포트 설정**

```typescript
// layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}
```

## 📐 레이아웃 패턴

### **모바일 컨테이너**

```css
.container {
  max-width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
  }
}
```

### **카드 레이아웃**

```typescript
// 반응형 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## 🔧 개발 팁

### **모바일 디버깅**

1. Chrome DevTools 모바일 에뮬레이터
2. 실제 디바이스 테스트
3. BrowserStack 크로스 브라우저 테스트

### **성능 측정**

1. Lighthouse 모바일 점수
2. Core Web Vitals
3. 실제 사용자 메트릭

## 🚀 PWA 준비

### **다음 단계**

1. Service Worker 구현
2. Manifest.json 설정
3. 오프라인 지원
4. 푸시 알림
5. 앱 아이콘 생성

## ✅ 체크리스트

- [x] 반응형 브레이크포인트
- [x] 터치 타겟 크기 (44px+)
- [x] 하단 네비게이션
- [x] Safe Area 지원
- [x] 입력 필드 줌 방지
- [x] 부드러운 스크롤
- [x] 모바일 우선 CSS
- [ ] Service Worker
- [ ] 오프라인 지원
- [ ] 설치 프롬프트
