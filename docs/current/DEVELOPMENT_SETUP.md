# CupNote 개발 환경 설정 가이드

## 📋 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [프로젝트 설정](#프로젝트-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [Supabase 로컬 설정](#supabase-로컬-설정)
5. [개발 서버 실행](#개발-서버-실행)
6. [npm 스크립트 가이드](#npm-스크립트-가이드)
7. [문제 해결](#문제-해결)

## 🖥️ 시스템 요구사항

### 필수 요구사항
- **Node.js**: v18.17.0 이상 (LTS 권장)
- **npm**: v9.0.0 이상 (IMPORTANT: yarn이나 bun 사용 금지)
- **Git**: 최신 버전

### 선택 사항
- **Supabase CLI**: 로컬 데이터베이스 실행용
- **Docker**: Supabase 로컬 환경용

## 🚀 프로젝트 설정

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/cupnote.git
cd cupnote
```

### 2. 의존성 설치
```bash
npm install
```

⚠️ **중요**: 반드시 `npm`을 사용하세요. yarn이나 bun은 지원하지 않습니다.

### 3. Git 브랜치 설정
```bash
# 메인 브랜치 확인
git checkout main

# 새 기능 개발 시
git checkout -b feature/your-feature-name
```

## 🔑 환경 변수 설정

### 1. 환경 변수 파일 생성
```bash
cp .env.example .env.local
```

### 2. 필수 환경 변수 설정

**.env.local** 파일을 열어 다음 값들을 설정하세요:

```env
# 애플리케이션 URL (로컬 개발)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 이미지 업로드 설정
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=coffee-images

# 보안 설정 (개발 환경에서는 임의 값 사용 가능)
NEXTAUTH_SECRET=your-development-secret-key-minimum-32-chars
NEXTAUTH_URL=http://localhost:3001

# 애플리케이션 버전
NEXT_PUBLIC_APP_VERSION=1.0.0-rc.1

# 개발 환경 설정
NODE_ENV=development
```

### 3. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Project Name: `cupnote-dev`
   - Database Password: 안전한 비밀번호 설정
   - Region: 가장 가까운 지역 선택

4. 프로젝트 생성 후 Settings > API에서:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`에 복사
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`에 복사

### 4. Supabase Storage 설정

1. Supabase Dashboard > Storage
2. "New Bucket" 클릭
3. Bucket 이름: `coffee-images`
4. Public bucket: ✅ 체크
5. File size limit: 5MB
6. Allowed MIME types: `image/jpeg, image/png, image/webp`

## 🗄️ Supabase 로컬 설정 (선택사항)

로컬에서 Supabase를 실행하려면:

### 1. Supabase CLI 설치
```bash
brew install supabase/tap/supabase
```

### 2. Docker 실행 확인
```bash
docker --version
# Docker가 실행 중인지 확인
```

### 3. Supabase 로컬 프로젝트 시작
```bash
supabase start
```

### 4. 로컬 환경 변수 업데이트
```env
# 로컬 Supabase 사용 시
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[자동 생성된 anon key]
SUPABASE_SERVICE_ROLE_KEY=[자동 생성된 service role key]
```

### 5. 데이터베이스 마이그레이션 실행
```bash
supabase db push
```

## 🏃 개발 서버 실행

### 기본 개발 서버 (포트 3001)
```bash
npm run dev
```

브라우저에서 http://localhost:3001 접속

### 빌드 및 프로덕션 모드 실행
```bash
npm run build
npm start
```

## 📜 npm 스크립트 가이드

### 개발 관련
| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (포트 3001) |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm start` | 프로덕션 서버 실행 |

### 코드 품질
| 명령어 | 설명 |
|--------|------|
| `npm run lint` | ESLint 실행 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format` | Prettier 코드 포맷팅 |
| `npm run format:check` | 포맷팅 검사만 실행 |
| `npm run type-check` | TypeScript 타입 체크 |
| `npm run check-all` | 모든 검사 실행 (타입, 린트, 포맷) |

### 테스트
| 명령어 | 설명 |
|--------|------|
| `npm test` | Vitest 실행 (watch 모드) |
| `npm run test:ui` | Vitest UI 실행 |
| `npm run test:run` | 테스트 1회 실행 |
| `npm run test:coverage` | 커버리지 리포트 생성 |
| `npm run e2e` | Playwright E2E 테스트 |
| `npm run e2e:ui` | Playwright UI 모드 |
| `npm run e2e:headed` | 브라우저 표시하며 E2E 실행 |

### 성능 측정
| 명령어 | 설명 |
|--------|------|
| `npm run lighthouse` | Lighthouse CI 실행 |
| `npm run lighthouse:local` | 로컬 Lighthouse 실행 |
| `npm run perf:audit` | 빌드 + Lighthouse 실행 |

## 🔧 문제 해결

### 1. npm install 실패
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. Supabase 연결 오류
- Supabase 프로젝트가 활성 상태인지 확인
- 환경 변수가 올바르게 설정되었는지 확인
- CORS 설정 확인 (Supabase Dashboard > Authentication > URL Configuration)

### 3. 포트 충돌
```bash
# 3001 포트 사용 중인 프로세스 확인
lsof -i :3001

# 프로세스 종료
kill -9 [PID]
```

### 4. TypeScript 오류
```bash
# TypeScript 버전 확인
npx tsc --version

# 타입 정의 재설치
npm install --save-dev @types/react @types/react-dom @types/node
```

### 5. ESLint 오류
```bash
# ESLint 캐시 정리
rm -rf .next .eslintcache

# ESLint 자동 수정
npm run lint:fix
```

## 🎯 다음 단계

개발 환경 설정이 완료되었다면:

1. [컴포넌트 가이드](./COMPONENTS_GUIDE.md) 참고
2. [API 레퍼런스](./API_REFERENCE.md) 확인
3. [기여 가이드라인](../CONTRIBUTING.md) 읽기
4. 첫 번째 PR 생성하기!

## 💡 추가 팁

- VS Code 사용 시 권장 확장:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)
  
- Git commit 컨벤션:
  - feat: 새로운 기능
  - fix: 버그 수정
  - docs: 문서 업데이트
  - style: 코드 포맷팅
  - refactor: 코드 리팩토링
  - test: 테스트 추가/수정
  - chore: 빌드 작업 등