# NextJS Production Reality Patterns

**Document Status**: Production Implementation Guide  
**Version**: 1.0.0  
**Last Updated**: 2025-08-02  
**Compliance**: Master Playbook v4.0.0 Module 35

## 강제 적용 패턴

### 1. Performance-First Architecture

**Bundle Optimization**:
```javascript
// next.config.js 필수 설정
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}
```

**Dynamic Imports 강제 사용**:
- 모든 클라이언트 컴포넌트는 dynamic import 필수
- loading fallback 명시적 정의
- SSR hydration 오류 방지

### 2. Layout-First Component Strategy

**Root Layout 패턴**:
```typescript
// app/layout.tsx 필수 구조
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>
          <GlobalComponents />
          {children}
          <ClientOnlyComponents />
        </Providers>
      </body>
    </html>
  )
}
```

**Provider 계층화**:
1. ThemeProvider (최상위)
2. ErrorBoundary (에러 처리)
3. NotificationProvider (알림)
4. AuthProvider (인증)

### 3. Error Boundary Strategy

**3-Level Error Handling**:
- Global Error Boundary (app/error.tsx)
- Page Error Boundary (각 page.tsx)
- Component Error Boundary (critical components)

### 4. SEO-First Metadata Pattern

**Metadata 강제 정의**:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://cupnote.vercel.app'),
  title: { default: 'CupNote', template: '%s | CupNote' },
  description: '필수 150자 이상',
  openGraph: { /* 필수 */ },
  twitter: { /* 필수 */ }
}
```

### 5. Client-Server Boundary Rules

**Server Components 우선**:
- 기본적으로 모든 컴포넌트는 Server Component
- 'use client'는 상호작용이 필요한 경우만 사용
- 데이터 페칭은 Server Component에서 수행

**Client Component 최소화**:
- 이벤트 핸들러 필요시만 사용
- useState, useEffect 필요시만 사용
- 외부 라이브러리 사용시만 사용

### 6. Image Optimization Enforcement

**Next/Image 강제 사용**:
```typescript
// 금지: <img> 태그 사용
// 필수: Next/Image 컴포넌트 사용
import Image from 'next/image'

<Image
  src="/coffee.jpg"
  alt="Coffee description"
  width={300}
  height={200}
  priority={false} // 명시적 정의
/>
```

### 7. Route Segment Config

**각 페이지별 설정 강제**:
```typescript
// page.tsx 필수 export
export const dynamic = 'auto' // 명시적 정의
export const revalidate = 3600 // 캐싱 전략
export const runtime = 'nodejs' // 런타임 명시
```

## CupNote 적용 체크리스트

### ✅ 현재 준수 상황
- [x] Dynamic imports for client components
- [x] SEO metadata 완전 구현
- [x] Error boundary 3-level 구현
- [x] Image optimization (Supabase Storage)
- [x] Provider 계층화 완료

### 🔧 개선 필요 사항
- [ ] optimizePackageImports 확장
- [ ] Route segment config 추가
- [ ] Server Component 우선 정책 강화
- [ ] Performance monitoring 강화

## 성능 목표

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s  
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: <1MB total
- **Time to Interactive**: <3s

## 강제 준수 사항

1. **모든 클라이언트 컴포넌트는 dynamic import 필수**
2. **이미지는 Next/Image만 사용 가능**
3. **메타데이터는 모든 페이지에 필수**
4. **Error boundary는 3-level 필수**
5. **성능 모니터링 필수 구현**