# 다크 모드 & 테마 시스템

> 라이트/다크/시스템 모드를 지원하는 완전한 테마 시스템

## 📋 개요

CupNote의 테마 시스템은 사용자의 선호도와 환경에 맞춰 3가지 테마 모드를 제공합니다:
- **라이트 모드**: 밝은 배경의 기본 테마
- **다크 모드**: 어두운 배경으로 눈의 피로 감소 및 배터리 절약
- **시스템 모드**: 사용자 기기의 시스템 설정을 자동으로 따름

## 🏗️ 아키텍처

### 1. ThemeContext 시스템

```typescript
// 테마 타입 정의
type Theme = 'light' | 'dark' | 'system'

// 컨텍스트 인터페이스
interface ThemeContextType {
  theme: Theme              // 사용자가 선택한 테마
  effectiveTheme: 'light' | 'dark'  // 실제 적용된 테마
  setTheme: (theme: Theme) => void   // 테마 변경 함수
}
```

### 2. CSS Variables 기반 색상 시스템

```css
/* 라이트 모드 */
:root {
  --color-background: 255 255 255;
  --color-foreground: 17 24 39;
  --color-primary: 111 78 55;
  /* ... 기타 색상 변수 */
}

/* 다크 모드 */
.dark {
  --color-background: 23 23 23;
  --color-foreground: 245 245 245;
  --color-primary: 139 100 77;
  /* ... 기타 색상 변수 */
}
```

### 3. Tailwind CSS 통합

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    colors: {
      background: {
        DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
        secondary: 'rgb(var(--color-background-secondary) / <alpha-value>)',
      },
      // ... 기타 색상 정의
    }
  }
}
```

## 🎨 컴포넌트

### 1. ThemeProvider

React Context를 사용한 전역 테마 상태 관리:

```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')

  // 시스템 테마 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    // 테마 변경 감지 및 처리
  }, [])

  // DOM 클래스 업데이트
  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark')
  }, [effectiveTheme])
}
```

### 2. ThemeToggle 컴포넌트

두 가지 UI 변형을 제공:

#### 버튼형 토글
```typescript
<ThemeToggle variant="button" size="md" />
```
- 라이트 ↔ 다크 모드 직접 전환
- 네비게이션 바에 적합

#### 드롭다운형 토글
```typescript
<ThemeToggle variant="dropdown" size="md" />
```
- 3가지 모드 모두 선택 가능
- 설정 페이지에 적합

## 🎯 주요 기능

### 1. 자동 시스템 테마 감지

```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    if (theme === 'system') {
      setEffectiveTheme(e.matches ? 'dark' : 'light')
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [theme])
```

### 2. localStorage 영구 저장

```typescript
useEffect(() => {
  const stored = localStorage.getItem('theme')
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    setTheme(stored as Theme)
  }
}, [])

const setTheme = (newTheme: Theme) => {
  localStorage.setItem('theme', newTheme)
  // 테마 적용 로직
}
```

### 3. 메타 테마 컬러 자동 업데이트

```typescript
useEffect(() => {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', 
      effectiveTheme === 'dark' ? '#1a1a1a' : '#6F4E37'
    )
  }
}, [effectiveTheme])
```

## 🎨 색상 팔레트

### 라이트 모드
- **배경**: `#ffffff` (순수 흰색)
- **보조 배경**: `#f8fafc` (연한 회색)
- **텍스트**: `#111827` (진한 회색)
- **주요 색상**: `#6F4E37` (커피 브라운)

### 다크 모드
- **배경**: `#171717` (진한 회색)
- **보조 배경**: `#262626` (중간 회색)
- **텍스트**: `#f5f5f5` (밝은 회색)
- **주요 색상**: `#8B644D` (밝은 커피 브라운)

## 🔧 설정 페이지 통합

설정 페이지에서 시각적 테마 선택 UI 제공:

```typescript
<div className="grid grid-cols-3 gap-3">
  <button onClick={() => setTheme('light')}>
    <Sun size={20} />
    <span>라이트</span>
  </button>
  <button onClick={() => setTheme('dark')}>
    <Moon size={20} />
    <span>다크</span>
  </button>
  <button onClick={() => setTheme('system')}>
    <Monitor size={20} />
    <span>시스템</span>
  </button>
</div>
```

## ⚡ 성능 최적화

### 1. Hydration 최적화
```typescript
<html lang="ko" suppressHydrationWarning>
```

### 2. 부드러운 전환 애니메이션
```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### 3. 메모리 효율성
- CSS Variables 활용으로 런타임 계산 최소화
- 이벤트 리스너 적절한 정리
- localStorage 접근 최적화

## 🌟 사용자 경험

### 장점
1. **눈의 피로 감소**: 다크 모드에서 저조도 환경 최적화
2. **배터리 절약**: OLED 디스플레이에서 전력 소비 감소
3. **개인화**: 사용자 선호도에 맞는 테마 선택
4. **일관성**: 모든 컴포넌트에서 일관된 테마 적용

### 접근성
- ARIA 라벨을 통한 스크린 리더 지원
- 키보드 네비게이션 완전 지원
- 충분한 색상 대비율 확보 (WCAG 2.1 AA 준수)

## 🚀 향후 계획

- [ ] 커스텀 테마 색상 선택기
- [ ] 자동 시간대별 테마 전환
- [ ] 고대비 모드 지원
- [ ] 테마별 아이콘 세트

---

**구현 완료일**: 2025-01-31  
**버전**: v0.9.4  
**관련 컴포넌트**: ThemeProvider, ThemeToggle, Settings