# CupNote 문서화 인덱스

## 📚 문서 개요

CupNote 프로젝트의 모든 문서를 체계적으로 정리한 통합 인덱스입니다. 역할별, 목적별로 필요한 문서를 빠르게 찾을 수 있습니다.

## 🎯 역할별 추천 문서

### 👨‍💻 신규 개발자
**프로젝트 시작 순서**:
1. [개발 환경 설정](./DEVELOPMENT_SETUP.md) - 로컬 환경 구축
2. [컴포넌트 가이드](./COMPONENTS_GUIDE.md) - UI 컴포넌트 이해
3. [API 레퍼런스](./API_REFERENCE.md) - 비즈니스 로직 파악
4. [TastingFlow v2.0 아키텍처](./TASTINGFLOW_V2_ARCHITECTURE.md) - 핵심 시스템 이해

### 🏗️ 시스템 아키텍트
**설계 관련 문서**:
- [TastingFlow v2.0 아키텍처](./TASTINGFLOW_V2_ARCHITECTURE.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- [시스템 아키텍처](../decisions/SYSTEM_ARCHITECTURE.md)
- [성능 최적화 전략](../patterns/PERFORMANCE_OPTIMIZATION.md)

### 🎨 프론트엔드 개발자
**UI/UX 관련 문서**:
- [컴포넌트 가이드](./COMPONENTS_GUIDE.md)
- [TastingFlow v2.0 아키텍처](./TASTINGFLOW_V2_ARCHITECTURE.md) (UI/UX 가이드 섹션)
- [PWA 구현](../patterns/PWA_IMPLEMENTATION.md)
- [반응형 디자인](../patterns/RESPONSIVE_DESIGN.md)

### 🗄️ 백엔드 개발자
**데이터 및 API 문서**:
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- [API 레퍼런스](./API_REFERENCE.md)
- [Supabase 통합](../patterns/SUPABASE_INTEGRATION.md)
- [캐싱 전략](../patterns/CACHING_STRATEGY.md)

### 🧪 QA 엔지니어
**테스트 관련 문서**:
- [테스트 전략](../patterns/TESTING_STRATEGY.md)
- [E2E 테스트 가이드](../patterns/E2E_TESTING.md)
- [성능 테스트](../patterns/PERFORMANCE_TESTING.md)

### 🚀 DevOps 엔지니어
**배포 및 운영 문서**:
- [배포 가이드](./DEPLOYMENT_GUIDE.md)
- [모니터링 설정](../patterns/MONITORING_SETUP.md)
- [CI/CD 파이프라인](../decisions/CI_CD_PIPELINE.md)

### 📝 기획자/PM
**기능 및 비즈니스 문서**:
- [기능 명세서](../features/CURRENT_PAGES.md)
- [TastingFlow v2.0 시스템](../features/TASTINGFLOW_V2_SYSTEM.md)
- [성취 시스템](../features/ACHIEVEMENT_SYSTEM.md)
- [Match Score v2.0](../features/MATCH_SCORE_ACCURACY_IMPROVEMENT_PLAN.md)

## 📂 문서 구조

### `/docs/current/` - 현재 활성 문서
```
docs/current/
├── DEVELOPMENT_SETUP.md        # 🚀 개발 환경 설정
├── COMPONENTS_GUIDE.md         # 🧩 컴포넌트 가이드  
├── API_REFERENCE.md            # 📡 API 레퍼런스
├── DATABASE_SCHEMA.md          # 🗄️ 데이터베이스 스키마
├── TASTINGFLOW_V2_ARCHITECTURE.md # 🏗️ TastingFlow v2.0 아키텍처
├── DEPLOYMENT_GUIDE.md         # 🚢 배포 가이드
└── DOCUMENTATION_INDEX.md      # 📚 이 문서
```

### `/docs/current/features/` - 기능 명세
```
features/
├── CURRENT_PAGES.md            # 현재 페이지 명세
├── TASTINGFLOW_V2_SYSTEM.md    # TastingFlow v2.0 시스템
├── ACHIEVEMENT_SYSTEM.md       # 성취 시스템
├── MATCH_SCORE_ACCURACY_IMPROVEMENT_PLAN.md # Match Score 개선 계획
├── COMMUNITY_MATCH_SCORE_V2.md # 커뮤니티 매치 스코어
├── OFFLINE_SYNC_SYSTEM.md      # 오프라인 동기화
├── PWA_FEATURES.md             # PWA 기능
├── IMAGE_UPLOAD_SYSTEM.md      # 이미지 업로드
├── SEARCH_FILTER_SYSTEM.md     # 검색 및 필터
└── RECIPE_LIBRARY_SYSTEM.md    # 레시피 라이브러리
```

### `/docs/current/patterns/` - 개발 패턴
```
patterns/
├── CACHING_STRATEGY.md         # 캐싱 전략
├── ERROR_HANDLING.md           # 에러 처리 패턴
├── PERFORMANCE_OPTIMIZATION.md # 성능 최적화
├── PWA_IMPLEMENTATION.md       # PWA 구현
├── RESPONSIVE_DESIGN.md        # 반응형 디자인
├── SUPABASE_INTEGRATION.md     # Supabase 통합
├── TESTING_STRATEGY.md         # 테스트 전략
└── E2E_TESTING.md             # E2E 테스트
```

### `/docs/current/decisions/` - 기술 결정
```
decisions/
├── SYSTEM_ARCHITECTURE.md     # 시스템 아키텍처 결정
├── TECHNOLOGY_STACK.md        # 기술 스택 선택
├── DATABASE_DESIGN.md         # 데이터베이스 설계
├── CI_CD_PIPELINE.md          # CI/CD 파이프라인
├── PERFORMANCE_MONITORING.md  # 성능 모니터링
└── MIGRATION_STRATEGY.md      # 마이그레이션 전략
```

### `/docs/current/troubleshooting/` - 문제 해결
```
troubleshooting/
├── ENHANCED_MATCH_SCORE_BUILD_ISSUES.md # Enhanced Match Score 빌드 이슈
├── COMMON_ISSUES.md           # 일반적인 문제들
├── DEPLOYMENT_ISSUES.md       # 배포 관련 문제
└── PERFORMANCE_ISSUES.md      # 성능 관련 문제
```

## 🔍 주제별 문서 찾기

### 시작하기
- 🚀 [개발 환경 설정](./DEVELOPMENT_SETUP.md)
- 📱 [프로젝트 개요](../../README.md)
- 🎯 [기능 명세서](../features/CURRENT_PAGES.md)

### 아키텍처 & 설계
- 🏗️ [TastingFlow v2.0 아키텍처](./TASTINGFLOW_V2_ARCHITECTURE.md)
- 🗄️ [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- 🎨 [시스템 아키텍처](../decisions/SYSTEM_ARCHITECTURE.md)
- 🔧 [기술 스택](../decisions/TECHNOLOGY_STACK.md)

### 개발 가이드
- 🧩 [컴포넌트 가이드](./COMPONENTS_GUIDE.md)
- 📡 [API 레퍼런스](./API_REFERENCE.md)
- 🎭 [TastingFlow 시스템](../features/TASTINGFLOW_V2_SYSTEM.md)
- 🏆 [성취 시스템](../features/ACHIEVEMENT_SYSTEM.md)

### 배포 & 운영
- 🚢 [배포 가이드](./DEPLOYMENT_GUIDE.md)
- 📊 [성능 모니터링](../decisions/PERFORMANCE_MONITORING.md)
- 🔄 [CI/CD 파이프라인](../decisions/CI_CD_PIPELINE.md)
- 📱 [PWA 구현](../patterns/PWA_IMPLEMENTATION.md)

### 테스트 & 품질
- 🧪 [테스트 전략](../patterns/TESTING_STRATEGY.md)
- 🎯 [E2E 테스트](../patterns/E2E_TESTING.md)
- 🚀 [성능 최적화](../patterns/PERFORMANCE_OPTIMIZATION.md)
- 🛠️ [에러 처리](../patterns/ERROR_HANDLING.md)

### 기능 상세
- ☕ [TastingFlow v2.0](../features/TASTINGFLOW_V2_SYSTEM.md)
- 🎯 [Match Score v2.0](../features/MATCH_SCORE_ACCURACY_IMPROVEMENT_PLAN.md)
- 🏆 [성취 시스템](../features/ACHIEVEMENT_SYSTEM.md)
- 🔍 [검색 & 필터](../features/SEARCH_FILTER_SYSTEM.md)
- 📱 [PWA 기능](../features/PWA_FEATURES.md)

### 문제 해결
- 🔧 [Enhanced Match Score 빌드 이슈](../troubleshooting/ENHANCED_MATCH_SCORE_BUILD_ISSUES.md)
- ❓ [일반적인 문제들](../troubleshooting/COMMON_ISSUES.md)
- 🚀 [배포 관련 문제](../troubleshooting/DEPLOYMENT_ISSUES.md)
- ⚡ [성능 관련 문제](../troubleshooting/PERFORMANCE_ISSUES.md)

## 📋 문서 상태

### ✅ 완성된 문서 (2025-08-02 기준)

**핵심 문서**:
- ✅ 개발 환경 설정 가이드
- ✅ 컴포넌트 가이드 (43개 컴포넌트)
- ✅ API 레퍼런스 (전체 모듈)
- ✅ 데이터베이스 스키마 (ERD 포함)
- ✅ TastingFlow v2.0 아키텍처
- ✅ 배포 가이드

**기능 문서**:
- ✅ 현재 페이지 명세 (31개 페이지)
- ✅ TastingFlow v2.0 시스템
- ✅ 성취 시스템 (16개 성취)
- ✅ Match Score 정확도 개선 계획
- ✅ 커뮤니티 매치 스코어 v2.0
- ✅ 오프라인 동기화 시스템
- ✅ PWA 기능 구현
- ✅ 이미지 업로드 시스템
- ✅ 검색 및 필터 시스템
- ✅ 레시피 라이브러리 시스템

**개발 패턴**:
- ✅ 캐싱 전략 (2단계 캐싱)
- ✅ 에러 처리 패턴
- ✅ 성능 최적화 전략
- ✅ PWA 구현 가이드
- ✅ 반응형 디자인 패턴
- ✅ Supabase 통합 가이드
- ✅ 테스트 전략 (70% 커버리지)
- ✅ E2E 테스트 가이드

**기술 결정**:
- ✅ 시스템 아키텍처 결정
- ✅ 기술 스택 선택 (Next.js 15 + Supabase)
- ✅ 데이터베이스 설계 결정
- ✅ CI/CD 파이프라인 설계
- ✅ 성능 모니터링 전략
- ✅ 마이그레이션 전략

**문제 해결**:
- ✅ Enhanced Match Score 빌드 이슈

### 🚧 계획된 문서

**사용자 가이드**:
- 📋 사용자 매뉴얼
- ❓ FAQ 및 문제해결
- 🎯 기능별 튜토리얼

**기여자 가이드**:
- 🤝 기여 가이드라인
- 📝 코딩 컨벤션
- 🔄 PR 템플릿

**고급 주제**:
- 🔐 보안 가이드
- 📊 분석 및 메트릭
- 🌍 국제화 (i18n)

## 🔄 문서 업데이트 정책

### 업데이트 주기
- **핵심 문서**: 기능 변경 시 즉시
- **기능 문서**: 스프린트 종료 시
- **패턴 문서**: 월 1회 리뷰
- **결정 문서**: 결정 변경 시 즉시

### 버전 관리
- 문서는 코드와 함께 Git으로 관리
- 중요 변경사항은 CHANGELOG.md에 기록
- 브레이킹 체인지는 마이그레이션 가이드 제공

### 문서 리뷰
- 모든 문서 변경은 PR 리뷰 필수
- 기술 리드가 아키텍처 문서 승인
- PM이 기능 문서 승인

## 💡 문서 작성 가이드라인

### 구조
1. **목차**: 긴 문서는 반드시 포함
2. **개요**: 문서의 목적과 범위 명시
3. **상세 내용**: 계층적 구조로 작성
4. **예시**: 코드 예시나 다이어그램 포함
5. **관련 문서**: 상호 참조 링크

### 스타일
- **마크다운**: GitHub Flavored Markdown 사용
- **이모지**: 가독성을 위해 적절히 사용
- **다이어그램**: Mermaid 또는 이미지 사용
- **코드**: 언어별 구문 강조 적용

### 품질
- **정확성**: 최신 코드와 일치하는 내용
- **완전성**: 필요한 모든 정보 포함
- **명확성**: 대상 독자에게 적합한 설명
- **일관성**: 전체 문서 간 스타일 통일

## 🔗 외부 참고 자료

### 기술 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

### 테스트 도구
- [Vitest 문서](https://vitest.dev/)
- [Playwright 문서](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)

### 개발 도구
- [ESLint 규칙](https://eslint.org/docs/rules/)
- [Prettier 설정](https://prettier.io/docs/en/configuration.html)
- [Husky 가이드](https://typicode.github.io/husky/)

---

**📅 최종 업데이트**: 2025-08-02  
**✏️ 작성자**: Claude Code SuperClaude  
**🔄 버전**: 1.0.0