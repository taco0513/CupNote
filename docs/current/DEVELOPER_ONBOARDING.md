# CupNote 개발자 온보딩 가이드

## 🎯 개요

이 가이드는 CupNote 프로젝트에 새로 합류하는 개발자들을 위한 종합적인 온보딩 문서입니다.

## 📋 목차
1. [프로젝트 소개](#프로젝트-소개)
2. [개발 환경 설정](#개발-환경-설정)
3. [프로젝트 구조](#프로젝트-구조)
4. [개발 워크플로우](#개발-워크플로우)
5. [코딩 컨벤션](#코딩-컨벤션)
6. [테스팅 가이드](#테스팅-가이드)
7. [배포 프로세스](#배포-프로세스)
8. [팀 협업](#팀-협업)
9. [문제 해결](#문제-해결)

---

## 🚀 프로젝트 소개

### CupNote란?
**스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼**

> "누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간"

### 핵심 가치
- **개인화**: 각자의 언어와 방식으로 커피 경험 기록
- **성장**: 감각 발달과 취향 변화 추적
- **커뮤니티**: 같은 원두를 경험한 사람들과의 연결
- **전문성**: SCA 기준부터 캐주얼까지 다양한 레벨 지원

### 주요 기능
1. **3-Mode 기록 시스템**
   - **Cafe Mode**: 카페 경험 기록 (5-7분)
   - **HomeCafe Mode**: 홈카페 레시피 관리 (8-12분)
   - **Lab Mode**: SCA 기준 전문가 평가 (15-20분)

2. **개인 커피 일기**
   - 나만의 언어로 맛 표현
   - 로스터 노트 vs 개인 느낌 비교
   - 사진, 날짜, 장소, 함께한 사람 기록

3. **성장 트래킹**
   - 감각 발달 과정 시각화
   - 선호도 패턴 분석
   - 커피 여정 타임라인

### 기술 스택

```yaml
Frontend:
  - Framework: Next.js 15.4.5 (App Router)
  - Language: TypeScript
  - Styling: Tailwind CSS v4
  - State: React Hooks + Context API

Backend:
  - Database: Supabase (PostgreSQL)
  - Authentication: Supabase Auth
  - Storage: Supabase Storage
  - API: Next.js API Routes

Infrastructure:
  - Hosting: Vercel
  - Domain: mycupnote.com
  - Package Manager: npm (Required)
  - Monitoring: Sentry + Vercel Analytics

Development:
  - Testing: Vitest + Playwright + React Testing Library
  - Linting: ESLint + Prettier
  - Type Checking: TypeScript
  - Git Hooks: Husky + lint-staged
```

---

## 🛠️ 개발 환경 설정

### 사전 요구사항

```bash
# Node.js 18+ 설치 확인
node --version  # >= 18.0.0

# npm 9+ 설치 확인
npm --version   # >= 9.0.0

# Git 설치 확인
git --version
```

### 1. 프로젝트 클론 및 설정

```bash
# 1. 리포지토리 클론
git clone https://github.com/your-org/cupnote.git
cd cupnote

# 2. 의존성 설치 (npm 필수 사용)
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 정보를 입력하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 환경 설정
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry (선택사항)
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 3. Supabase 프로젝트 설정

#### 데이터베이스 스키마
```sql
-- 사용자 프로필 테이블
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 커피 기록 테이블
CREATE TABLE coffee_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('cafe', 'homecafe', 'lab')),
  coffee_name TEXT NOT NULL,
  roaster TEXT,
  origin TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RLS (Row Level Security) 정책
```sql
-- 사용자는 자신의 기록만 조회/수정 가능
ALTER TABLE coffee_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records" ON coffee_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON coffee_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON coffee_records
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. 개발 서버 시작

```bash
# 개발 서버 시작 (포트 3000)
npm run dev

# 브라우저에서 확인
open http://localhost:3000
```

### 5. 개발 도구 설정

#### VS Code 확장 프로그램 (권장)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "unifiedjs.vscode-mdx"
  ]
}
```

#### VS Code 설정
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

---

## 📁 프로젝트 구조

### 전체 디렉토리 구조

```
CupNote/
├── 📂 src/                    # 메인 애플리케이션
│   ├── 📂 app/               # Next.js App Router 페이지
│   │   ├── 📂 admin/         # 관리자 대시보드
│   │   ├── 📂 auth/          # 인증 페이지
│   │   ├── 📂 tasting-flow/  # 커피 기록 플로우
│   │   └── 📂 api/           # API 라우트
│   ├── 📂 components/        # React 컴포넌트
│   │   ├── 📂 ui/           # 재사용 가능한 UI 컴포넌트
│   │   ├── 📂 admin/        # 관리자 전용 컴포넌트
│   │   └── 📂 pages/        # 페이지별 컴포넌트
│   ├── 📂 contexts/          # React Context
│   ├── 📂 hooks/             # Custom React Hooks
│   ├── 📂 lib/              # 유틸리티 및 설정
│   ├── 📂 types/            # TypeScript 타입 정의
│   ├── 📂 config/           # 설정 파일
│   └── 📂 utils/            # 헬퍼 함수
├── 📂 public/               # 정적 파일
├── 📂 docs/                 # 📚 문서
│   ├── 📂 current/          # 최신 기능 문서
│   ├── 📂 development/      # 개발 히스토리
│   └── 📂 archive/          # 과거 문서 보관
├── 📂 e2e/                  # 🧪 E2E 테스트
├── 📂 supabase/             # 🗄️ 데이터베이스 설정
├── 📂 scripts/              # 🔧 유틸리티 스크립트
└── 📄 CLAUDE.md             # Claude Code 설정
```

### 주요 디렉토리 설명

#### `src/app/` - App Router 페이지
```typescript
// 페이지 컴포넌트 예시
export default function HomePage() {
  return <div>홈 페이지</div>
}

// 레이아웃 컴포넌트
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
```

#### `src/components/` - React 컴포넌트
```typescript
// UI 컴포넌트 (src/components/ui/)
export interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'small' | 'medium' | 'large'
  children: React.ReactNode
}

// 페이지 컴포넌트 (src/components/pages/)
export default function CoffeeRecordForm() {
  // 커피 기록 폼 로직
}
```

#### `src/contexts/` - React Context
```typescript
// 인증 컨텍스트
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 인증 로직
}
```

#### `src/lib/` - 라이브러리 및 설정
```typescript
// Supabase 클라이언트
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 로거 설정
export const logger = {
  info: (message: string, meta?: object) => { /* 로깅 로직 */ },
  error: (message: string, error?: Error) => { /* 에러 로깅 */ }
}
```

---

## 🔄 개발 워크플로우

### Git 브랜치 전략

#### 브랜치 구조
```
main
├── develop
│   ├── feature/coffee-record-v2
│   ├── feature/admin-dashboard
│   └── bugfix/auth-redirect-issue
├── hotfix/critical-security-patch
└── release/v1.3.0
```

#### 브랜치 명명 규칙
```bash
# 새 기능
feature/feature-name
feature/admin-user-management
feature/community-cupping

# 버그 수정
bugfix/issue-description
bugfix/login-redirect-loop
bugfix/image-upload-error

# 핫픽스
hotfix/critical-issue
hotfix/security-vulnerability

# 릴리즈
release/v1.2.0
release/v2.0.0-beta
```

### 개발 프로세스

#### 1. 새 기능 개발
```bash
# 1. develop 브랜치에서 최신 코드 pull
git checkout develop
git pull origin develop

# 2. 새 피처 브랜치 생성
git checkout -b feature/coffee-rating-system

# 3. 개발 진행
# ... 코드 작성 ...

# 4. 커밋 (Conventional Commits 사용)
git add .
git commit -m "feat: add coffee rating system with 5-star scale"

# 5. 푸시 및 PR 생성
git push origin feature/coffee-rating-system
# GitHub에서 Pull Request 생성
```

#### 2. 커밋 메시지 규칙 (Conventional Commits)
```bash
# 형식: <type>(<scope>): <description>

# 타입
feat:     # 새 기능
fix:      # 버그 수정
docs:     # 문서 수정
style:    # 코드 포맷팅 (기능 변경 없음)
refactor: # 리팩토링
test:     # 테스트 추가/수정
chore:    # 빌드/설정 관련

# 예시
feat(auth): add Google OAuth integration
fix(record): resolve image upload validation issue
docs(api): update authentication endpoint documentation
refactor(components): extract common button logic
```

#### 3. Pull Request 템플릿
```markdown
## 변경 사항 요약
- 커피 평점 시스템 추가 (5점 만점)
- 평점 기반 정렬 기능 구현

## 테스트 체크리스트
- [ ] 단위 테스트 작성/업데이트
- [ ] E2E 테스트 확인
- [ ] 모바일 반응형 테스트
- [ ] 접근성 테스트

## 스크린샷 (UI 변경 시)
[스크린샷 첨부]

## 관련 이슈
Closes #123
```

### 코드 리뷰 가이드라인

#### 리뷰어 체크리스트
- [ ] 코드가 요구사항을 충족하는가?
- [ ] 코딩 컨벤션을 따르는가?
- [ ] 테스트가 충분한가?
- [ ] 성능상 문제는 없는가?
- [ ] 보안 취약점은 없는가?
- [ ] 접근성을 고려했는가?

#### 리뷰 요청자 체크리스트
- [ ] 자체 테스트 완료
- [ ] 린트 오류 없음
- [ ] 타입 오류 없음
- [ ] 문서 업데이트 (필요시)
- [ ] 브레이킹 체인지 안내 (필요시)

---

## 📏 코딩 컨벤션

### TypeScript 스타일 가이드

#### 1. 네이밍 컨벤션
```typescript
// 파일명
// 컴포넌트: PascalCase
CoffeeRecordForm.tsx
AdminDashboard.tsx

// 유틸리티: camelCase
formatDate.ts
validateEmail.ts

// 타입/인터페이스: PascalCase with prefix
interface ICoffeeRecord { }
type TUserRole = 'admin' | 'user'

// 변수/함수: camelCase
const userName = 'john'
function calculateRating() { }

// 상수: UPPER_SNAKE_CASE
const API_ENDPOINTS = {
  RECORDS: '/api/records',
  USERS: '/api/users'
}

// CSS 클래스: kebab-case
.coffee-card { }
.rating-stars { }
```

#### 2. 컴포넌트 구조
```typescript
// 1. 임포트 순서
import React from 'react'               // React 관련
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'  // Next.js 관련

import { Coffee, Star } from 'lucide-react'  // 외부 라이브러리

import { useAuth } from '../contexts/AuthContext'  // 내부 모듈
import { formatDate } from '../utils/date'
import { ICoffeeRecord } from '../types/coffee'

// 2. 타입 정의
interface CoffeeCardProps {
  record: ICoffeeRecord
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

// 3. 컴포넌트 정의
export default function CoffeeCard({ 
  record, 
  onEdit, 
  onDelete 
}: CoffeeCardProps) {
  // 4. 훅 순서
  const router = useRouter()
  const { user } = useAuth()
  
  // 5. 상태
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 6. 부수 효과
  useEffect(() => {
    // 초기화 로직
  }, [])
  
  // 7. 이벤트 핸들러
  const handleEdit = () => {
    onEdit(record.id)
  }
  
  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onDelete(record.id)
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 8. 렌더링
  return (
    <div className="coffee-card">
      {/* JSX 내용 */}
    </div>
  )
}
```

#### 3. 타입 정의 패턴
```typescript
// 기본 인터페이스
interface ICoffeeRecord {
  id: string
  userId: string
  coffeeName: string
  rating: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// 확장 인터페이스
interface ICoffeeRecordWithUser extends ICoffeeRecord {
  user: IUserProfile
}

// 유니언 타입
type RecordMode = 'cafe' | 'homecafe' | 'lab'
type RecordStatus = 'draft' | 'published' | 'archived'

// 제네릭 타입
interface IApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// 유틸리티 타입
type CreateCoffeeRecord = Omit<ICoffeeRecord, 'id' | 'createdAt' | 'updatedAt'>
type UpdateCoffeeRecord = Partial<CreateCoffeeRecord>
```

### CSS/Tailwind 컨벤션

#### 1. Tailwind 클래스 순서
```html
<!-- 레이아웃 → 스타일링 → 상호작용 → 반응형 순서 -->
<div class="
  flex items-center justify-between p-4 
  bg-white border border-gray-200 rounded-lg shadow-sm
  hover:shadow-md transition-shadow
  md:p-6 lg:p-8
">
```

#### 2. 커스텀 CSS 클래스
```css
/* 컴포넌트별 클래스 */
.coffee-card {
  @apply bg-white rounded-lg shadow-sm border border-coffee-200;
}

.coffee-card__header {
  @apply flex items-center justify-between p-4 border-b border-coffee-100;
}

.coffee-card__content {
  @apply p-4 space-y-3;
}

/* 상태 클래스 */
.coffee-card--featured {
  @apply ring-2 ring-coffee-500 ring-opacity-50;
}

.coffee-card--loading {
  @apply opacity-50 pointer-events-none;
}
```

### API 라우트 컨벤션

#### 1. API 구조
```typescript
// src/app/api/records/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // 비즈니스 로직
    const { data, error } = await supabase
      .from('coffee_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch records' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

#### 2. 에러 처리 패턴
```typescript
// 표준 API 응답 형식
interface IApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// 에러 핸들링 유틸리티
export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    return { error: error.message, success: false }
  }
  return { error: 'Unknown error occurred', success: false }
}
```

---

## 🧪 테스팅 가이드

### 테스트 전략

#### 테스트 피라미드
```
        🔺 E2E Tests (Playwright)
      🔺🔺🔺 Integration Tests
  🔺🔺🔺🔺🔺🔺 Unit Tests (Vitest)
```

#### 테스트 타입별 목표
- **Unit Tests**: 70% 이상 커버리지
- **Integration Tests**: 주요 플로우 커버
- **E2E Tests**: 핵심 사용자 여정

### Unit Tests (Vitest)

#### 1. 컴포넌트 테스트
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>)
    const button = screen.getByText('Primary Button')
    expect(button).toHaveClass('bg-coffee-500')
  })
})
```

#### 2. 유틸리티 함수 테스트
```typescript
// src/utils/date.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, isValidDate } from './date'

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-08-03T10:30:00Z')
      expect(formatDate(date)).toBe('2025년 8월 3일')
    })

    it('handles invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
  })

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      expect(isValidDate('2025-08-03')).toBe(true)
    })

    it('returns false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false)
    })
  })
})
```

#### 3. Hook 테스트
```typescript
// src/hooks/useCoffeeRecords.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useCoffeeRecords } from './useCoffeeRecords'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [{ id: '1', coffee_name: 'Test Coffee' }],
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('useCoffeeRecords', () => {
  it('fetches records successfully', async () => {
    const { result } = renderHook(() => useCoffeeRecords())

    await waitFor(() => {
      expect(result.current.records).toHaveLength(1)
      expect(result.current.records[0].coffee_name).toBe('Test Coffee')
    })
  })
})
```

### Integration Tests

#### API 라우트 통합 테스트
```typescript
// src/app/api/records/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { GET, POST } from './route'

describe('/api/records', () => {
  let testUserId: string

  beforeAll(async () => {
    // 테스트 사용자 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: { user } } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword'
    })
    
    testUserId = user!.id
  })

  afterAll(async () => {
    // 테스트 데이터 정리
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabase.auth.admin.deleteUser(testUserId)
  })

  it('GET /api/records returns user records', async () => {
    const request = new Request('http://localhost:3000/api/records')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
```

### E2E Tests (Playwright)

#### 1. 사용자 여정 테스트
```typescript
// e2e/coffee-record-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Coffee Record Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/auth')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'testpassword')
    await page.click('[data-testid=login-button]')
    
    // 홈페이지로 이동 확인
    await expect(page).toHaveURL('/')
  })

  test('should create a new coffee record', async ({ page }) => {
    // 기록하기 버튼 클릭
    await page.click('[data-testid=create-record-button]')
    
    // 모드 선택
    await page.click('[data-testid=cafe-mode]')
    
    // 커피 정보 입력
    await page.fill('[data-testid=coffee-name]', 'Test Coffee')
    await page.fill('[data-testid=roaster]', 'Test Roaster')
    await page.selectOption('[data-testid=rating]', '4')
    
    // 저장
    await page.click('[data-testid=save-button]')
    
    // 성공 메시지 확인
    await expect(page.locator('[data-testid=success-message]')).toBeVisible()
    
    // 기록 목록에서 확인
    await page.goto('/my-records')
    await expect(page.locator('text=Test Coffee')).toBeVisible()
  })

  test('should filter records by mode', async ({ page }) => {
    await page.goto('/my-records')
    
    // 카페 모드 필터 적용
    await page.click('[data-testid=filter-cafe]')
    
    // 카페 모드 기록만 표시되는지 확인
    const records = page.locator('[data-testid=record-card]')
    const count = await records.count()
    
    for (let i = 0; i < count; i++) {
      await expect(records.nth(i).locator('[data-testid=record-mode]'))
        .toHaveText('cafe')
    }
  })
})
```

#### 2. 접근성 테스트
```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#main-content')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('coffee record form should be accessible', async ({ page }) => {
    await page.goto('/tasting-flow/cafe/coffee-info')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

### 테스트 실행

#### 개발 환경에서 테스트
```bash
# 단위 테스트 실행
npm run test

# 단위 테스트 (watch 모드)
npm run test:watch

# 커버리지 리포트
npm run test:coverage

# E2E 테스트 실행
npm run test:e2e

# E2E 테스트 (UI 모드)
npm run test:e2e:ui
```

#### CI/CD에서 테스트
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

---

## 🚀 배포 프로세스

### 환경별 배포 전략

#### 1. Development (자동 배포)
- **브랜치**: `develop`
- **URL**: https://cupnote-dev.vercel.app
- **트리거**: develop 브랜치 푸시시 자동 배포
- **데이터베이스**: Development Supabase 프로젝트

#### 2. Staging (PR 미리보기)
- **브랜치**: PR 브랜치
- **URL**: https://cupnote-pr-123.vercel.app
- **트리거**: PR 생성시 자동 배포
- **데이터베이스**: Staging Supabase 프로젝트

#### 3. Production (수동 배포)
- **브랜치**: `main`
- **URL**: https://mycupnote.com
- **트리거**: main 브랜치 푸시 + 수동 승인
- **데이터베이스**: Production Supabase 프로젝트

### 배포 워크플로우

#### 1. 개발 → 스테이징
```bash
# 1. 피처 브랜치에서 개발 완료
git checkout feature/new-feature
git push origin feature/new-feature

# 2. PR 생성 (자동으로 미리보기 배포)
# GitHub에서 PR 생성

# 3. 리뷰 및 테스트
# 팀원 리뷰 + 자동 테스트 통과

# 4. develop 브랜치로 병합
git checkout develop
git merge feature/new-feature
git push origin develop  # 자동으로 dev 환경 배포
```

#### 2. 스테이징 → 프로덕션
```bash
# 1. 릴리즈 브랜치 생성
git checkout develop
git checkout -b release/v1.3.0

# 2. 버전 업데이트
npm version patch  # 또는 minor, major

# 3. 릴리즈 노트 작성
echo "## v1.3.0 Changes\n- Feature A\n- Bug fix B" > RELEASE_NOTES.md

# 4. main 브랜치로 병합
git checkout main
git merge release/v1.3.0
git push origin main

# 5. 태그 생성 및 푸시
git tag v1.3.0
git push origin v1.3.0
```

### Vercel 배포 설정

#### vercel.json 설정
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  
  "build": {
    "env": {
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
    }
  },
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "statusCode": 302
    }
  ]
}
```

### 배포 체크리스트

#### 배포 전 점검사항
- [ ] 모든 테스트 통과
- [ ] 린트 오류 없음
- [ ] 타입스크립트 컴파일 성공
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Breaking changes 문서화
- [ ] 모니터링 설정 확인

#### 배포 후 점검사항
- [ ] 사이트 정상 로딩 확인
- [ ] 주요 기능 동작 테스트
- [ ] 에러 모니터링 확인
- [ ] 성능 지표 확인
- [ ] 사용자 피드백 모니터링

### 롤백 프로세스

#### 긴급 롤백
```bash
# 1. 이전 버전으로 롤백
vercel rollback cupnote --token=$VERCEL_TOKEN

# 2. 또는 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# 3. 핫픽스 브랜치 생성
git checkout -b hotfix/urgent-fix
# 수정 작업 진행
```

---

## 🤝 팀 협업

### 커뮤니케이션 도구

#### 1. Slack 채널 구조
```
#cupnote-general      - 일반 논의
#cupnote-dev          - 개발 관련 논의
#cupnote-design       - 디자인 리뷰
#cupnote-releases     - 릴리즈 공지
#cupnote-bugs         - 버그 리포트
#cupnote-random       - 자유 주제
```

#### 2. GitHub 이슈 관리
```markdown
# 이슈 템플릿

## 버그 리포트
**버그 설명**
간단명료한 버그 설명

**재현 단계**
1. '...' 페이지로 이동
2. '...' 버튼 클릭
3. 오류 발생

**예상 동작**
어떤 동작이 예상되었는지

**실제 동작**
실제로 어떤 일이 발생했는지

**환경**
- OS: [macOS, Windows, Linux]
- Browser: [Chrome, Safari, Firefox]
- Version: [버전 번호]

**스크린샷**
해당되는 경우 스크린샷 첨부
```

### 코드 리뷰 프로세스

#### 리뷰 요청 가이드라인
1. **PR 크기**: 500줄 이하로 유지
2. **설명**: 변경 사항과 이유 명확히 기술
3. **테스트**: 관련 테스트 포함
4. **문서**: 필요시 문서 업데이트
5. **셀프 리뷰**: 제출 전 스스로 검토

#### 리뷰어 가이드라인
1. **24시간 내 응답**: 비즈니스 데이 기준
2. **건설적 피드백**: 개선 방향 제시
3. **코드 품질**: 가독성, 성능, 보안 점검
4. **일관성**: 프로젝트 스타일 가이드 준수
5. **학습 기회**: 새로운 패턴이나 기법 공유

### 문서화 규칙

#### README 업데이트
```markdown
# 변경 사항이 있을 때 업데이트해야 하는 문서들

1. README.md - 프로젝트 개요, 설치 방법
2. CHANGELOG.md - 버전별 변경 사항
3. API.md - API 엔드포인트 문서
4. DEPLOYMENT.md - 배포 가이드
5. TROUBLESHOOTING.md - 문제 해결 가이드
```

#### 코드 문서화
```typescript
/**
 * 커피 기록을 생성합니다.
 * 
 * @param record - 생성할 커피 기록 데이터
 * @param userId - 기록을 생성하는 사용자 ID
 * @returns Promise<ICoffeeRecord> 생성된 커피 기록
 * 
 * @throws {ValidationError} 입력 데이터가 유효하지 않은 경우
 * @throws {AuthError} 사용자 인증이 실패한 경우
 * 
 * @example
 * ```typescript
 * const record = await createCoffeeRecord({
 *   coffeeName: 'Ethiopia Yirgacheffe',
 *   rating: 4,
 *   notes: 'Bright and floral'
 * }, userId)
 * ```
 */
export async function createCoffeeRecord(
  record: CreateCoffeeRecordData,
  userId: string
): Promise<ICoffeeRecord> {
  // 구현...
}
```

---

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 개발 환경 문제

**문제**: `npm install` 실패
```bash
# 해결 방법
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**문제**: Supabase 연결 오류
```typescript
// 환경 변수 확인
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...')

// 연결 테스트
import { supabase } from './lib/supabase'
const { data, error } = await supabase.from('coffee_records').select('count')
```

**문제**: TypeScript 오류
```bash
# 타입 체크
npm run type-check

# 타입 정의 재생성
rm -rf .next
npm run build
```

#### 2. 빌드 및 배포 문제

**문제**: Next.js 빌드 실패
```bash
# 상세 로그 확인
npm run build -- --debug

# 캐시 정리
rm -rf .next
npm run build
```

**문제**: Vercel 배포 실패
```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm run start

# Vercel CLI로 배포 테스트
vercel --prod --confirm
```

#### 3. 데이터베이스 문제

**문제**: RLS 정책 오류
```sql
-- 정책 확인
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 정책 재생성
DROP POLICY IF EXISTS "Users can view own records" ON coffee_records;
CREATE POLICY "Users can view own records" ON coffee_records
  FOR SELECT USING (auth.uid() = user_id);
```

**문제**: 마이그레이션 실패
```bash
# Supabase CLI 사용
supabase db reset
supabase db push
```

### 디버깅 도구

#### 1. 로깅 시스템
```typescript
// 개발 환경에서만 상세 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', {
    user,
    records,
    filters
  })
}

// 프로덕션에서는 Sentry로 오류 추적
import * as Sentry from '@sentry/nextjs'

try {
  // 위험한 코드
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

#### 2. React DevTools 사용
```typescript
// 컴포넌트에 displayName 추가
const CoffeeCard = () => { /* ... */ }
CoffeeCard.displayName = 'CoffeeCard'

// 개발 도구에서 props 디버깅
if (process.env.NODE_ENV === 'development') {
  (window as any).debugProps = props
}
```

#### 3. 네트워크 디버깅
```typescript
// API 요청 로깅
const fetchWithLogging = async (url: string, options?: RequestInit) => {
  console.log(`📡 ${options?.method || 'GET'} ${url}`)
  
  const response = await fetch(url, options)
  
  console.log(`📡 ${response.status} ${url}`)
  
  return response
}
```

### 성능 최적화

#### 1. Bundle 분석
```bash
# Bundle 크기 분석
npm run build -- --analyze

# 또는 webpack-bundle-analyzer 사용
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

#### 2. 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

<Image
  src="/coffee-image.jpg"
  alt="Coffee"
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 3. 코드 스플리팅
```typescript
// 동적 임포트 사용
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { loading: () => <div>Loading...</div> }
)
```

### 보안 점검

#### 1. 환경 변수 보안
```bash
# 민감한 정보 확인
grep -r "password\|secret\|key" src/ --exclude-dir=node_modules

# 환경 변수 검증
npm run check-env
```

#### 2. 의존성 보안 스캔
```bash
# npm audit 실행
npm audit

# 취약점 자동 수정
npm audit fix

# 고위험 취약점만 확인
npm audit --audit-level high
```

---

## 📚 추가 리소스

### 학습 자료
- [Next.js 공식 문서](https://nextjs.org/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Supabase 가이드](https://supabase.com/docs)
- [Vitest 문서](https://vitest.dev/)
- [Playwright 문서](https://playwright.dev/)

### 유용한 도구
- [VS Code](https://code.visualstudio.com/) - 추천 에디터
- [GitHub Desktop](https://desktop.github.com/) - Git GUI
- [Figma](https://www.figma.com/) - 디자인 도구
- [TablePlus](https://tableplus.com/) - 데이터베이스 GUI
- [Postman](https://www.postman.com/) - API 테스팅

### 커뮤니티
- [CupNote 개발팀 Slack](링크)
- [사내 개발자 포럼](링크)
- [Next.js Discord](https://discord.com/invite/nextjs)
- [TypeScript Discord](https://discord.com/invite/typescript)

---

## 📞 도움 요청

### 연락처
- **기술 지원**: dev@mycupnote.com
- **팀 리드**: lead@mycupnote.com
- **긴급 상황**: emergency@mycupnote.com

### 내부 문서
- [API 문서](./API_REFERENCE.md)
- [디자인 시스템](./DESIGN_SYSTEM.md)
- [배포 가이드](./DEPLOYMENT.md)
- [보안 가이드](./SECURITY.md)

---

**환영합니다! 🎉**

CupNote 팀에 오신 것을 환영합니다. 이 가이드를 통해 빠르게 프로젝트에 적응하시고, 멋진 커피 플랫폼을 함께 만들어가요!

**마지막 업데이트**: 2025-08-03
**문서 버전**: v1.0.0
**담당자**: CupNote 개발팀