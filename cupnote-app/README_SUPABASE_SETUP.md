# Supabase 설정 가이드

CupNote 앱에서 데이터 저장을 위한 Supabase 설정 방법입니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인합니다.
2. "New project" 버튼을 클릭하여 새 프로젝트를 생성합니다.
3. 프로젝트 이름과 비밀번호를 설정합니다.
4. 지역을 선택합니다 (한국에서는 Seoul을 추천).

## 2. 데이터베이스 스키마 설정

1. Supabase 대시보드에서 SQL Editor로 이동합니다.
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행합니다.
3. 테이블과 정책이 올바르게 생성되었는지 확인합니다.

## 3. 환경 변수 설정

1. 프로젝트 대시보드에서 Settings > API로 이동합니다.
2. 다음 정보를 복사합니다:
   - Project URL
   - anon public key

3. `.env.local` 파일을 생성하고 다음과 같이 설정합니다:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

## 4. Authentication 설정 (선택사항)

현재는 mock user ID를 사용하지만, 실제 앱에서는 인증이 필요합니다:

1. Authentication > Providers에서 원하는 인증 방법을 활성화합니다.
2. Email/Password, Google, Apple 등을 선택할 수 있습니다.

## 5. 로컬 개발 시작

```bash
# 의존성 설치
bun install

# 개발 서버 시작
bun run dev
```

## 6. 데이터베이스 구조

### 주요 테이블:

- **users**: 사용자 프로필 정보
- **coffee_records**: 커피 테이스팅 기록
- **achievements**: 업적 정의
- **user_achievements**: 사용자가 획득한 업적
- **coffee_statistics**: 커피별 통계 (자동 업데이트)

### Row Level Security (RLS):

- 사용자는 자신의 데이터만 볼 수 있습니다.
- coffee_statistics는 모든 사용자가 볼 수 있습니다.

## 7. 테스트

1. 앱에서 커피 테이스팅 플로우를 완료합니다.
2. Supabase 대시보드의 Table Editor에서 데이터가 저장되었는지 확인합니다.
3. coffee_records 테이블에 새 레코드가 생성되었는지 확인합니다.

## 문제 해결

### 환경 변수 오류

- `.env.local` 파일이 프로젝트 루트에 있는지 확인합니다.
- 환경 변수 이름이 `VITE_`로 시작하는지 확인합니다.

### 데이터 저장 실패

- Supabase 대시보드에서 RLS 정책이 올바르게 설정되었는지 확인합니다.
- 브라우저 콘솔에서 에러 메시지를 확인합니다.

### 인증 관련 오류

- 현재는 mock user ID를 사용하므로 인증 오류는 무시해도 됩니다.
- 실제 앱에서는 Supabase Auth를 구현해야 합니다.
