# CupNote 문서화

> 나만의 커피 여정을 기록하는 온라인 커피 일기 - 개발 문서

## 📚 문서 구조

### 🎯 [기능 문서](./features/)

구현된 기능들의 상세 설명과 사용법

- [검색 및 필터링](./features/SEARCH_AND_FILTER.md) - 커피 기록 검색/필터링 시스템 ✅
- [성취 시스템](./features/ACHIEVEMENTS_SYSTEM.md) - 30+ 배지 및 레벨링 시스템 ✅
- [모바일 최적화](./features/MOBILE_OPTIMIZATION.md) - 반응형 디자인 및 터치 최적화 ✅
- [다크 모드 시스템](./features/DARK_MODE_THEME_SYSTEM.md) - 라이트/다크/시스템 테마 지원 ✅
- [테스트 커버리지](./features/TEST_COVERAGE_SYSTEM.md) - 단위/컴포넌트/E2E 테스트 ✅
- [커뮤니티 커핑](./features/COMMUNITY_CUPPING.md) - 그룹 커핑 세션 및 평가 비교 🚧

### 🛠️ [API 문서](./api/)

컴포넌트와 함수들의 기술적 명세

- [컴포넌트 API](./api/COMPONENTS.md) - React 컴포넌트 사용법
- [타입 정의](./api/TYPES.md) - TypeScript 인터페이스
- [유틸리티 함수](./api/UTILITIES.md) - 헬퍼 함수들

### 📖 [개발 가이드](./guides/)

개발자를 위한 가이드 문서

- [시작하기](./guides/GETTING_STARTED.md) - 프로젝트 설정 가이드
- [기여 가이드](./guides/CONTRIBUTING.md) - 개발 참여 방법
- [코딩 컨벤션](./guides/CODING_CONVENTIONS.md) - 코드 스타일 가이드

### 📝 [변경사항](./changelog/)

버전별 업데이트 내역

- [CHANGELOG.md](./changelog/CHANGELOG.md) - 전체 변경사항 ✅
- [릴리즈 노트](./changelog/RELEASES.md) - 주요 릴리즈

## 🚀 빠른 시작

1. **프로젝트 클론**

```bash
git clone <repository-url>
cd CupNote
```

2. **의존성 설치**

```bash
npm install
```

3. **개발 서버 실행**

```bash
npm run dev
```

4. **브라우저에서 확인**

```
http://localhost:3001
```

## 🏗️ 기술 스택

- **Frontend**: Next.js 15.4.5, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0, CSS Variables
- **Database**: Supabase (PostgreSQL + Storage)
- **Authentication**: Supabase Auth
- **Testing**: Vitest, React Testing Library, Playwright
- **데이터**: Supabase + LocalStorage (Hybrid)
- **Theme**: Light/Dark/System 모드 지원
- **빌드**: npm scripts
- **배포**: 준비 완료

## 📊 프로젝트 현황

- ✅ **기본 커피 기록 시스템** - 4단계 플로우, 모드별 특화
- ✅ **Supabase 백엔드 통합** - 클라우드 데이터베이스, 인증, 스토리지
- ✅ **검색 및 필터링 기능** - 실시간 검색, 고급 필터, 다중 태그
- ✅ **PWA 지원** - 오프라인 동작, 설치 가능, 백그라운드 동기화
- ✅ **성능 최적화** - 2단계 캐싱, 지연 로딩, 페이지네이션
- ✅ **이미지 업로드** - Supabase Storage, 자동 압축, 썸네일
- ✅ **테스트 커버리지** - 단위/컴포넌트/E2E 테스트 (Vitest, Playwright)
- ✅ **다크 모드 시스템** - 라이트/다크/시스템 모드, CSS Variables
- ✅ **모바일 최적화** - 반응형 디자인, 터치 최적화, 하단 네비게이션
- ✅ **성취 시스템** - 30+ 배지, 레벨링, 포인트 시스템
- ✅ **통계 & 설정** - 데이터 분석, 시각화, 내보내기/가져오기
- 🚧 **커뮤니티 커핑** - 설계 완료, 구현 준비
- 📋 **푸시 알림** - 예정

## 🤝 기여하기

이 프로젝트에 기여하고 싶으시다면 [기여 가이드](./guides/CONTRIBUTING.md)를 참고해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**문서 버전**: 1.1  
**최종 업데이트**: 2025-01-31  
**관리자**: CupNote Team
