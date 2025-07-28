# CupNote Deployment Guide 🚀

## 📋 Overview

CupNote 프로토타입을 다양한 플랫폼에 배포하는 가이드입니다.

## 🏗️ Pre-deployment Checklist

### ✅ 배포 전 확인사항

- [ ] 모든 기능이 정상 작동하는지 테스트
- [ ] 다양한 디바이스/브라우저에서 호환성 확인
- [ ] Performance 최적화 (Lighthouse 점수 90+ 권장)
- [ ] 보안 설정 확인 (HTTPS 필수)
- [ ] SEO 메타데이터 설정

### 🧪 로컬 테스트

```bash
# 로컬 서버로 테스트
python -m http.server 8000
# 또는
npx serve .

# 브라우저에서 확인
open http://localhost:8000
```

### 📱 모바일 테스트

1. **Chrome DevTools**: F12 → Device Toolbar
2. **실제 디바이스**: 로컬 IP로 접속
   ```bash
   # 로컬 IP 확인
   ipconfig getifaddr en0  # macOS
   # 모바일에서 http://[IP]:8000 접속
   ```

## 🌐 정적 호스팅 배포

### 1. Netlify (추천 ⭐)

#### 드래그 앤 드롭 배포
1. [Netlify](https://netlify.com) 가입
2. "Sites" → "Deploy manually"
3. 프로젝트 폴더를 드래그 앤 드롭
4. 자동으로 URL 생성 (예: `https://amazing-curie-123456.netlify.app`)

#### Git 기반 자동 배포
```bash
# Git 저장소 연결
git remote add origin <your-repo-url>
git push -u origin main

# Netlify에서 저장소 연결
# Settings → Build & deploy → Continuous Deployment
```

#### Netlify 설정 파일
```toml
# netlify.toml
[build]
  publish = "."
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# PWA를 위한 Service Worker 캐시 설정
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"
```

### 2. Vercel

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### Vercel 설정 파일
```json
{
  "version": 2,
  "name": "cupnote-prototype",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
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
        }
      ]
    }
  ]
}
```

### 3. GitHub Pages

```bash
# gh-pages 브랜치 생성
git checkout -b gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# GitHub Settings → Pages → Source: gh-pages branch
```

#### GitHub Actions 자동 배포
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### 4. Firebase Hosting

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 프로젝트 초기화
firebase login
firebase init hosting

# 배포
firebase deploy
```

#### Firebase 설정
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 📱 PWA 배포 준비

### 1. Web App Manifest 생성

```json
{
  "name": "CupNote - 커피 테이스팅 저널",
  "short_name": "CupNote",
  "description": "커피 테이스팅을 위한 모바일 최적화 웹 애플리케이션",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDF6F0",
  "theme_color": "#8B4513",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["food", "lifestyle", "productivity"],
  "lang": "ko-KR"
}
```

### 2. Service Worker (기본)

```javascript
// sw.js
const CACHE_NAME = 'cupnote-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/design-tokens.css',
  '/components.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

### 3. HTML 메타데이터 추가

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- iOS Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="CupNote">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">

<!-- MS Tile -->
<meta name="msapplication-TileColor" content="#8B4513">
<meta name="msapplication-TileImage" content="/icons/icon-144x144.png">

<!-- Theme Color -->
<meta name="theme-color" content="#8B4513">
```

## 🔒 보안 설정

### 1. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self';
">
```

### 2. 보안 헤더 설정

```javascript
// Express.js 예시
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
```

## ⚡ 성능 최적화

### 1. 리소스 압축

```bash
# HTML/CSS/JS 압축
npx html-minifier --collapse-whitespace --remove-comments index.html > index.min.html

# Gzip 압축 (서버 설정)
# Nginx
gzip on;
gzip_types text/css text/javascript application/javascript;

# Apache
LoadModule deflate_module modules/mod_deflate.so
<Location />
    SetOutputFilter DEFLATE
</Location>
```

### 2. 캐시 설정

```nginx
# Nginx 캐시 설정
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location = /index.html {
    expires 0;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 3. CDN 설정

```html
<!-- Google Fonts를 로컬로 호스팅 -->
<link rel="preload" href="/fonts/pretendard.woff2" as="font" type="font/woff2" crossorigin>

<!-- 또는 CDN 최적화 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## 📊 모니터링 설정

### 1. Google Analytics

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Error Monitoring

```javascript
// Simple error tracking
window.addEventListener('error', (event) => {
  console.error('Error occurred:', event.error);
  // Send to monitoring service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to monitoring service
});
```

## 🎯 Domain & DNS 설정

### 1. 커스텀 도메인 연결

#### Netlify
```bash
# Custom domain 설정
# Netlify Dashboard → Domain settings → Add custom domain
# DNS에서 CNAME 또는 A 레코드 설정
```

#### Cloudflare DNS
```
Type: CNAME
Name: www
Content: amazing-curie-123456.netlify.app

Type: CNAME  
Name: @
Content: amazing-curie-123456.netlify.app
```

### 2. SSL 인증서

대부분의 호스팅 서비스에서 자동으로 Let's Encrypt SSL 제공:
- ✅ Netlify: 자동 SSL
- ✅ Vercel: 자동 SSL  
- ✅ GitHub Pages: 자동 SSL
- ✅ Firebase: 자동 SSL

## 🚀 배포 후 체크리스트

### ✅ 필수 확인사항

- [ ] HTTPS 정상 작동
- [ ] 모든 페이지 접근 가능
- [ ] 모바일 반응형 정상 작동
- [ ] 브라우저 콘솔 에러 없음
- [ ] Lighthouse 점수 확인 (90+ 권장)
- [ ] 로딩 속도 확인 (<3초)
- [ ] PWA 설치 가능 여부

### 📱 모바일 테스트

- [ ] iOS Safari 정상 작동
- [ ] Android Chrome 정상 작동
- [ ] 터치 인터랙션 정상
- [ ] 화면 회전 대응
- [ ] 키보드 입력 정상

### 🔍 SEO & 메타데이터

- [ ] 페이지 제목 적절히 설정
- [ ] 메타 설명 작성
- [ ] Open Graph 태그 설정
- [ ] robots.txt 파일 생성
- [ ] sitemap.xml 생성 (필요시)

## 🔧 문제 해결

### 일반적인 배포 이슈

#### 1. 리소스 경로 문제
```html
<!-- 절대 경로 사용 권장 -->
<link rel="stylesheet" href="/style.css">
<script src="/script.js"></script>
```

#### 2. CORS 문제
```javascript
// 로컬에서만 발생하는 경우
// 배포 후에는 같은 도메인이므로 해결됨
```

#### 3. 캐시 문제
```html
<!-- 버전 쿼리 추가 -->
<link rel="stylesheet" href="/style.css?v=1.0.0">
<script src="/script.js?v=1.0.0"></script>
```

## 📞 지원 및 모니터링

### 1. 에러 리포팅 설정
- GitHub Issues 또는 이메일 연결
- 사용자 피드백 수집 시스템

### 2. 업데이트 프로세스
```bash
# 업데이트 배포
git add .
git commit -m "Update: [변경사항]"
git push origin main

# 자동 배포 (CI/CD 설정시)
# 또는 수동 재배포
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: 2025-07-28  
**Compatible with**: CupNote Prototype v1.0.0