# Fluid Design System - Enhanced Flexibility Guide

글로벌 스타일 가이드의 제한을 완화하고 개발자 유연성을 향상시킨 새로운 기능들을 소개합니다.

## 🎨 FluidText - Custom Color & Line Height

### Custom Colors
```jsx
// 기존: 제한된 색상 옵션
<FluidText color="primary">텍스트</FluidText>

// 새로운: 커스텀 색상 지원
<FluidText color="custom" customColor="#8B4513">커피 브라운</FluidText>
<FluidText color="custom" customColor="rgb(139, 69, 19)">RGB 값</FluidText>
<FluidText color="custom" customColor="var(--my-custom-color)">CSS 변수</FluidText>
```

### Custom Line Heights
```jsx
// 기존: tight, normal, relaxed만 지원
<FluidText lineHeight="relaxed">텍스트</FluidText>

// 새로운: loose 복원 + 커스텀 지원
<FluidText lineHeight="loose">여유로운 행간</FluidText>
<FluidText lineHeight="custom" customLineHeight="2.5">숫자값</FluidText>
<FluidText lineHeight="custom" customLineHeight="clamp(1.8, 2vw, 2.5)">반응형 행간</FluidText>
```

## 📦 FluidContainer - Extended Size & Custom Options

### Extended Size Options
```jsx
// 기존: xs, sm, md, lg, xl, 2xl, full, prose
<FluidContainer maxWidth="xl">컨테이너</FluidContainer>

// 새로운: 3xl, 4xl 추가 + 커스텀 지원
<FluidContainer maxWidth="3xl">1920px 최대 너비</FluidContainer>
<FluidContainer maxWidth="4xl">2560px 최대 너비</FluidContainer>
<FluidContainer maxWidth="custom" customMaxWidth="1400px">커스텀 너비</FluidContainer>
```

### Extended Padding Options
```jsx
// 기존: none, xs, sm, md, lg, xl, fluid
<FluidContainer padding="lg">컨테이너</FluidContainer>

// 새로운: 2xs, 3xl, 4xl 추가 + 커스텀 지원
<FluidContainer padding="2xs">최소 패딩</FluidContainer>
<FluidContainer padding="3xl">큰 패딩</FluidContainer>
<FluidContainer padding="4xl">최대 패딩</FluidContainer>
<FluidContainer padding="custom" customPadding="clamp(1rem, 3vw, 3rem)">반응형 패딩</FluidContainer>
```

## 🔧 Enhanced CSS Tokens

### New Design Tokens
```css
/* Extended Line Heights - loose 복원 */
--fluid-leading-loose: clamp(2, 1.75 + 1.25vw, 2.25);

/* Extended Spacing Options */
--fluid-space-2xs: clamp(0.125rem, 0.1rem + 0.125vw, 0.25rem);  /* 2-4px */
--fluid-space-3xl: clamp(3rem, 2.5rem + 2.5vw, 4rem);          /* 48-64px */
--fluid-space-4xl: clamp(4rem, 3rem + 5vw, 6rem);              /* 64-96px */

/* Shadow System */
--fluid-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--fluid-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Border Radius System */
--fluid-radius-xl: clamp(1rem, 0.8rem + 1vw, 1.5rem);
```

### Utility Classes
```css
/* Extended Padding/Margin utilities */
.fluid-p-2xs { padding: var(--fluid-space-2xs); }
.fluid-p-3xl { padding: var(--fluid-space-3xl); }
.fluid-p-4xl { padding: var(--fluid-space-4xl); }

/* Shadow utilities */
.fluid-shadow-lg { box-shadow: var(--fluid-shadow-lg); }
.fluid-shadow-xl { box-shadow: var(--fluid-shadow-xl); }

/* Border radius utilities */
.fluid-rounded-xl { border-radius: var(--fluid-radius-xl); }
```

## 💡 Usage Examples

### 1. Custom Brand Colors
```jsx
<FluidText 
  color="custom" 
  customColor="var(--brand-primary)"
  size="2xl" 
  weight="bold"
>
  브랜드 컬러 제목
</FluidText>
```

### 2. Fine-tuned Typography
```jsx
<FluidText 
  lineHeight="custom" 
  customLineHeight="1.8"
  size="lg"
>
  정확한 행간 조절이 필요한 본문
</FluidText>
```

### 3. Custom Layout Containers
```jsx
<FluidContainer 
  maxWidth="custom" 
  customMaxWidth="min(90vw, 1200px)"
  padding="custom"
  customPadding="clamp(1rem, 4vw, 2rem)"
>
  완전히 커스터마이징된 컨테이너
</FluidContainer>
```

### 4. Responsive Custom Values
```jsx
<FluidText 
  color="custom" 
  customColor="hsl(25, 70%, calc(30% + 10vw))"
  lineHeight="custom"
  customLineHeight="clamp(1.6, 1.5 + 0.5vw, 2.2)"
>
  뷰포트에 따라 변하는 색상과 행간
</FluidText>
```

## 🚀 Benefits

1. **향상된 유연성**: 디자인 시스템의 제약 없이 정확한 값 설정 가능
2. **브랜드 일관성**: 커스텀 브랜드 컬러 및 스타일 적용 용이
3. **성능 최적화**: CSS 변수와 clamp() 함수 활용으로 반응형 최적화
4. **개발자 경험**: 복잡한 오버라이드 없이 간단한 props로 커스터마이징

## ⚠️ 사용 시 주의사항

1. **성능**: 과도한 커스텀 값 사용 시 렌더링 성능 영향 가능
2. **일관성**: 디자인 시스템의 기본 값을 우선 고려
3. **접근성**: 커스텀 색상 사용 시 대비율 확인 필수
4. **유지보수**: 커스텀 값은 충분한 문서화와 주석 필요

## 🔄 Migration

기존 코드는 그대로 동작하며, 필요한 곳에만 새로운 커스텀 옵션을 점진적으로 적용할 수 있습니다.

```jsx
// 기존 코드 - 변경 불필요
<FluidText color="primary" lineHeight="normal">텍스트</FluidText>

// 새로운 기능 - 필요시에만 적용
<FluidText color="custom" customColor="#8B4513" lineHeight="loose">텍스트</FluidText>
```