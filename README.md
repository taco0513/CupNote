# ☕ CupNote

> 누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간

[![Live](https://img.shields.io/badge/Live-mycupnote.com-success)](https://mycupnote.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-enabled-success)](https://web.dev/progressive-web-apps/)

## 🎯 프로젝트 소개

**CupNote v1.4.0**는 스페셜티 커피 애호가들을 위한 iOS TestFlight 출시 준비 완료된 커피 기록 & 커뮤니티 플랫폼입니다.

전문가의 복잡한 용어에 부담을 느끼지 않고, 자신만의 언어로 커피를 기록하고 다른 사람들과 경험을 나눌 수 있습니다.

### 🌐 라이브 서비스
- **프로덕션 URL**: https://mycupnote.com
- **상태**: ✅ v1.4.0 iOS TestFlight 런칭 준비 완료 (2025-08-06)
- **기능**: 완전한 PWA, 하이브리드 디자인, AI 분석 대시보드, 알림 시스템, 실시간 DB 연동
- **최근 업데이트**: AI 기반 고급 분석 대시보드 - 맛 프로파일 레이더 차트 & AI 추천 시스템

### 📱 TestFlight Beta (v1.4.0)
- **상태**: ✅ 런칭 준비 완료 (2025-08-06)
- **iOS 버전**: iPhone 전용 (iPad 지원 제거)
- **빌드**: Marketing Version 1.4.0 (Build 4), 모든 TestFlight 검증 통과
- **베타 문서**: [Beta Tester Guide](docs/current/beta-tester-guide.md), [Deployment Checklist](docs/current/testflight-deployment-checklist.md)

### 핵심 가치

- 🌱 **기록** — 기록할수록 더 섬세하게 느낀다
- 💬 **표현** — 내 언어로 편하게 말하면 된다
- 🤝 **공유** — 다른 사람 것도 보면 재밌고 배운다
- 📈 **성장** — 이 과정을 즐기다 보면 어느새 늘어있다

## 🚀 시작하기

### 필요 환경

- Node.js 18.17 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/cupnote.git
cd cupnote/cupnote

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행 (http://localhost:5173)
npm run dev
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 🛠 기술 스택

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Package Manager**: npm
- **Database**: PostgreSQL (Supabase) ✅
- **Authentication**: Supabase Auth ✅
- **Image Storage**: Supabase Storage ✅
- **Deployment**: Vercel ✅
- **PWA**: next-pwa ✅

## 🎨 하이브리드 디자인 시스템 (v1.2.0)

### "Minimal Structure + Premium Visual Quality"

CupNote만의 독특한 디자인 철학으로, 심플한 구조와 프리미엄 시각적 품질을 동시에 제공합니다.

#### 핵심 특징
- **🌟 글래스모픽 효과**: `backdrop-blur-sm`로 구현한 일관된 반투명 UI
- **☕ 커피 테마 그라데이션**: `from-coffee-400 to-coffee-500` 프리미엄 그라데이션
- **📱 모바일 최적화**: 터치 친화적 인터랙션 (`active:scale-95`)
- **🎯 통합 디자인 토큰**: CSS 변수 기반 일관된 디자인 시스템
- **♿ 접근성 향상**: 고대비 텍스트 색상으로 WCAG 2.1 AA 준수

#### 구현 범위
- ✅ **PageHeader**: 그라데이션 아이콘과 일관된 헤더 시스템
- ✅ **Card Component**: 글래스모픽 카드 (`bg-white/90 backdrop-blur-sm`)
- ✅ **UnifiedButton**: 하이브리드 그라데이션 버튼 시스템
- ✅ **Filter System**: 활성/비활성 상태별 통일된 스타일
- ✅ **Mobile UX**: 네이티브 앱 수준의 터치 경험

## 📱 주요 기능

### 1. 🎯 2-Mode 시스템 ✅

**상황에 맞는 2가지 전문화된 기록 모드**:

- **☕ Cafe Mode** (5-7분): 카페 방문 경험을 종합적으로 기록
- **🏠 HomeCafe Mode** (8-12분): 홈브루잉 레시피와 추출 데이터 관리 + 장비 통합
- **🧪 Lab Mode**: *(BACKLOG FOR FUTURE ROADMAP - v3.0+)*

### 2. 개인 커피 일기

- 나만의 언어로 커피 맛 기록
- 로스터 노트와 내 느낌 비교
- 사진, 날짜, 장소, 함께한 사람 기록

### 3. 맛 표현 시스템

- **편하게 쓰기 모드**: "새콤달콤한 사탕 같아요"
- **전문가 모드**: "자몽, 베르가못, 꿀, 밝은 산미"
- 두 모드를 자유롭게 전환

### 4. 성취 시스템 ✅

- 30+ 배지 시스템
- 레벨 및 경험치 트래킹
- 개인 성장 시각화

### 5. PWA 기능 ✅

- 오프라인 지원
- 앱 설치 가능
- 배경 동기화

### 6. 장비 통합 시스템 (NEW) ✅

- 홈카페 장비 설정 저장 (그라인더, 드리퍼, 저울, 케틀)
- HomeCafe 모드에서 자동 장비 연동
- 장비별 맞춤 추출 가이드라인
- 그라인더별 분쇄도 추천

### 7. 통계 & 분석 ✅

- 커피 기록 시각화
- 데이터 내보내기/가져오기
- 선호도 패턴 분석
- 통합 '내 기록' 페이지 (목록 + 통계)

### 8. AI 고급 분석 대시보드 ✅ (v1.3.0 NEW)

- **맛 프로파일 레이더 차트**: 6가지 지표 시각화 (산미, 향미, 쓴맛, 단맛, 바디, 아로마)
- **로스터리 선호도 트렌드**: 평점 및 방문 빈도 분석
- **계절별 취향 변화**: 시즌별 선호 패턴 추적
- **AI 추천 시스템**: 개인화된 카페 & 원두 추천
- **접근 경로**: 내 기록 → 분석 탭 → 고급 분석 대시보드

### 9. 스마트 알림 시스템 ✅ (v1.3.0 NEW)

- **4가지 알림 타입**: reminder, achievement, stats, system
- **브라우저 네이티브 알림**: 권한 관리 및 푸시 알림
- **커피 리마인더**: 정기적인 기록 알림
- **성취 알림**: 마일스톤 달성 시 자동 알림

### 10. 커뮤니티 기능 (v2.0 예정)

- 같은 원두를 마신 사람들의 기록 비교
- 온라인 블라인드 테이스팅
- 서로의 표현 공유 & 학습

## 📂 프로젝트 구조

```
CupNote/
├── src/                 # 🚀 메인 애플리케이션
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React 컴포넌트
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Supabase client & utilities
│   ├── types/          # TypeScript 타입 정의
│   └── utils/          # 헬퍼 함수
├── public/             # 정적 파일 (아이콘, 이미지)
├── docs/               # 📚 현재 문서
│   ├── current/        # 최신 기능 문서
│   │   ├── ADMIN_SYSTEM.md         # 관리자 시스템 종합 가이드
│   │   ├── ADMIN_FEATURES_SPEC.md  # 관리자 기능 상세 명세서
│   │   └── DEVELOPER_ONBOARDING.md # 개발자 온보딩 가이드
│   ├── development/    # 개발 히스토리 (체크포인트, 커버리지)
│   └── archive/        # 과거 문서 보관
├── e2e/                # 🧪 E2E 테스트 (Playwright)
├── supabase/           # 🗄️ 데이터베이스 설정
├── archive/            # 📦 보관용 (프로토타입, 개발 파일)
└── scripts/            # 🔧 유틸리티 스크립트
```

## 🛡️ 관리자 시스템

CupNote는 포괄적인 관리자 대시보드를 제공합니다.

### 빠른 시작
1. **관리자 계정 생성**: https://mycupnote.com/setup-admin
2. **관리자 로그인**: https://mycupnote.com/auth  
3. **대시보드 접근**: https://mycupnote.com/admin

### 주요 기능
- 📊 **시스템 대시보드**: 실시간 지표 및 시스템 현황
- 👥 **사용자 관리**: 사용자 계정, 활동 통계, 권한 관리
- ☕ **커피 기록 관리**: 모든 기록 조회 및 콘텐츠 관리
- 📈 **성능 모니터링**: 실시간 성능, 오류 추적, 시스템 상태
- 💬 **피드백 관리**: 베타 피드백, 버그 리포트, 사용자 문의
- 🗄️ **데이터 관리** (NEW v1.2.0): 카페/로스터리/커피 원두 통합 관리
  - **카페 관리**: 카페 정보, 상태 관리, 검증 시스템
  - **로스터리 관리**: 로스터리 정보, 피처드 관리, 전문 분야
  - **커피 원두 관리**: 원두 정보, 인기도 관리, 테이스팅 노트
- ⚙️ **시스템 설정**: 공지사항, 피처 플래그, 앱 설정

### 문서
- **[📋 관리자 시스템 종합 가이드](./docs/current/ADMIN_SYSTEM.md)** - 전체 시스템 개요
- **[📊 관리자 기능 상세 명세서](./docs/current/ADMIN_FEATURES_SPEC.md)** - 모든 기능 상세 설명
- **[🔧 관리자 계정 설정](./ADMIN_SETUP_GUIDE.md)** - 빠른 설정 가이드

## 👨‍💻 개발자 가이드

### 새 개발자 온보딩
- **[🚀 개발자 온보딩 가이드](./docs/current/DEVELOPER_ONBOARDING.md)** - 완전한 팀 합류 가이드
- **[⚙️ 프로젝트 설정](./CLAUDE.md)** - Claude Code 및 개발 환경 설정

### 개발 원칙
- **Package Manager**: npm 필수 사용 (bun, yarn 사용 금지)
- **Coding Style**: TypeScript + Tailwind CSS + React Hooks
- **Testing**: Vitest + Playwright + React Testing Library
- **Quality Gates**: ESLint + TypeScript + 70% 테스트 커버리지

## 🤝 기여하기

CupNote는 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📧 문의

- 이메일: contact@cupnote.com
- 웹사이트: https://cupnote.com (예정)

---

**언젠가 우리 모두가 전문가처럼 자신만의 언어로 커피를 이야기하는 날을 꿈꾸며.**
