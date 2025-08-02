# 🔧 CupNote 기술 스택 정의 v1.0

## 🔒 고정 기술 스택 (변경 절대 금지)

### 핵심 프레임워크
- **Frontend Framework**: Next.js 15.4.5 (정확히 이 버전, 다른 버전 사용 금지)
- **Language**: TypeScript (모든 파일에 TypeScript 적용 필수)
- **CSS Framework**: Tailwind CSS v4 (Bootstrap, Styled-components 등 금지)
- **Package Manager**: npm (yarn, pnpm, bun 사용 절대 금지)

### 백엔드 & 데이터베이스
- **Backend Service**: Supabase (Firebase, AWS 등 사용 금지)
- **Database**: PostgreSQL (Supabase 제공)
- **Authentication**: Supabase Auth (NextAuth.js 등 사용 금지)
- **File Storage**: Supabase Storage (AWS S3, Cloudinary 등 사용 금지)

### 상태 관리 & 라이브러리
- **State Management**: React hooks + Context API (Redux, Zustand 등 사용 금지)
- **HTTP Client**: Supabase Client (Axios, Fetch API 직접 사용 금지)
- **Testing**: Vitest + React Testing Library + Playwright (Jest 사용 금지)
- **Icons**: Lucide React (Heroicons, FontAwesome 등 사용 금지)

## 📦 필수 패키지 (정확한 버전)

### Core Dependencies
```json
{
  "next": "15.4.5",
  "@supabase/supabase-js": "^2.x.x",
  "@supabase/auth-helpers-nextjs": "^0.x.x",
  "react": "18.x.x",
  "react-dom": "18.x.x",
  "typescript": "^5.x.x",
  "tailwindcss": "^4.x.x"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.x.x",
  "@types/react": "^18.x.x",
  "@types/react-dom": "^18.x.x",
  "vitest": "^1.x.x",
  "@testing-library/react": "^14.x.x",
  "playwright": "^1.x.x",
  "lucide-react": "^0.x.x"
}
```

## 🚫 절대 사용 금지 기술

### 금지된 프레임워크/라이브러리
- **Create React App** (CRA) - Next.js만 사용
- **Vite** - Next.js만 사용  
- **Bootstrap** - Tailwind CSS만 사용
- **Styled-components** - Tailwind CSS만 사용
- **Emotion** - Tailwind CSS만 사용
- **SCSS/SASS** - Tailwind CSS + CSS만 사용

### 금지된 백엔드 서비스
- **Firebase** - Supabase만 사용
- **MongoDB** - PostgreSQL만 사용
- **AWS Direct** - Supabase를 통한 AWS 사용만
- **Vercel Database** - Supabase만 사용

### 금지된 상태 관리
- **Redux** - React Context만 사용
- **Zustand** - React Context만 사용
- **Recoil** - React Context만 사용
- **Jotai** - React Context만 사용

## 📂 프로젝트 구조 (필수 준수)

### 디렉토리 구조
```
src/
├── app/                    # Next.js 15 App Router
│   ├── (pages)/           # 페이지 그룹
│   ├── api/               # API Routes
│   ├── globals.css        # 전역 스타일
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 UI 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   └── [feature]/        # 기능별 컴포넌트
├── contexts/             # React Context
├── hooks/                # Custom React Hooks
├── lib/                  # 유틸리티 & 설정
│   ├── supabase.ts       # Supabase 클라이언트
│   └── utils.ts          # 공통 유틸리티
├── types/                # TypeScript 타입 정의
└── config/               # 설정 파일
```

### 파일 네이밍 규칙 (필수 준수)
- **Components**: PascalCase (`CoffeeRecordForm.tsx`)
- **Pages**: kebab-case (`coffee-record/page.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`CoffeeRecord.ts`)
- **Constants**: UPPER_SNAKE_CASE (`COFFEE_MODES.ts`)

## ⚙️ 개발 환경 설정

### 필수 설치 도구
```bash
# Node.js (권장: v18.17.0 이상)
node --version  # v18.17.0+

# npm (권장: v9.0.0 이상)
npm --version   # v9.0.0+

# TypeScript (전역 설치)
npm install -g typescript
```

### 환경 변수 (.env.local)
```bash
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 애플리케이션 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🔧 개발 명령어 (필수 사용)

### 기본 명령어
```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 테스트 실행
npm run test

# E2E 테스트
npm run test:e2e
```

### 금지 명령어
```bash
# 이런 명령어들은 절대 사용 금지
yarn install
pnpm install
bun install

# CRA 명령어들 금지
npx create-react-app
npm run eject
```

## 📋 개발 규칙 (필수 준수)

### TypeScript 규칙
- **모든 파일에 TypeScript 적용**
- **any 타입 사용 금지** (unknown 사용)
- **엄격한 타입 체크 적용**
- **Props 인터페이스 필수 정의**

### Next.js 15 규칙
- **App Router만 사용** (Pages Router 금지)
- **Server Components 우선 사용**
- **Client Components는 'use client' 명시**
- **Dynamic Imports 적극 활용**

### Supabase 규칙
- **Row Level Security (RLS) 필수 적용**
- **TypeScript 타입 자동 생성 활용**
- **실시간 구독 기능 적극 활용**
- **이미지 업로드는 Supabase Storage만**

## ✅ 개발 전 체크리스트

### 새 기능 개발 시 확인
- [ ] **TypeScript 타입 완전 정의**
- [ ] **Next.js 15 App Router 패턴 준수**
- [ ] **Tailwind CSS만 사용**
- [ ] **Supabase 연동 고려**
- [ ] **모바일 반응형 대응**
- [ ] **접근성 기준 준수**

### 코드 작성 시 필수 포함
```typescript
/**
 * @document-ref TECH_STACK.md#core-framework
 * @framework Next.js 15.4.5
 * @styling Tailwind CSS v4
 * @backend Supabase
 * @compliance-check 2025-08-02 - 100% 준수 확인
 */
```

## 🔄 업그레이드 정책

### 허용되는 업그레이드
- **Minor 패치 업데이트** (보안 수정, 버그 수정)
- **Tailwind CSS 마이너 업데이트**
- **Supabase 클라이언트 업데이트**

### 금지되는 변경
- **Next.js 메이저 버전 변경**
- **React 메이저 버전 변경**
- **TypeScript → JavaScript 전환**
- **다른 CSS 프레임워크 추가**

## 🚨 응급 상황 대응

### 패키지 의존성 문제
1. `package-lock.json` 삭제
2. `node_modules` 삭제  
3. `npm install` 재실행
4. `npm run type-check` 확인

### 빌드 오류 시
1. TypeScript 타입 오류 먼저 해결
2. Tailwind CSS 클래스 검증
3. Supabase 연결 상태 확인
4. 환경 변수 설정 검증

---

**⚠️ 경고**: 이 기술 스택과 다른 도구를 사용하는 것은 즉시 작업 중단 사유입니다.
**✅ 확인**: "TECH_STACK.md 문서를 정확히 따르겠습니다"라고 응답 후 개발을 시작하세요.