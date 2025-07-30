# CupNote 문서화

> 나만의 커피 여정을 기록하는 온라인 커피 일기 - 개발 문서

## 📚 문서 구조

### 🎯 [기능 문서](./features/)

구현된 기능들의 상세 설명과 사용법

- [검색 및 필터링](./features/SEARCH_AND_FILTER.md) - 커피 기록 검색/필터링 시스템 ✅
- [상세 페이지](./features/DETAIL_PAGE.md) - Foundation 기반 완전한 상세 보기 ✅
- [데이터 저장](./features/LOCAL_STORAGE.md) - 로컬 스토리지 기반 데이터 관리 ✅
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
- **Styling**: Tailwind CSS 3.4.1
- **데이터**: Local Storage API
- **빌드**: npm scripts
- **배포**: 미정

## 📊 프로젝트 현황

- ✅ 기본 커피 기록 시스템
- ✅ 검색 및 필터링 기능
- ✅ Foundation 기반 상세 페이지
- ✅ 로컬 스토리지 데이터 관리
- ✅ 코드 품질 도구 (ESLint/Prettier)
- ✅ 통계 페이지 (데이터 시각화 및 분석)
- ✅ 설정 페이지 (개인화 및 데이터 관리)
- ✅ 네비게이션 시스템 (통합 UI/UX)
- 🚧 커뮤니티 커핑 기능 (설계 완료, 구현 준비)
- 📋 모바일 최적화 (예정)

## 🤝 기여하기

이 프로젝트에 기여하고 싶으시다면 [기여 가이드](./guides/CONTRIBUTING.md)를 참고해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-30  
**관리자**: CupNote Team
