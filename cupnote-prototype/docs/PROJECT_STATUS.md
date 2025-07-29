# CupNote Project Status

## Overview
CupNote은 커피 테이스팅 경험을 기록하고 분석하는 모바일 웹 애플리케이션입니다. 사용자가 커피의 맛을 한국어로 표현하고, 커피 전문가들의 테이스팅 노트와 비교하여 Match Score를 받을 수 있는 독특한 서비스입니다.

## Current Phase: 프로토타입 완성 → MVP 개발 준비
- 30분 프로토타입 ✅ Complete (HTML/CSS/JS)
- 기술 스택 결정 🎯 Next Step
- Phase 1 MVP 개발 ⏳ 2-3주 예정

## 프로토타입 완성 기능 분석

### 🎨 UI/UX 특징
1. **3가지 테이스팅 모드**
   - **Cafe Mode** (3-5분): 카페에서 빠른 기록
   - **Brew Mode** (5-8분): 홈브루잉 상세 기록
   - **Lab Mode** (8-12분): 전문가용 실험 데이터

2. **핵심 화면 구성** (8개 스크린)
   - Mode Selection → Coffee Info → (Brew Settings) → Flavor Selection
   - → (Sensory Mouthfeel) → Sensory Expression → Personal Notes
   - → Roaster Notes → Result

3. **독특한 기능**
   - 🏃 **브루 타이머**: 랩 기능으로 추출 단계별 시간 기록
   - 🇰🇷 **한국어 감각 표현**: 산미, 단맛, 쓴맛, 바디, 애프터, 밸런스
   - 📊 **Match Score**: 사용자 vs 로스터 노트 매칭률
   - 💾 **개인 레시피 저장**: 나만의 커피 설정 저장/불러오기

### 🛠️ 기술적 구현
1. **PWA (Progressive Web App)**
   - Service Worker로 오프라인 지원
   - manifest.json으로 앱 설치 가능
   - 캐싱 전략 구현

2. **프론트엔드 구조**
   - Vanilla JavaScript (프레임워크 없음)
   - CSS Design Tokens 시스템
   - 컴포넌트 기반 CSS 아키텍처
   - 모바일 우선 반응형 디자인

3. **백엔드 준비 상태**
   - API 서비스 레이어 (frontend/api.js)
   - RESTful API 설계 문서
   - JWT 인증 구조 계획

### 📁 프로젝트 구조
```
cupnote-prototype/
├── index.html          # 메인 HTML (690줄)
├── style.css           # 메인 스타일
├── design-tokens.css   # 디자인 토큰
├── components.css      # 컴포넌트 스타일
├── script.js          # 메인 로직
├── frontend/
│   └── api.js         # API 서비스 레이어
├── components/
│   └── feedback.js    # 베타 피드백 위젯
└── service-worker.js  # PWA 오프라인 지원
```

## 🎯 MVP 개발을 위한 다음 단계

### 1. 기술 스택 결정 필요
**Frontend 옵션**:
- **React Native**: 크로스 플랫폼, 큰 생태계, JavaScript 활용
- **Flutter**: 빠른 성능, 아름다운 UI, Dart 학습 필요
- **Expo**: React Native 기반, 빠른 개발, 쉬운 배포

**Backend 옵션**:
- **Node.js/Express**: JavaScript 일관성, 큰 생태계
- **Python/FastAPI**: 빠른 개발, 타입 힌트, 좋은 문서
- **Supabase**: BaaS, 빠른 프로토타이핑, 내장 인증

**Database 옵션**:
- **PostgreSQL**: 관계형, ACID, JSON 지원
- **MongoDB**: NoSQL, 유연한 스키마
- **Supabase**: PostgreSQL + 실시간 + 인증

### 2. 프로토타입에서 확인된 핵심 요구사항
- 모바일 중심 UX (터치 인터페이스)
- 오프라인 우선 아키텍처
- 실시간 타이머 기능
- 복잡한 다단계 폼 관리
- 한국어 데이터 처리

## Next Steps

### Week 1 (Beta Completion)
- [ ] 사용자 인증 시스템 완성
- [ ] 데이터 영속성 구현
- [ ] 기본 에러 처리
- [ ] 베타 테스터 모집

### Week 2 (Production Prep)
- [ ] 테스트 커버리지 80% 달성
- [ ] 성능 최적화
- [ ] 모니터링 시스템 구축
- [ ] 프로덕션 배포 준비

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with Refresh Tokens
- **PWA**: Service Worker, Web App Manifest
- **Package Manager**: Bun (preferred) / npm

## Key Decisions
1. **Mobile-First**: 모바일 우선 디자인 접근
2. **Offline Support**: PWA로 오프라인 기능 지원
3. **Korean UX**: 한국어 감각 표현 시스템
4. **Brew Timer**: 랩 기능이 있는 고유한 타이머
5. **Beta Feedback**: 내장된 피드백 수집 시스템

## Metrics Goals
- Page Load: <3s on 3G
- Offline Mode: 100% 기능 지원
- User Retention: 7-day retention >40%
- Beta Feedback: >50 responses

## Contact
- Project Lead: [Name]
- Tech Lead: [Name]
- Design Lead: [Name]

## 📊 프로토타입 분석 결과

### 주요 발견사항
1. **복잡도**: 8개 화면, 모드별 조건부 흐름
2. **데이터 모델**: Coffee, Tasting, User, Flavor, Expression 엔티티
3. **상태 관리**: 다단계 폼, 타이머 상태, 사용자 선택
4. **성능 요구**: 실시간 타이머, 오프라인 동기화

### MVP 우선순위
1. **Phase 1 (2-3주)**: 기본 기록 + 한국어 표현
2. **Phase 2 (2주)**: 소셜 기능 + 통계
3. **Phase 3 (3주)**: 고급 분석 + AI
4. **Phase 4 (2주)**: 수익화 + 확장

Last Updated: 2025-01-28