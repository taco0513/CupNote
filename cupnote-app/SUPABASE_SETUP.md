# Supabase 프로젝트 연결 가이드

## 1. 프로젝트 정보 확인

기존 Supabase 프로젝트에서 다음 정보를 가져오세요:

1. **Dashboard 접속**: https://supabase.com/dashboard
2. **프로젝트 선택** → Settings → API
3. **필요한 정보**:
   - Project URL: `https://your-project-id.supabase.co`
   - anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2. 환경 변수 업데이트

`.env.local` 파일을 편집하여 실제 값으로 교체:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. 데이터베이스 스키마 적용

Supabase Dashboard → SQL Editor에서 다음 순서로 실행:

### 3.1 기본 스키마 생성

`database/schema.sql` 파일 내용을 복사하여 실행

### 3.2 마스터 데이터 삽입

`database/seed-data.sql` 파일 내용을 복사하여 실행

## 4. 연결 테스트

프로젝트 루트에서:

```bash
npm run dev
```

브라우저 개발자 도구에서 연결 오류가 없는지 확인하세요.

## 5. 인증 설정 (선택사항)

Google OAuth를 사용하려면:

1. **Google Cloud Console**에서 OAuth 2.0 클라이언트 ID 생성
2. **Supabase Dashboard** → Authentication → Providers → Google 활성화
3. Client ID와 Client Secret 입력
4. Redirect URLs 설정:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

## 트러블슈팅

### 연결 실패 시

- 환경 변수가 올바른지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 상태 확인

### RLS 정책 오류 시

- SQL Editor에서 RLS 정책이 올바르게 생성되었는지 확인
- 테이블별 권한 설정 확인

### 인증 오류 시

- 인증 제공자 설정 확인
- Redirect URL 설정 확인
