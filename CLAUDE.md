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
- **Package Manager**: npm (stable and reliable)
- **State Management**: React hooks (Zustand 예정)
- **Database**: PostgreSQL + Prisma (예정)
- **Authentication**: NextAuth.js (예정)
- **Image Storage**: Cloudinary (예정)

## Project Structure

```
CupNote/
├── cupnote/                 # Next.js 애플리케이션
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility functions
│   │   ├── types/         # TypeScript types
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── ...
├── MASTER_PLAYBOOK/       # AI 개발 가이드
├── auto-docs/             # 문서 자동화 시스템
└── docs/                  # 프로젝트 문서
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

2. **맛 표현 시스템**
   - 전문가 모드: SCA 기준 용어
   - 일반인 모드: 일상적인 표현
   - 둘을 연결하는 번역 시스템

3. **커뮤니티 커핑**
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

✅ **Completed**:

- Next.js project setup with TypeScript
- Basic routing structure
- Coffee record form UI
- Coffee list component
- Type definitions
- Tailwind CSS configuration

🔄 **In Progress**:

- 30-minute prototype completion

📋 **Pending**:

- Database setup (Prisma + PostgreSQL)
- Authentication system
- API routes implementation
- Community features
- Image upload functionality
- Testing setup

## AI Development Approach

이 프로젝트는 MASTER_PLAYBOOK의 가이드라인을 따릅니다:

- **BMAD Method**: Business → Mockup → API → Design 순서로 개발
- **SuperClaude Commands**: `/build`, `/analyze`, `/improve` 등 활용
- **Wave System**: 복잡한 작업은 자동으로 Wave 모드 활성화
- **Context7**: 라이브러리 문서 자동 참조 (항상 활성)

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

- Unit tests: Vitest (예정)
- E2E tests: Playwright (예정)
- Component tests: React Testing Library (예정)
