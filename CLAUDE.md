# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CupNote**는 스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼입니다.

### 핵심 비전

"누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간"

## Technology Stack

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Package Manager**: npm (IMPORTANT: Always use npm, NOT bun or yarn)
- **State Management**: React hooks + Context API
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth
- **Image Storage**: Supabase Storage

## Project Structure

```
CupNote/
├── src/                    # 🚀 메인 Next.js 애플리케이션
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/              # Supabase client & utilities
│   ├── types/            # TypeScript types
│   ├── config/           # 🆕 Configuration files (modes, UI labels)
│   └── utils/            # Helper functions
├── public/               # Static assets (icons, images)
├── docs/                 # 📚 현재 문서 (정리됨)
│   ├── current/          # 최신 기능 문서
│   ├── development/      # 개발 히스토리
│   └── archive/          # 과거 문서 보관
├── e2e/                  # 🧪 E2E 테스트 (Playwright)
├── supabase/             # 🗄️ 데이터베이스 설정
├── archive/              # 📦 보관용 파일들
└── scripts/              # 🔧 유틸리티 스크립트
```

## Development Commands

```bash
# Development
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Package Management
npm install [package]        # Add dependency
npm install -D [package]     # Add dev dependency
npm install                  # Install all dependencies
```

## Core Features (MVP)

1. **개인 커피 일기**
   - 나만의 언어로 커피 맛 기록
   - 로스터 노트 vs 내 느낌 비교
   - 사진, 날짜, 장소, 함께한 사람 기록

2. **3-Mode 기록 시스템**
   - **Cafe Mode**: 카페에서 마신 커피 경험 기록 (7단계)
   - **HomeCafe Mode**: 집에서 직접 내린 커피 레시피 관리 (8-12분)
   - **Lab Mode**: SCA 기준 전문가 평가 (15-20분)

3. **커뮤니티 커핑** (v2.0 계획)
   - 같은 원두 마신 사람들의 기록 비교
   - 온라인 블라인드 테이스팅
   - 서로의 표현 공유 & 학습

4. **성장 트래킹**
   - 감각 발달 과정 시각화
   - 선호도 패턴 분석
   - 커피 여정 타임라인

## Coding Conventions

- **Components**: PascalCase (e.g., `CoffeeRecordForm.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with 'I' prefix for interfaces (e.g., `ICoffeeRecord`)
- **Constants**: UPPER_SNAKE_CASE
- **CSS**: Tailwind utility classes, custom classes use kebab-case

## Current Implementation Status

✅ **v1.2.0 - Hybrid Design System Complete** (2025-08-03):

- **Hybrid Design System**: "Minimal Structure + Premium Visual Quality" philosophy
- **Onboarding System Redesign**: 5-step flow with interactive cards and Match Score v2.0 introduction
- **Profile Page Separation**: Independent /profile page with equipment management and journey tracking
- **Mobile Navigation Optimization**: 5→4 tabs, profile slider, improved touch interactions
- **Component Library Enhancement**: PageHeader, Card variants, UnifiedButton with glassmorphism
- **Documentation Overhaul**: Comprehensive guides for hybrid components and mobile patterns

✅ **v1.1.0 - Mobile App Experience Complete** (2025-08-02):

- **Native App-like Experience**: Global AppHeader with minimalist design
- **Enhanced Home Screen**: CoffeeJourneyWidget, rotating CoffeeTip, improved messaging
- **Beta Feedback System**: Purple feedback button with anonymous collection
- **Improved UX Text**: "동기화됨" → "모든 기록 저장됨" for clarity
- **8 New Components**: Complete mobile experience component library
- **Global Navigation**: Consistent header across all pages
- **Design System**: Comprehensive coffee-themed CSS system

✅ **v1.0.0 RC - Production Deployment Completed** (2025-07-31):

- **Production Deployment**: Live at https://cupnote.vercel.app
- **Light Mode Only**: Dark mode removed, unified UX experience  
- **Hydration Issues Fixed**: SSR mismatch errors completely resolved
- **SEO Optimization**: Complete metadata, robots.txt, sitemap
- **Performance Optimization**: Vercel deployment configuration
- **Core System**: Next.js 15.4.5 + TypeScript + Tailwind CSS 4.0
- **Database**: Supabase integration (PostgreSQL + Auth + Storage)  
- **Coffee Recording**: **3-Mode System** (Cafe/HomeCafe/Lab) ✨
- **Search & Filter**: Real-time search, advanced filters, multi-tag support
- **Image Upload**: Supabase Storage with compression and thumbnails
- **PWA Features**: Offline support, installable, background sync
- **Performance**: 2-tier caching, pagination, lazy loading, query optimization
- **Testing**: Vitest + React Testing Library + Playwright (70% coverage goal)
- **Mobile Optimization**: Responsive design, touch optimization, bottom nav
- **Achievement System**: 30+ badges, leveling, progress tracking
- **User Authentication**: Complete auth flow with protected routes
- **Stats & Analytics**: Data visualization, export/import functionality
- **Error Handling**: Comprehensive error boundaries and user feedback

✅ **3-Mode 시스템 구현 완료** (2025-12-01):

✅ **Match Score v2.0 - 커뮤니티 기반 시스템** (2025-08-02):
- **등급 시스템 제거**: A+, A, B+, B, C 등급 표시 완전 제거
- **커뮤니티 기반 매칭**: 실제 사용자 데이터 기반 점수 계산 시스템
- **Supabase 실시간 연동**: community-match.ts를 통한 실시간 커뮤니티 데이터 활용
- **개선된 메시지**: 점수 기반 개인화된 피드백 시스템

✅ **Mobile UX & IA Optimization** (2025-08-02):
- **모바일 앱 경험**: 하단 네비게이션 가림 현상 완전 해결, 네이티브 앱 수준 터치 피드백
- **정보 구조 최적화**: "기록 목록"+"통계" → "내 기록" 탭 통합으로 IA 단순화
- **설정 간소화**: 불필요한 옵션 제거, 홈카페 장비 설정 추가
- **성능 최적화**: 모든 페이지에 Core Web Vitals 최적화 적용

✅ **My Records 통합 - 고급 분석 시스템** (2025-08-02):
- **통합 인터페이스**: "내 기록" 페이지에 목록/분석 탭 완전 통합
- **고급 분석 대시보드**: 월별 트렌드, 평점 분포, 모드 사용량, 선호 패턴 등 8가지 핵심 지표
- **스마트 인사이트**: 텍스트 마이닝으로 자주 언급한 맛 추출, 선호 로스터리/원산지 분석
- **최적화된 UX**: URL 상태 관리, 프로페셔널 로딩 상태, 신규 사용자 가이드
- **성능 최적화**: 효율적 데이터 처리, 모바일 반응형 차트, <1s 로딩 시간

### 🎯 3가지 전문화된 기록 모드:

1. **Cafe Mode** ☕ (5-7분)
   - 7단계 상세 카페 경험 기록
   - 카페 정보, 커피 상세, 감각 평가
   - 환경 평가 및 소셜 요소 포함

2. **HomeCafe Mode** 🏠 (8-12분)
   - 상세한 레시피 관리
   - 정밀 추출 제어 (±1g 원두량)
   - 통합 추출 타이머
   - 레시피 라이브러리 시스템

3. **Lab Mode** 🧪 (15-20분)
   - SCA 커핑 표준 (9개 평가 항목)
   - 전문가 평가 도구
   - TDS 측정 및 추출 수율
   - 품질 등급 시스템

📋 **v1.2 Beta Testing Phase** (In Progress):

- Beta feedback collection and analysis
- Search functionality implementation (AppHeader search button ready)
- Notification system integration
- Core feature polish based on user feedback

📋 **v2.0 Community Features** (Planned):

- Community cupping and blind tasting
- Social sharing and coffee journey timelines
- Expert review system
- Coffee roaster partnerships

📋 **Future Enhancements**:

- AI-powered taste analysis and recommendations
- Advanced analytics and user insights
- ~~OCR functionality~~ (Deferred - too early stage)

## Development Guidelines

- **Component-First**: React 컴포넌트 기반 개발
- **TypeScript First**: 타입 안전성 우선
- **Responsive Design**: 모바일 친화적 UI/UX
- **Performance**: 최적화된 사용자 경험

## Common Tasks

### Add a new feature

```bash
/implement "[feature description]" --type component
```

### Analyze code quality

```bash
/analyze --focus quality
```

### Improve performance

```bash
/improve --focus performance --loop
```

## Error Handling

- 모든 API 에러는 일관된 형식으로 처리
- 사용자 친화적인 에러 메시지 표시
- 개발 환경에서는 상세 로그 출력

## Testing Strategy

- **Unit tests**: Vitest (✅ 구현됨 - 361+ 테스트)
- **E2E tests**: Playwright (✅ 구현됨 - 5개 스위트)
- **Component tests**: React Testing Library (✅ 구현됨 - 185+ 테스트)
- **Coverage Goal**: 70% (라인/함수/브랜치)
