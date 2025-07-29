# ☕ CupNote - 나의 커피 감각 저널

<div align="center">
  <img src="cupnote-app/public/icons/icon-512x512.png" alt="CupNote Logo" width="200" />
  
  **당신의 커피 감각을 기록하고, 로스터의 의도를 이해하며, 커피 여정을 성장시키세요**

  [![Deploy](https://img.shields.io/github/actions/workflow/status/taco0513/CupNote/deploy.yml?label=Deploy)](https://github.com/taco0513/CupNote/actions)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Vue](https://img.shields.io/badge/Vue-3.5+-brightgreen.svg)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
</div>

## 🌟 CupNote란?

CupNote는 커피 애호가들이 자신의 테이스팅 경험을 기록하고, 로스터의 의도와 비교하며, 감각을 발전시킬 수 있도록 도와주는 웹 애플리케이션입니다.

### 🎯 핵심 기능

- **📝 테이스팅 기록**: 향미, 감각, 균형을 체계적으로 기록
- **🎯 Match Score**: 로스터 노트와의 일치도를 AI가 분석
- **📊 성장 추적**: 시간에 따른 감각 발전을 시각화
- **🏆 게이미피케이션**: 배지와 레벨로 동기부여
- **👥 커뮤니티**: 다른 사람들의 테이스팅 경험과 비교

## 🚀 시작하기

### 온라인으로 사용하기
[https://cupnote.vercel.app](https://cupnote.vercel.app) 에서 바로 사용할 수 있습니다.

### 로컬 개발 환경

#### 필요 사항
- Node.js 20+ 또는 Bun 1.0+
- Git

#### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/taco0513/CupNote.git
cd CupNote

# 의존성 설치 (Bun 사용 시 - 권장)
cd cupnote-app
bun install

# 또는 npm 사용 시
npm install

# 개발 서버 실행
bun dev
# 또는
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 🛠️ 기술 스택

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: CSS with modern features
- **PWA**: Capacitor + Vite PWA

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

### Development Tools
- **Package Manager**: Bun (30x faster than npm)
- **Testing**: Vitest + Playwright
- **Linting**: ESLint + Prettier
- **Version Control**: Git + GitHub

## 📁 프로젝트 구조

```
CupNote/
├── cupnote-app/          # Vue 애플리케이션
│   ├── src/
│   │   ├── components/   # 재사용 가능한 컴포넌트
│   │   ├── views/        # 페이지 컴포넌트
│   │   ├── stores/       # Pinia 상태 관리
│   │   ├── utils/        # 유틸리티 함수
│   │   └── assets/       # 정적 자원
│   ├── e2e/             # E2E 테스트
│   └── tests/           # 단위 테스트
├── docs/                # 프로젝트 문서
├── Foundation/          # 기획 문서
├── MASTER_PLAYBOOK/     # AI 개발 가이드
└── checkpoints/         # 개발 진행 기록
```

## 🧪 테스트

```bash
# 단위 테스트 실행
bun test:unit

# E2E 테스트 실행
bun test:e2e

# 테스트 커버리지
bun test:coverage
```

## 🚀 배포

### 자동 배포
- `main` 브랜치에 push 시 자동으로 프로덕션 배포
- Pull Request 생성 시 미리보기 배포

### 수동 배포
```bash
# Vercel CLI로 배포
vercel --prod
```

## 📖 문서

- [배포 가이드](docs/deployment-guide.md)
- [개발 가이드](docs/development-guide.md)
- [아키텍처 문서](docs/architecture.md)
- [API 문서](docs/api-reference.md)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발**: [@taco0513](https://github.com/taco0513)
- **AI 협업**: Claude Code by Anthropic

## 🙏 감사의 말

- Vue.js 팀과 커뮤니티
- Supabase 팀
- 모든 오픈소스 기여자들
- 커피를 사랑하는 모든 분들

---

<div align="center">
  Made with ☕ and ❤️ by CupNote Team
</div>