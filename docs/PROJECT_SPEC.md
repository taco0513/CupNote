# 🎯 CupNote 프로젝트 명세서 v1.0

## ⚠️ AI 준수 필수 사항
**이 문서의 내용은 절대 변경 불가합니다. 모든 구현은 이 문서를 100% 준수해야 합니다.**

## 📋 프로젝트 개요

### 핵심 정체성
- **프로젝트명**: CupNote (변경 금지)
- **타겟**: 스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼
- **핵심 비전**: "누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간"

### 🎯 핵심 기능 (변경 불가)

#### 1. 3-Mode 기록 시스템 (절대 필수)
- **Cafe Mode**: 카페에서 마신 커피 경험 기록 (5-7분)
  - 7단계 상세 카페 경험 기록
  - 카페 정보, 커피 상세, 감각 평가
  - 환경 평가 및 소셜 요소 포함

- **HomeCafe Mode**: 집에서 직접 내린 커피 레시피 관리 (8-12분)
  - 상세한 레시피 관리
  - 정밀 추출 제어 (±1g 원두량)
  - 통합 추출 타이머
  - 레시피 라이브러리 시스템

- **Lab Mode**: SCA 커핑 표준 전문가 평가 (15-20분)
  - SCA 커핑 표준 (9개 평가 항목)
  - 전문가 평가 도구
  - TDS 측정 및 추출 수율
  - 품질 등급 시스템

#### 2. 커뮤니티 기반 매칭 시스템
- **Match Score v2.0**: 커뮤니티 기반 시스템
- **등급 시스템 제거**: A+, A, B+, B, C 등급 표시 완전 제거
- **실시간 연동**: Supabase를 통한 실시간 커뮤니티 데이터 활용

#### 3. 개인 커피 일기
- 나만의 언어로 커피 맛 기록
- 로스터 노트 vs 내 느낌 비교
- 사진, 날짜, 장소, 함께한 사람 기록

## 🛡️ 기술 스택 (엄격 준수)

### 필수 기술 스택 (변경 금지)
- **Framework**: Next.js 15.4.5 (정확히 이 버전)
- **Language**: TypeScript (모든 파일)
- **Styling**: Tailwind CSS v4
- **Package Manager**: npm (bun, yarn 사용 금지)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth
- **Image Storage**: Supabase Storage

### 금지 기술
- Create React App
- Bootstrap 또는 다른 CSS 프레임워크
- MongoDB
- Firebase (Supabase만 사용)

## 🎨 디자인 시스템 (엄격 준수)

### 현재 색상 시스템
**주의**: 색상 시스템은 현재 커피 테마에서 현대적 중성 팔레트로 전환 중입니다.

#### 목표 색상 팔레트 (최종 적용 대상)
```css
/* Modern Warm Neutral Palette */
--neutral-50: #FAFAF9;          /* 배경 */
--neutral-100: #F5F5F4;         /* 카드 배경 */
--neutral-200: #E7E5E4;         /* 구분선 */
--neutral-300: #D6D3D1;         /* 비활성 */
--neutral-600: #78716C;         /* 보조 텍스트 */
--neutral-700: #57534E;         /* 기본 텍스트 */
--neutral-800: #44403C;         /* 강조 텍스트 */
--neutral-900: #1C1917;         /* 제목 */

/* Accent Colors */
--accent-warm: #A78BFA;         /* 보라 액센트 */
--accent-soft: #F3F4F6;         /* 부드러운 배경 */
--accent-hover: #EDE9FE;        /* 호버 상태 */
```

#### 컴포넌트 네이밍 규칙
- **Components**: PascalCase (e.g., `CoffeeRecordForm.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with 'I' prefix for interfaces (e.g., `ICoffeeRecord`)
- **Constants**: UPPER_SNAKE_CASE

## 📱 사용자 플로우 (변경 불가)

### 핵심 사용자 여정
1. **온보딩**: 3-Mode 시스템 소개
2. **모드 선택**: Cafe/HomeCafe/Lab 중 선택
3. **기록 진행**: 각 모드별 최적화된 플로우
4. **결과 확인**: Match Score 및 개인화된 피드백
5. **커뮤니티 공유**: 선택적 커뮤니티 참여

### 모바일 우선 설계
- **AppHeader**: 전역 모바일 헤더 (로고, 검색, 햄버거 메뉴)
- **Bottom Navigation**: 하단 네비게이션
- **Touch Optimization**: 44px 최소 터치 타겟

## 🚫 절대 금지 사항

### AI 개발 시 금지 행동
1. **문서에 없는 라이브러리 추가**
2. **정의된 3-Mode 시스템 변경**
3. **Supabase 외의 백엔드 사용**
4. **디자인 시스템 외의 색상 사용**
5. **npm 외의 패키지 매니저 사용**

## ✅ 개발 시 필수 검증 사항

### 모든 컴포넌트 생성 시 확인
- [ ] TypeScript 타입 완전 정의
- [ ] 디자인 시스템 색상 100% 준수
- [ ] 3-Mode 시스템과의 호환성
- [ ] 모바일 반응형 대응
- [ ] Supabase 연동 고려

### 모든 기능 구현 시 확인
- [ ] 이 문서의 핵심 기능 정의와 100% 일치
- [ ] 사용자 플로우 유지
- [ ] 성능 최적화 (PWA 지원)
- [ ] 접근성 준수 (WCAG 2.1 AA)

## 📝 문서 참조 강제

### 코드 작성 시 필수 포함
```typescript
/**
 * @document-ref PROJECT_SPEC.md#3-mode-recording-system
 * @compliance-check 2025-08-02 - 100% 준수 확인
 * @deviations none
 */
```

---

**⚠️ 경고**: 이 문서와 다른 구현을 제안하거나 생성하는 것은 즉시 작업 중단 사유입니다.
**✅ 확인**: "PROJECT_SPEC.md 문서를 정확히 따르겠습니다"라고 응답 후 개발을 시작하세요.