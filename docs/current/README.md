# CupNote v1.2.0 문서화

> 나만의 커피 여정을 기록하는 하이브리드 디자인 커피 앱 - 개발 문서

## 🎨 v1.2.0 하이브리드 디자인 시스템

### 핵심 디자인 문서
- **[HYBRID_DESIGN_SYSTEM_OVERVIEW.md](./HYBRID_DESIGN_SYSTEM_OVERVIEW.md)** - 🆕 하이브리드 디자인 시스템 전체 개요
- **[HYBRID_COMPONENT_GUIDE.md](./HYBRID_COMPONENT_GUIDE.md)** - 컴포넌트 사용법과 패턴
- **[MOBILE_UX_GUIDE.md](./MOBILE_UX_GUIDE.md)** - 모바일 UX 최적화 가이드

### 디자인 철학: "Minimal Structure + Premium Visual Quality"
- **글래스모픽 효과**: `backdrop-blur-sm`, `bg-white/90` 일관된 시각적 효과
- **커피 테마 그라데이션**: `from-coffee-400 to-coffee-500` 프리미엄 브랜딩
- **통합 디자인 토큰**: CSS 변수 기반 글로벌 디자인 시스템
- **모바일 최적화**: 네이티브 앱 수준 터치 인터랙션

## 📚 문서 구조

### 🎯 [기능 문서](./features/)

구현된 기능들의 상세 설명과 사용법

- [장비 통합 시스템](./features/EQUIPMENT_INTEGRATION.md) - 🆕 HomeCafe 장비 관리 ✅
- [커뮤니티 매치 스코어 v2.0](./features/COMMUNITY_MATCH_SCORE_V2.md) - 🆕 커뮤니티 기반 점수 시스템 ✅
- [검색 및 필터링](./features/SEARCH_AND_FILTER.md) - 커피 기록 검색/필터링 시스템 ✅
- [성취 시스템](./features/ACHIEVEMENTS_SYSTEM.md) - 30+ 배지 및 레벨링 시스템 ✅
- [모바일 최적화](./features/MOBILE_OPTIMIZATION.md) - 반응형 디자인 및 터치 최적화 ✅
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

## 📊 프로젝트 현황 (v1.2.0 기준)

### ✅ **v1.2.0 하이브리드 디자인 시스템 완성**

**🎨 완료된 디자인 시스템**:
- ✅ **글로벌 디자인 토큰**: CSS 변수 기반 통합 시스템 (globals.css)
- ✅ **컴포넌트 표준화**: PageHeader, Card, UnifiedButton 100% 하이브리드 적용
- ✅ **글래스모픽 효과**: `backdrop-blur-sm` 일관된 시각적 효과
- ✅ **프리미엄 그라데이션**: 커피 테마 그라데이션 전체 적용
- ✅ **텍스트 대비율 개선**: 접근성 향상 (WCAG 2.1 AA) - 성취 페이지 가독성 개선
- ✅ **버튼/필터 표준화**: 내 기록, 설정, 프로필 페이지 통합 디자인 토큰 적용
- ✅ **모바일 터치 최적화**: 네이티브 앱 수준 인터랙션

**🛡️ 관리자 대시보드 시스템**:
- ✅ **Admin Dashboard**: 8개 페이지 완전한 관리자 시스템
- ✅ **Data Management**: 카페/로스터리/커피 원두 CSV 관리
- ✅ **User Management**: 사용자 계정 및 활동 관리
- ✅ **Performance Monitoring**: 실시간 성능 및 에러 추적

**☕ 3-Mode 시스템**:
- ✅ **Cafe Mode** - 5-7분 카페 경험 기록 (7단계 플로우)
- ✅ **HomeCafe Mode** - 8-12분 추출 레시피 + 장비 통합 시스템
- ✅ **Lab Mode** - 15-20분 SCA 표준 전문가 평가

**Coffee Info Screen (Step1)**:
- ✅ **Progressive Disclosure** - 기본/고급 정보 확장 패널
- ✅ **모드별 필수 필드** - Cafe(카페명), HomeCafe(로스터리), Pro(전문가 정보)
- ✅ **온도 선택** - HOT/ICED 시각적 버튼
- ✅ **스페셜티 정보** - 원산지, 품종, 가공방식, 로스팅 레벨, 고도

**HomeCafe 레시피 관리**:
- ✅ **4개 드리퍼** - V60, Kalita Wave, Origami, April
- ✅ **정밀 레시피 설정** - 원두량 다이얼, 비율 프리셋(1:15~1:18)
- ✅ **추출 타이머** - 시작/정지/랩타임 기록
- ✅ **레시피 저장/불러오기** - localStorage 기반 개인 관리
- ✅ **분쇄도 시스템** - 기본 레벨 + 그라인더 상세 설정

**백엔드 & 인프라**:
- ✅ **Supabase 통합** - PostgreSQL + Auth + Storage
- ✅ **프로덕션 배포** - Vercel 라이브 (https://cupnote.vercel.app)
- ✅ **검색 및 필터링** - 실시간 검색, 고급 필터, 다중 태그
- ✅ **PWA 지원** - 오프라인 동작, 설치 가능, 백그라운드 동기화
- ✅ **성능 최적화** - 2단계 캐싱, 지연 로딩, 페이지네이션
- ✅ **이미지 업로드** - 자동 압축, 썸네일 생성
- ✅ **성취 시스템** - 30+ 배지, 레벨링, 포인트 시스템
- ✅ **모바일 최적화** - 반응형 디자인, 터치 최적화

### 🚧 **개발 중인 기능**

- 📋 **Pro Mode SCA 표준** - TDS 측정, QC 리포트, Flavor Wheel
- 🚧 **HomeCafe Phase 3** - 드리퍼별 추출 가이드 시스템
- 🚧 **HomeCafe Phase 4** - 결과 분석 + 개선 제안 알고리즘

### 📋 **계획된 기능**

- 📋 **커뮤니티 커핑** - 그룹 세션, 평가 비교
- 📋 **푸시 알림** - 커피 기록 리마인더
- 📋 **OCR 스캔** - 원두 패키지 자동 인식

## 🤝 기여하기

이 프로젝트에 기여하고 싶으시다면 [기여 가이드](./guides/CONTRIBUTING.md)를 참고해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**문서 버전**: 1.3.0  
**최종 업데이트**: 2025-08-03 (v1.2.0 하이브리드 디자인 시스템 완성)  
**관리자**: CupNote Team
