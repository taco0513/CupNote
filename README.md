# ☕ CupNote

> 누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간

## 🎯 프로젝트 소개

CupNote는 스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼입니다.

전문가의 복잡한 용어에 부담을 느끼지 않고, 자신만의 언어로 커피를 기록하고 다른 사람들과 경험을 나눌 수 있습니다.

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
- **Database**: PostgreSQL + Prisma (예정)
- **Authentication**: NextAuth.js (예정)
- **Image Storage**: Cloudinary (예정)

## 📱 주요 기능

### 1. 개인 커피 일기

- 나만의 언어로 커피 맛 기록
- 로스터 노트와 내 느낌 비교
- 사진, 날짜, 장소, 함께한 사람 기록

### 2. 맛 표현 시스템

- **편하게 쓰기 모드**: "새콤달콤한 사탕 같아요"
- **전문가 모드**: "자몽, 베르가못, 꿀, 밝은 산미"
- 두 모드를 자유롭게 전환

### 3. 커뮤니티 커핑 (예정)

- 같은 원두를 마신 사람들의 기록 비교
- 온라인 블라인드 테이스팅
- 서로의 표현 공유 & 학습

### 4. 성장 트래킹 (예정)

- 감각 발달 과정 시각화
- 선호도 패턴 분석
- 커피 여정 타임라인

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
