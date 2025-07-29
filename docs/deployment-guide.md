# 🚀 CupNote 배포 가이드

## 📋 목차
1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [Vercel 배포 설정](#vercel-배포-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [CI/CD 파이프라인](#cicd-파이프라인)
6. [모니터링 및 유지보수](#모니터링-및-유지보수)
7. [문제 해결](#문제-해결)

## 개요

CupNote는 다음 기술 스택으로 프로덕션 배포됩니다:
- **Frontend**: Vercel (Vue 3 + Vite)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **CI/CD**: GitHub Actions
- **모니터링**: Vercel Analytics + Supabase Dashboard

## 사전 준비

### 1. 필수 계정
- [ ] GitHub 계정
- [ ] Vercel 계정
- [ ] Supabase 계정

### 2. 로컬 환경
```bash
# Bun 설치 (빠른 패키지 관리)
curl -fsSL https://bun.sh/install | bash

# Vercel CLI 설치
bun install -g vercel

# 프로젝트 의존성 설치
cd cupnote-app
bun install
```

## Vercel 배포 설정

### 1. Vercel 프로젝트 생성
```bash
# Vercel 로그인
vercel login

# 프로젝트 연결
cd cupnote-app
vercel link

# 프로젝트 설정 확인
vercel env pull
```

### 2. 빌드 설정
`vercel.json` 파일이 이미 구성되어 있습니다:
- Framework: Vue
- Build Command: `bun run build`
- Output Directory: `dist`
- Node Version: 20

### 3. 보안 헤더
자동으로 적용되는 보안 헤더:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 환경 변수 설정

### 1. Supabase 프로젝트 생성
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. New Project 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon Key

### 2. Vercel 환경 변수 설정
```bash
# Vercel Dashboard에서 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 또는 CLI로 설정
echo "VITE_SUPABASE_URL=your_url" | vercel env add production
echo "VITE_SUPABASE_ANON_KEY=your_key" | vercel env add production
```

### 3. GitHub Secrets 설정
Repository Settings → Secrets and variables → Actions에서 추가:
- `VERCEL_TOKEN`: Vercel 토큰
- `VERCEL_ORG_ID`: Vercel 조직 ID
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID
- `VITE_SUPABASE_URL`: Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key

## CI/CD 파이프라인

### GitHub Actions 워크플로우
`.github/workflows/deploy.yml` 파일이 다음을 자동화합니다:

#### 1. 테스트 단계 (Test)
- TypeScript 타입 체크
- ESLint 린팅
- Vitest 단위 테스트
- Playwright E2E 테스트
- 테스트 커버리지 리포트

#### 2. 빌드 단계 (Build)
- Bun으로 의존성 설치
- Vite로 프로덕션 빌드
- 빌드 아티팩트 업로드

#### 3. 배포 단계 (Deploy)
- **Production**: main 브랜치 push 시 자동 배포
- **Preview**: PR 생성 시 미리보기 배포
- 배포 후 헬스 체크

### 배포 트리거
- `main` 브랜치에 push → 프로덕션 배포
- Pull Request 생성 → 미리보기 배포
- 수동 트리거 → workflow_dispatch

## 모니터링 및 유지보수

### 1. Vercel Analytics
```javascript
// 자동으로 수집되는 메트릭:
- Web Vitals (LCP, FID, CLS)
- 페이지뷰
- 방문자 통계
- 지역별 성능
```

### 2. Supabase 모니터링
- Database 사용량
- API 요청 수
- Auth 사용자 수
- Realtime 연결 수

### 3. 성능 최적화 체크리스트
- [ ] 이미지 최적화 (WebP 포맷)
- [ ] 코드 스플리팅 활성화
- [ ] 캐싱 전략 구현
- [ ] CDN 활용

### 4. 정기 유지보수
- [ ] 월간 의존성 업데이트
- [ ] 분기별 보안 감사
- [ ] 연간 인프라 리뷰

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
bun run build

# 타입 에러 확인
bun run type-check

# 린트 에러 확인
bun run lint
```

### 배포 실패
1. Vercel 대시보드에서 로그 확인
2. 환경 변수 설정 확인
3. 빌드 명령어 확인

### 성능 문제
1. Vercel Analytics에서 Web Vitals 확인
2. 번들 크기 분석
   ```bash
   bun run build
   # dist 폴더 크기 확인
   ```
3. 이미지 최적화 확인

## 보안 고려사항

### 1. 환경 변수 보안
- 절대 코드에 하드코딩하지 않음
- `.env` 파일은 `.gitignore`에 포함
- 프로덕션 키는 Vercel/GitHub Secrets에만 저장

### 2. API 보안
- Supabase Row Level Security (RLS) 활성화
- API Rate Limiting 구성
- CORS 정책 설정

### 3. 프론트엔드 보안
- XSS 방지 (Vue 자동 이스케이핑)
- CSP 헤더 구성
- HTTPS 강제

## 롤백 전략

### 즉시 롤백
```bash
# Vercel Dashboard에서 이전 배포로 롤백
vercel rollback

# 또는 특정 배포로 롤백
vercel rollback [deployment-url]
```

### Git 롤백
```bash
# 이전 커밋으로 롤백
git revert HEAD
git push origin main
```

## 확장 계획

### Phase 1 (현재)
- 단일 리전 배포
- 기본 모니터링
- 수동 스케일링

### Phase 2 (3개월)
- 멀티 리전 배포
- 고급 모니터링 (Sentry)
- 자동 스케일링

### Phase 3 (6개월)
- 엣지 함수 활용
- 글로벌 CDN
- AI 기반 최적화

## 유용한 명령어

```bash
# 프로덕션 배포
vercel --prod

# 미리보기 배포
vercel

# 로그 확인
vercel logs

# 환경 변수 확인
vercel env ls

# 도메인 설정
vercel domains add cupnote.com
```

## 지원 및 문의

- Vercel 문서: https://vercel.com/docs
- Supabase 문서: https://supabase.com/docs
- GitHub Actions 문서: https://docs.github.com/actions

---

*Last updated: 2025-07-30*