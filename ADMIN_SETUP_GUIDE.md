# CupNote 관리자 계정 설정 가이드

## 🛡️ 관리자 계정 생성 방법

### 방법 1: Supabase Dashboard (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - CupNote 프로젝트 선택

2. **Authentication > Users 메뉴**
   - "Add user" 버튼 클릭

3. **관리자 계정 정보 입력**
   ```
   Email: admin@mycupnote.com
   Password: [강력한 비밀번호 생성]
   Auto Confirm User: ✅ 체크
   ```

4. **User Metadata 설정**
   ```json
   {
     "role": "admin",
     "name": "CupNote Administrator"
   }
   ```

5. **"Create user" 클릭**

### 방법 2: 웹 인터페이스 사용

1. **설정 페이지 접속**
   - https://mycupnote.com/setup-admin

2. **관리자 정보 입력**
   - 이메일: admin@mycupnote.com
   - 이름: CupNote Administrator
   - 비밀번호: 안전한 비밀번호 생성 버튼 사용

3. **계정 생성 완료**

### 방법 3: 기존 계정에 관리자 권한 부여

기존 사용자 계정에 관리자 권한을 부여하려면:

1. **Supabase Dashboard > Authentication > Users**
2. **해당 사용자 클릭**
3. **Raw User Meta Data 편집**
   ```json
   {
     "role": "admin"
   }
   ```
4. **Update user 클릭**

---

## 🔐 현재 관리자 인증 규칙

```typescript
const isAdmin = user.email === 'admin@mycupnote.com' || 
               user.email?.endsWith('@mycupnote.com') ||
               user.user_metadata?.role === 'admin' ||
               process.env.NODE_ENV === 'development'
```

### 관리자 권한을 가진 계정들:
- ✅ `admin@mycupnote.com`
- ✅ `@mycupnote.com` 도메인의 모든 이메일
- ✅ `user_metadata.role = 'admin'` 설정된 계정
- ✅ 개발 환경의 모든 로그인 사용자

---

## 🚀 관리자 대시보드 접근

### 1. 로그인
- **URL**: https://mycupnote.com/auth
- **이메일**: admin@mycupnote.com
- **비밀번호**: 설정한 비밀번호

### 2. 관리자 대시보드
- **자동 리다이렉트**: 로그인 후 자동으로 대시보드 접근
- **직접 접근**: https://mycupnote.com/admin

### 3. 대시보드 기능
- 📊 **시스템 현황**: 사용자, 기록, 성능 지표
- 👥 **사용자 관리**: 사용자 목록, 활동 내역, 권한 관리
- ☕ **커피 기록 관리**: 모든 기록 조회, 모더레이션
- 📈 **성능 분석**: 시스템 성능, 오류 추적
- 💬 **피드백 관리**: 사용자 피드백, 버그 리포트
- 🗄️ **데이터 관리**: 카페/로스터리, 커피 원두 데이터
- ⚙️ **시스템 설정**: 공지사항, 앱 설정, 보안

---

## 🔒 보안 강화 권장사항

### 1. 강력한 비밀번호
```
최소 12자 이상
대소문자, 숫자, 특수문자 포함
예: CupN0te@dmin!2025$
```

### 2. 2단계 인증 (향후 구현)
- 추후 Supabase Auth에 2FA 추가 예정

### 3. IP 화이트리스트 (선택사항)
- Supabase RLS 정책으로 특정 IP만 허용

### 4. 접근 로그 모니터링
- 관리자 접근 시 자동 로그 기록
- 비정상 접근 감지 시 알림

### 5. 정기적 비밀번호 변경
- 3개월마다 비밀번호 변경 권장

---

## 🚨 문제 해결

### 관리자 대시보드 접근 불가
1. **로그인 상태 확인**
   - 로그아웃 후 다시 로그인

2. **이메일 확인**
   - admin@mycupnote.com 정확한 입력
   - 도메인 확인 (@mycupnote.com)

3. **권한 확인**
   - Supabase Dashboard에서 user_metadata 확인

4. **브라우저 캐시**
   - 브라우저 캐시 및 쿠키 삭제

### 계정 생성 실패
1. **이메일 중복 확인**
   - 이미 존재하는 계정인지 확인

2. **비밀번호 정책**
   - 최소 8자 이상, 영문+숫자+특수문자

3. **네트워크 연결**
   - 인터넷 연결 상태 확인

---

## 📞 지원

관리자 계정 설정에 문제가 있으면:
- 📧 기술 지원: tech@mycupnote.com
- 🔧 개발팀 연락: dev@mycupnote.com

---

**보안 알림**: 관리자 계정 정보는 절대 타인과 공유하지 마세요!