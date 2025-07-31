# ☕ CupNote

> 누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간

[![Vercel](https://vercelbadges.com/cupnote.vercel.app)](https://cupnote.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-enabled-success)](https://web.dev/progressive-web-apps/)

## 🎯 프로젝트 소개

**CupNote v1.0.0 RC**는 스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼입니다. (라이트 모드 전용)

전문가의 복잡한 용어에 부담을 느끼지 않고, 자신만의 언어로 커피를 기록하고 다른 사람들과 경험을 나눌 수 있습니다.

### 🌐 데모
- **라이브 데모**: https://cupnote.vercel.app
- **프로덕션 준비 완료**: ✅ PWA, 오프라인 지원, Supabase DB 연동

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

## 📱 주요 기능

### 1. 개인 커피 일기

- 나만의 언어로 커피 맛 기록
- 로스터 노트와 내 느낌 비교
- 사진, 날짜, 장소, 함께한 사람 기록

### 2. 맛 표현 시스템

- **편하게 쓰기 모드**: "새콤달콤한 사탕 같아요"
- **전문가 모드**: "자몽, 베르가못, 꿀, 밝은 산미"
- 두 모드를 자유롭게 전환

### 3. 성취 시스템 ✅

- 30+ 배지 시스템
- 레벨 및 경험치 트래킹
- 개인 성장 시각화

### 4. PWA 기능 ✅

- 오프라인 지원
- 앱 설치 가능
- 배경 동기화

### 5. 통계 & 분석 ✅

- 커피 기록 시각화
- 데이터 내보내기/가져오기
- 선호도 패턴 분석

### 6. 커뮤니티 기능 (v2.0 예정)

- 같은 원두를 마신 사람들의 기록 비교
- 온라인 블라인드 테이스팅
- 서로의 표현 공유 & 학습

## 📂 프로젝트 구조

```
cupnote/
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React 컴포넌트
│   ├── types/         # TypeScript 타입 정의
│   ├── lib/           # 유틸리티 함수
│   ├── hooks/         # Custom React hooks
│   └── utils/         # 헬퍼 함수
├── public/            # 정적 파일
├── prisma/            # DB 스키마 (예정)
└── tests/             # 테스트 파일 (예정)
```

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
