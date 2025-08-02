# Micro Animation System

**Document Status**: Implementation Guide  
**Version**: 1.0.0  
**Last Updated**: 2025-08-02  
**Compliance**: Master Playbook v4.0.0 + CupNote Design System

## 애니메이션 철학

**"Purposeful Motion"** - 모든 애니메이션은 사용자 경험을 향상시키는 명확한 목적을 가져야 함

### 핵심 원칙

1. **Subtle & Natural**: 자연스럽고 눈에 거슬리지 않는 미묘한 움직임
2. **Performance First**: 60fps 성능 보장, GPU 가속 활용
3. **Accessibility**: motion-reduce 설정 준수, 접근성 고려
4. **Context Aware**: 커피 기록 앱의 차분한 특성에 맞는 애니메이션
5. **Battery Friendly**: 모바일 배터리 효율성 고려

## 애니메이션 카테고리

### 1. Feedback Animations (피드백 애니메이션)
**목적**: 사용자 액션에 대한 즉각적인 반응

- **Button Interactions**: 탭/클릭 피드백
- **Form Validation**: 성공/실패 상태 표시
- **Loading States**: 데이터 로딩 표시
- **Toast Notifications**: 알림 메시지 표시

### 2. Transition Animations (전환 애니메이션)
**목적**: 페이지/상태 간 자연스러운 전환

- **Page Transitions**: 페이지 간 이동
- **Modal Animations**: 모달 열기/닫기
- **Navigation**: 탭 전환, 드로어 애니메이션
- **Content Changes**: 동적 콘텐츠 업데이트

### 3. Micro Interactions (마이크로 인터랙션)
**목적**: 작은 상호작용으로 사용자 경험 향상

- **Hover Effects**: 데스크톱 호버 상태
- **Focus Indicators**: 포커스 상태 표시
- **Progress Indicators**: 진행 상태 표시
- **Data Visualization**: 차트/그래프 애니메이션

### 4. Onboarding Animations (온보딩 애니메이션)
**목적**: 새 사용자 가이드 및 기능 소개

- **Feature Highlights**: 새 기능 강조
- **Tutorial Steps**: 단계별 가이드
- **First Time Experience**: 초기 사용자 경험
- **Achievement Unlocks**: 업적 달성 표시

## 성능 가이드라인

### GPU 가속 속성만 사용
```css
/* ✅ 권장 - GPU 가속 */
transform: translateX(100px);
transform: scale(1.1);
opacity: 0.8;

/* ❌ 금지 - CPU 집약적 */
left: 100px;
width: 200px;
background-color: red;
```

### 애니메이션 duration 가이드
- **Micro Interactions**: 150-200ms
- **Transitions**: 250-350ms
- **Modal/Drawer**: 300-400ms
- **Page Transitions**: 400-500ms

### Easing Functions
```css
/* 커피앱에 적합한 자연스러운 easing */
--ease-out-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out-gentle: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## 구현 전략

### 1. CSS-First Approach
기본 애니메이션은 CSS로 구현하여 성능 최적화

### 2. React Spring for Complex Animations
복잡한 애니메이션은 React Spring 활용

### 3. Intersection Observer for Scroll Animations
스크롤 기반 애니메이션은 Intersection Observer 사용

### 4. Reduced Motion 지원
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## CupNote 특화 애니메이션

### 커피 관련 모션
- **Coffee Bean Bounce**: 커피원두 모양 아이콘의 경쾌한 움직임
- **Steam Effect**: 커피 컵에서 올라오는 증기 효과
- **Drip Animation**: 추출 과정을 표현하는 물방울 애니메이션
- **Rating Pulse**: 평점 입력 시 별점 펄스 효과

### 기록 작성 플로우
- **Step Progress**: 단계별 진행 상황 표시
- **Form Field Focus**: 입력 필드 포커스 애니메이션
- **Auto-save Indicator**: 자동 저장 상태 표시
- **Success Celebration**: 기록 완료 시 축하 애니메이션

### 데이터 시각화
- **Chart Reveal**: 통계 차트 점진적 표시
- **Number Counter**: 숫자 카운팅 애니메이션
- **Progress Bars**: 진행률 막대 애니메이션
- **Badge Unlock**: 업적 달성 시 배지 애니메이션

## 접근성 고려사항

1. **Motion Sensitivity**: 과도한 움직임 방지
2. **Timing**: 충분한 시간 제공
3. **Contrast**: 애니메이션 중에도 충분한 대비 유지
4. **Focus Management**: 키보드 네비게이션 지원

## 구현 우선순위

### Phase 1: 핵심 피드백 애니메이션
- Button tap feedback
- Loading states
- Toast notifications
- Form validation

### Phase 2: 전환 애니메이션
- Page transitions
- Modal animations
- Navigation transitions

### Phase 3: 커피 특화 애니메이션
- Coffee-themed micro interactions
- Data visualization animations
- Achievement unlocks

### Phase 4: 고급 인터랙션
- Scroll-based animations
- Complex gesture animations
- Onboarding flows