# CupNote 프로덕션 배포 가이드

## mycupnote.com 도메인 연결

### 1. Vercel CLI 설치 및 로그인

```bash
# Vercel CLI 글로벌 설치
npm install -g vercel

# Vercel 계정 로그인
vercel login
```

### 2. 프로젝트 초기 배포

```bash
# 프로덕션 빌드 테스트
npm run build

# Vercel에 배포
vercel --prod
```

### 3. 커스텀 도메인 연결

```bash
# 도메인 추가
vercel domains add mycupnote.com

# 도메인 연결
vercel --prod --domain mycupnote.com
```

### 4. DNS 설정

도메인 관리 업체에서 다음 DNS 레코드를 추가하세요:

#### A 레코드 (권장)
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600
```

#### CNAME 레코드 (대안)
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

#### www 서브도메인
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 5. 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

```bash
# 프로덕션 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

또는 Vercel Dashboard (vercel.com)에서 직접 설정:

1. 프로젝트 > Settings > Environment Variables
2. `.env.production` 파일 내용 추가

### 6. 도메인 검증

```bash
# 도메인 연결 상태 확인
vercel domains ls

# SSL 인증서 확인
curl -I https://mycupnote.com
```

## 배포 후 확인사항

### ✅ 기능 테스트
- [ ] 홈페이지 로딩 (https://mycupnote.com)
- [ ] 사용자 회원가입/로그인
- [ ] 커피 기록 작성
- [ ] 관리자 대시보드 (/admin)
- [ ] 모바일 반응형

### ✅ 성능 확인
- [ ] Lighthouse 점수 (95+ 목표)
- [ ] Core Web Vitals
- [ ] 로딩 속도 (<3초 목표)

### ✅ SEO 확인
- [ ] 메타 태그
- [ ] 사이트맵 (/sitemap.xml)
- [ ] robots.txt

### ✅ 보안 확인
- [ ] HTTPS 인증서
- [ ] 보안 헤더
- [ ] CSP 정책

## 자동 배포 설정

### GitHub Actions (선택사항)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:run
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 모니터링 설정

### 1. Vercel Analytics 활성화
```bash
npm install @vercel/analytics
```

### 2. Sentry 오류 추적 (이미 설정됨)
- 프로덕션 환경에서 자동 활성화
- 오류 리포트: sentry.io

### 3. 성능 모니터링
- Vercel Speed Insights
- Google Analytics (선택사항)

## 도메인 상태 체크

```bash
# 도메인 연결 확인
nslookup mycupnote.com

# SSL 인증서 확인
openssl s_client -connect mycupnote.com:443 -servername mycupnote.com

# 사이트 응답 확인
curl -I https://mycupnote.com
```

## 트러블슈팅

### 도메인 연결 안됨
1. DNS 전파 시간 확인 (최대 48시간)
2. DNS 레코드 정확성 확인
3. Vercel 도메인 상태 확인

### 빌드 에러
1. 로컬에서 빌드 테스트: `npm run build`
2. 환경 변수 확인
3. 종속성 문제 확인

### 성능 문제
1. Lighthouse 분석
2. 번들 크기 분석: `npm run analyze`
3. 이미지 최적화 확인

## 백업 및 복구

### 데이터 백업
- Supabase 자동 백업 활성화
- 정기적 데이터 export

### 롤백 전략
```bash
# 이전 배포 버전으로 롤백
vercel rollback [deployment-url]
```

---

**도메인 연결 완료 후 URL**: https://mycupnote.com
**관리자 대시보드**: https://mycupnote.com/admin
**상태 페이지**: https://mycupnote.com/api/health