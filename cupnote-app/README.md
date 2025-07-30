# ☕ CupNote - Smart Coffee Tasting Companion

> 세상 모든 커피의 향미를 기록하고 분석하는 스마트 테이스팅 플랫폼

CupNote는 커피 애호가들을 위한 전문적인 테이스팅 도구입니다. SCA(Specialty Coffee Association) 표준을 기반으로 한 과학적 분석과 직관적인 UI를 결합하여, 누구나 쉽게 커피의 향미를 탐색하고 기록할 수 있습니다.

## 🎯 주요 기능

### 3가지 테이스팅 모드

- **☕ Cafe Mode**: 카페에서 마시는 커피 (3-5분)
- **🏠 HomeCafe Mode**: 집에서 내려 마시는 커피 (5-8분)
- **🎯 Pro Mode**: SCA 표준 전문 품질 평가 (8-12분)

### 핵심 기능

- 🌸 **Flavor Wheel**: SCA 표준 향미 휠 기반 선택
- 👅 **Sensory Analysis**: 단맛, 산미, 쓴맛 등 감각 표현
- 📊 **Match Score**: AI 기반 로스터 노트 매칭 점수
- 📈 **Progress Tracking**: 개인 테이스팅 기록 및 통계
- 🏆 **Achievement System**: 테이스팅 성취 및 레벨 시스템

### Pro Mode 전문 기능

- ⚗️ **QC Measurement**: TDS, 추출율, 물 성분 분석
- 📋 **SCA Cupping**: 전문 커핑 평가 시스템
- 📊 **Golden Cup Chart**: 추출 품질 시각화
- 🔬 **Brewing Analytics**: 과학적 브루잉 데이터 분석

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18+ (권장: 20+)
- **Bun** (권장) 또는 npm/yarn/pnpm
- **Git**

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/taco0513/CupNote.git
cd CupNote/cupnote-app

# 의존성 설치 (Bun 권장 - 30배 빠름)
bun install
# 또는 npm install

# 환경 설정
cp .env.example .env.local
# .env.local 파일에서 Supabase 설정 입력

# 개발 서버 시작
bun dev
# 또는 npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 환경 설정

```bash
# .env.local 파일 생성 후 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── charts/         # Chart.js 기반 차트 컴포넌트
│   ├── pro/           # Pro 모드 전용 컴포넌트
│   ├── ErrorBoundary.vue      # 전역 에러 처리
│   ├── LoadingSpinner.vue     # 로딩 상태 UI
│   └── SkeletonLoader.vue     # 스켈레톤 로딩 UI
├── views/              # 페이지 컴포넌트
│   ├── tasting-flow/   # 테이스팅 플로우 페이지들
│   ├── HomeView.vue    # 메인 대시보드
│   ├── StatsView.vue   # 통계 및 차트
│   └── RecordsListView.vue    # 기록 목록
├── stores/             # Pinia 상태 관리
│   ├── tastingSession.ts      # 테이스팅 세션 관리
│   ├── notification.ts        # 알림 시스템
│   ├── auth.js        # 인증 관리 (JavaScript)
│   └── auth.ts        # 인증 타입 정의 (TypeScript)
├── composables/        # Vue 컴포저블
│   ├── useErrorHandler.ts     # 에러 처리
│   └── useFlowNavigation.ts   # 플로우 네비게이션
├── lib/               # 유틸리티 라이브러리
│   └── supabase.ts    # Supabase 클라이언트
└── router/            # Vue Router 설정
    └── index.ts       # 라우트 정의 및 가드
```

## 🛠️ 기술 스택

### Frontend

- **Vue 3** - Composition API & TypeScript
- **Vite** - 빠른 개발 서버 및 빌드
- **Pinia** - 현대적인 상태 관리
- **Vue Router** - SPA 라우팅
- **Chart.js** - 데이터 시각화
- **TypeScript** - 타입 안정성

### Backend & Database

- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - 메인 데이터베이스
- **Row Level Security** - 보안 정책
- **Real-time Subscriptions** - 실시간 데이터

### Development & Deployment

- **Bun** - 고성능 패키지 매니저 (권장)
- **ESLint** - 코드 품질 관리
- **Capacitor** - 모바일 앱 빌드
- **PWA** - 프로그레시브 웹 앱

## 📱 사용자 플로우

### Cafe Mode (7단계)

```
Mode Selection → Coffee Info → Flavor Selection →
Sensory Expression → Personal Comment → Roaster Notes → Result
```

### HomeCafe Mode (8단계)

```
Mode Selection → Coffee Info → HomeCafe Settings →
Flavor Selection → Sensory Expression → Personal Comment →
Roaster Notes → Result
```

### Pro Mode (12단계)

```
Mode Selection → Coffee Info → HomeCafe Settings →
Pro Brewing Data → QC Measurement → Pro QC Report →
Flavor Selection → Sensory Expression → Sensory Slider →
Personal Comment → Roaster Notes → Result
```

## 🎨 UI/UX 특징

- **프리미엄 커피 테마**: 따뜻한 커피 브라운 컬러 팔레트
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **직관적 네비게이션**: 단계별 진행 상황 표시
- **스켈레톤 로딩**: 빠른 체감 속도
- **에러 바운더리**: 안정적인 사용자 경험

## 🧪 테스팅

```bash
# 단위 테스트
bun test
# 또는 npm run test:unit

# E2E 테스트 (Playwright)
bun test:e2e
# 또는 npm run test:e2e

# 타입 검사
bun run type-check
# 또는 npm run type-check

# 린팅
bun run lint
# 또는 npm run lint
```

## 📦 배포

### 프로덕션 빌드

```bash
bun run build
npm run build
```

### 모바일 앱 빌드

```bash
# iOS
bunx cap run ios

# Android
bunx cap run android
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 개발 가이드라인

- **TypeScript**: 모든 새 코드는 TypeScript로 작성
- **Composition API**: Vue 3 Composition API 사용
- **Component**: 재사용 가능한 컴포넌트 설계
- **Testing**: 새 기능에 대한 테스트 작성
- **Documentation**: 중요한 변경사항 문서화

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **GitHub**: [CupNote Repository](https://github.com/taco0513/CupNote)
- **이슈 리포트**: [GitHub Issues](https://github.com/taco0513/CupNote/issues)

---

## 🎯 로드맵

- [x] **Phase 1**: 기본 테이스팅 플로우 (Cafe/HomeCafe/Pro)
- [x] **Phase 2**: 데이터 시각화 및 통계 대시보드
- [x] **Phase 3**: 실시간 진행도 추적 및 목표 설정
- [x] **Phase 4**: UI/UX 안정성 및 에러 처리 시스템
- [ ] **Phase 5**: 모바일 앱 및 PWA 최적화
- [ ] **Phase 6**: 소셜 기능 및 커뮤니티
- [ ] **Phase 7**: AI 기반 개인화 추천

**CupNote**와 함께 커피의 무한한 세계를 탐험해보세요! ☕✨
