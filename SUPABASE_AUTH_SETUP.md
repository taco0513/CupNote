# Supabase 인증 설정 가이드

CupNote 프로젝트의 Supabase 인증 시스템 설정 방법입니다.

## 1. 이메일 확인 설정 해제

현재 "Database error saving new user" 오류가 발생하는 이유는 **이메일 확인**이 기본적으로 활성화되어 있기 때문입니다.

### 해결 방법:

1. **Supabase Dashboard**에 접속
2. **Authentication** → **Settings** 이동
3. **Email Confirmation** 섹션에서:
   - ✅ **"Enable email confirmations"** 체크 해제
   - 또는 **"Confirm email"** 설정을 `false`로 변경

### 설정 위치:
```
Dashboard → Authentication → Settings → Email Confirmation
- Enable email confirmations: [OFF]
```

## 2. JWT 설정 최적화 (선택사항)

현재 Legacy JWT Secret을 사용 중이시네요. 보안과 성능을 위해 JWT Signing Keys로 업그레이드 권장:

1. **Settings** → **API** → **JWT Keys**
2. **"Change legacy JWT secret"** 버튼 클릭
3. **JWT Signing Keys**로 마이그레이션

## 3. 테스트 계정 설정

개발 중에는 다음 설정도 고려하세요:

### Email Provider 설정:
```
Authentication → Settings → Email
- SMTP Settings: Development용으로 비활성화 가능
```

### Site URL 설정:
```
Authentication → Settings → Site URL
- Site URL: http://localhost:3001
- Redirect URLs: http://localhost:3001/**
```

## 4. 현재 에러 해결 순서

1. ✅ **이메일 확인 비활성화** (가장 중요)
2. ✅ **Site URL 설정 확인**
3. ✅ **테스트 진행**

## 5. 설정 확인 방법

다음 명령으로 현재 설정을 확인할 수 있습니다:

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3001 접속
# 홈페이지 하단의 "Supabase 연결 & 인증 테스트" 섹션에서
# "가입 테스트" 버튼 클릭하여 테스트
```

## 6. 예상 결과

설정이 올바르다면:
- ✅ 회원가입 즉시 완료 (이메일 확인 없음)
- ✅ 사용자 프로필 자동 생성
- ✅ 로그인 상태로 전환

## 7. 여전히 오류가 발생한다면

1. **Browser Console** 확인
2. **Supabase Dashboard** → **Logs** 확인
3. **RLS (Row Level Security)** 정책 확인

---

## 빠른 해결책

**가장 빠른 해결책**은 Supabase Dashboard에서:
**Authentication → Settings → Email Confirmation을 OFF**로 설정하는 것입니다.