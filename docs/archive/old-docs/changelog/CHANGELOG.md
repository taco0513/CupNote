# CHANGELOG

CupNote 프로젝트의 모든 주요 변경사항을 기록합니다.

## [0.9.4] - 2025-01-31

### 🎨 다크 모드 & 테마 시스템 완성

- **완전한 테마 시스템 구축**
  - 라이트 모드, 다크 모드, 시스템 모드 지원
  - CSS 변수 기반 동적 테마 색상 시스템
  - Tailwind CSS와 완전 통합된 테마 토큰
  - 부드러운 테마 전환 애니메이션 (0.3초)

- **ThemeProvider & Context**
  - React Context 기반 전역 테마 상태 관리
  - localStorage 기반 테마 설정 영구 저장
  - 시스템 테마 변경 실시간 감지 및 반영
  - 메타 테마 컬러 자동 업데이트

- **ThemeToggle 컴포넌트**
  - 버튼형 / 드롭다운형 토글 지원
  - 시각적 테마 미리보기 UI
  - 현재 테마 상태 표시
  - 접근성 준수 (ARIA 라벨, 키보드 네비게이션)

### 🛠️ UI/UX 개선

- **통합 테마 적용**
  - Navigation: 데스크톱에 테마 토글 추가
  - MobileNavigation: 다크 모드 대응 색상 적용
  - Settings: 전용 테마 설정 섹션 추가
  - 모든 컴포넌트 테마 시스템 마이그레이션

- **다크 모드 최적화**
  - 눈의 피로 감소를 위한 색상 조정
  - 커피 브랜드 컬러 다크 모드 버전
  - 배터리 절약 효과 (OLED 디스플레이)
  - 저조도 환경 가독성 향상

### 🎯 사용자 경험

- **직관적 테마 설정**
  - 설정 페이지 내 시각적 테마 선택 UI
  - 3가지 테마 모드 비교 설명
  - 실시간 테마 미리보기
  - 원클릭 테마 전환

## [0.9.3] - 2025-01-31

### ✅ 테스트 커버리지 완성

- **완전한 테스트 환경 구축**
  - Vitest + React Testing Library + Playwright 통합
  - jsdom 환경에서 Next.js, Supabase 완전 모킹
  - 단위 테스트, 컴포넌트 테스트, E2E 테스트 지원
  - CI/CD 준비: 다중 브라우저 및 모바일 환경

- **테스트 스크립트 추가**
  - `npm run test`: 대화형 테스트 실행
  - `npm run test:run`: 한 번 실행 후 종료
  - `npm run test:coverage`: 커버리지 리포트 생성
  - `npm run e2e`: E2E 테스트 실행
  - `npm run e2e:ui`: Playwright UI 모드

- **테스트 구조**
  - 단위 테스트: 캐시, 쿼리 최적화, 오프라인 동기화 등
  - 컴포넌트 테스트: LazyImage, MultiTagSearch 등
  - E2E 테스트: 전체 사용자 플로우 검증
  - 70% 이상 코드 커버리지 목표

### 🛠️ 개발 품질 향상

- **자동화된 테스트 환경**
  - GitHub Actions 준비 완료
  - 프로덕션 배포 전 자동 테스트
  - 크로스 브라우저 호환성 검증
  - 모바일 반응형 테스트 지원

## [0.9.2] - 2025-01-31

### 🚀 성능 최적화

- **캐싱 시스템 구현**
  - 메모리 + localStorage 2단계 캐싱
  - TTL 기반 자동 만료 처리
  - 캐시 할당량 초과 시 자동 정리
  - 5분 주기 자동 클린업

- **쿼리 최적화**
  - 페이지네이션 기반 점진적 로딩 (20건씩)
  - Supabase 쿼리 필터링 최적화
  - 배치 로딩으로 개별 요청 최소화
  - 캐시 기반 중복 요청 방지

- **이미지 최적화**
  - LazyImage 컴포넌트: Intersection Observer 활용
  - 50px rootMargin으로 사전 로딩
  - 로딩 스켈레톤 및 에러 처리
  - 점진적 이미지 로딩

### 🎨 UI/UX 개선

- **OptimizedCoffeeList 컴포넌트**
  - 무한 스크롤 방식 "더 보기" 버튼
  - 스켈레톤 로딩 상태 개선
  - 디바운스 검색 (300ms 딜레이)
  - Match Score 진행바 시각화

- **성능 설정 페이지**
  - 캐시 통계 (메모리/저장소/크기)
  - 컴포넌트별 성능 리포트
  - 렌더링 시간 모니터링
  - 캐시 삭제 기능

### 🛠️ 기술적 개선

- **성능 모니터링 시스템**
  - usePerformanceMonitor 훅
  - 16ms 이상 느린 렌더링 경고
  - sessionStorage 기반 메트릭 수집
  - P95, 평균, 최대값 통계

- **메모리 최적화**
  - 컴포넌트 언마운트 시 리소스 정리
  - Intersection Observer 재사용
  - 이미지 URL 적절한 해제

## [0.9.1] - 2025-01-31

### ✨ 새로운 기능

- **고급 검색 및 필터링 확장**
  - 이미지 필터링: 이미지가 있는 기록만 표시
  - 날짜 범위 선택기: 시작일/종료일 직접 선택 가능
  - 다중 태그 검색: 여러 태그 동시 검색 (AND 조건)
  - 자동완성 태그 입력: 기존 태그 제안 기능

- **정렬 옵션 추가**
  - Match Score 순: 매치 스코어 높은 순서대로 정렬
  - 최근 수정순: 가장 최근에 수정된 기록 우선
  - 이미지 개수순: 업로드된 이미지가 많은 순서대로 정렬

### 🎨 UI/UX 개선

- **MultiTagSearch 컴포넌트**
  - 태그 입력 시 자동완성 제안
  - 선택된 태그 시각적 표시
  - 태그 제거 기능 (X 버튼)
  - Enter 키로 태그 추가

- **FilterPanel 개선**
  - 이미지 필터 체크박스 추가
  - 날짜 범위 커스텀 선택 UI
  - 태그 검색 섹션 추가
  - 필터 개수 배지 표시

### 🛠️ 기술적 개선

- **필터링 로직 최적화**
  - 이미지 존재 여부 확인 로직 추가
  - 커스텀 날짜 범위 처리 로직
  - 다중 태그 AND 조건 검색
  - 새로운 정렬 알고리즘 구현

## [0.9.0] - 2025-01-31

### ✨ 새로운 기능

- **Progressive Web App (PWA) 완전 지원**
  - Service Worker로 오프라인 페이지 캐싱
  - manifest.json으로 설치 가능한 웹앱 구현
  - 홈 화면 추가 프롬프트 UI
  - 72px~512px 다양한 크기의 앱 아이콘
  - 바로가기 메뉴 (새 기록, 통계)

- **오프라인 지원 시스템**
  - IndexedDB 기반 로컬 데이터 저장소
  - 온라인/오프라인 자동 감지
  - 백그라운드 동기화 (60초 주기)
  - 오프라인 상태에서도 모든 기능 사용 가능
  - 네트워크 복구 시 자동 데이터 동기화

- **향상된 네트워크 처리**
  - 재시도 로직 (지수 백오프)
  - 네트워크 상태 실시간 표시
  - 동기화 상태 UI (SyncStatus 컴포넌트)
  - 충돌 해결 전략

### 🛠️ 기술적 개선

- **빌드 에러 전체 해결**
  - TypeScript 타입 에러 수정
  - ESLint 설정 정리 (prettier 제거)
  - createError 함수 시그니처 통일
  - CoffeeRecord 타입 일관성 확보

- **PWA 최적화**
  - next-pwa 플러그인 통합
  - 정적 자산 캐싱 전략
  - 오프라인 폴백 페이지
  - 프로덕션 빌드 최적화

## [0.8.0-alpha] - 2025-01-31

### ✨ 새로운 기능

- **이미지 업로드 기능** 구현
  - Supabase Storage 통합으로 안정적인 이미지 저장
  - 카메라/갤러리에서 이미지 선택 가능
  - 자동 이미지 압축 (최대 1920x1920)
  - 썸네일 자동 생성 (300x300)
  - 업로드 진행률 표시
  - 이미지 미리보기 및 삭제 기능

### 🎨 UI/UX 개선

- **이미지 표시 통합**
  - 커피 카드에 이미지 썸네일 표시
  - 상세 페이지에 이미지 갤러리 섹션 추가
  - 이미지 클릭 시 새 탭에서 원본 보기
  - Step 3에 이미지 업로드 UI 추가
  - Step 4에서 업로드된 이미지 미리보기

### 🛠️ 기술적 개선

- **이미지 처리 시스템**
  - `ImageUploadService` 클래스 생성
  - Canvas API를 활용한 클라이언트 사이드 압축
  - 파일 타입 및 크기 검증 (5MB 제한)
  - Supabase Transform API로 썸네일 생성
- **데이터베이스 확장**
  - `image_url`, `thumbnail_url`, `additional_images` 필드 추가
  - 마이그레이션 파일 작성
  - Storage 버킷 및 RLS 정책 설정

### 📋 다음 계획

- **v0.8.0 완성**: PWA 기능, 성능 최적화
- **v0.9.0**: OCR 기능 (커피 패키지 스캔으로 자동 입력)

---

## [0.7.0] - 2025-01-30

### 📱 모바일 최적화 완성

- **모바일 네비게이션 시스템**
  - 하단 고정 네비게이션 바 구현
  - 5개 주요 메뉴 (홈, 통계, 기록, 성취, 설정)
  - 기록 버튼 강조 디자인
  - 안전 영역(Safe Area) 지원

- **반응형 디자인 전면 적용**
  - 모든 페이지 모바일 우선 디자인
  - 터치 최적화된 버튼 크기 (최소 44px)
  - 스크롤 성능 최적화
  - 입력 필드 줌 방지

### 🐛 빌드 오류 수정

- **Suspense Boundary 에러 해결**
  - useSearchParams 사용 페이지 래핑
  - 클라이언트 사이드 렌더링 최적화
- **패키지 매니저 통일**
  - npm으로 완전 전환 (bun 제거)
  - package-lock.json 일관성 유지

### 🔧 기술적 개선

- 프로덕션 빌드 성공
- TypeScript 타입 에러 전체 해결
- 불필요한 파일 정리 (cupnote-app 디렉토리 제거)

---

## [0.6.0] - 2025-01-30

### ✨ UX 대규모 개선

- **3단계 점진적 개선 완료**
  - Phase 1: 모드 선택 페이지 + Match Score 시각화
  - Phase 2: 4단계 기록 플로우 분리
  - Phase 3: 성취 시스템 + 온보딩 + 도움말

- **모드 선택 시스템** (`/mode-selection`)
  - Cafe 모드: 간단한 카페 방문 기록
  - HomeCafe 모드: 홈브루잉 + 레시피
  - Lab 모드: 전문적인 커핑과 분석

- **Match Score 시스템**
  - 기록 완성도 기반 점수 계산
  - 시각적 등급 표시 (S/A/B/C/D)
  - 애니메이션 효과로 성취감 강화

- **4단계 기록 플로우**
  - Step 1: 기본 정보 (커피명, 로스터리, 날짜)
  - Step 2: 모드별 상세 정보
  - Step 3: 맛 평가 (간단/상세 선택)
  - Step 4: 최종 검토 및 저장
  - SessionStorage로 임시 저장

- **성취 시스템** (`/achievements`)
  - 6개 카테고리 30+ 배지
  - 포인트 기반 레벨 시스템
  - 진행률 시각화
  - 마일스톤 추적

- **온보딩 플로우** (`/onboarding`)
  - 첫 사용자를 위한 4단계 가이드
  - 앱 핵심 기능 소개
  - 선택적 건너뛰기

### 🎨 UI/UX 개선

- 전체 페이지 시각적 일관성 강화
- 애니메이션 및 트랜지션 추가
- 빈 상태 친화적 디자인
- 도움말 툴팁 시스템

---

## [0.5.0] - 2025-01-30

### ✨ 새로운 페이지 구현

- **통계 페이지** (`/stats`) 완전 구현
  - 개인 커피 데이터 종합 분석
  - 월별/원산지/로스팅 레벨/모드별 분포 차트
  - 평점 분포 및 베스트 커피 인사이트
  - 반응형 차트 시각화 시스템

- **설정 페이지** (`/settings`) 완전 구현
  - 개인 설정 (이름, 측정 단위, 기본 모드)
  - 앱 설정 (자동 저장, 평점 표시, 컴팩트 뷰)
  - 데이터 내보내기/가져오기 (JSON 형식)
  - 안전한 데이터 삭제 기능

### 🎨 네비게이션 시스템 구축

- **통합 네비게이션 컴포넌트** 생성
  - 모든 페이지 간 일관된 네비게이션
  - 현재 페이지 활성 상태 표시
  - 반응형 디자인 적용
  - 뒤로가기 버튼 자동 관리

### 🔧 사용자 경험 개선

- **로컬 스토리지 확장**: 사용자 설정 영구 저장
- **데이터 백업/복원**: JSON 형식 완전 지원
- **알림 시스템**: 작업 성공/실패 피드백
- **빈 상태 처리**: 데이터 없을 때 친화적 안내

---

## [0.4.0] - 2025-01-30

### 🔧 개발 환경 개선

- **ESLint/Prettier 통합 설정** 완료
  - TypeScript 규칙 및 React 최적화
  - 자동 포매팅 및 코드 스타일 통일
  - VS Code 통합 설정
  - npm scripts 추가 (`lint`, `format`, `check-all`)

### 🏗️ 아키텍처 확장

- **커뮤니티 커핑 기능** 설계 완료
  - SCA 표준 기반 그룹 커핑 시스템
  - 실시간 세션 관리 아키텍처
  - 평가 분석 및 비교 알고리즘
  - 완전한 타입 시스템 구축

### 📚 문서화 시스템 확장

- **Community Cupping 상세 설계 문서** 작성
  - 데이터 모델 및 상태 흐름 정의
  - UI/UX 설계 및 사용자 여정
  - 4단계 구현 계획 수립
  - 성공 지표 및 개인정보 보호 가이드

---

## [0.3.0] - 2025-01-30

### ✨ 새로운 기능

- **검색 및 필터링 시스템** 완전 구현
  - 실시간 검색: 커피명, 카페명, 원산지, 맛 노트, 메모, 태그 검색
  - 고급 필터링: 모드(Cafe/HomeCafe/Lab), 테이스팅 모드, 평점, 날짜 범위
  - 정렬 기능: 날짜/이름/평점순, 오름차순/내림차순
  - 검색 상태 표시 및 전체 초기화 기능

### 🎨 UI/UX 개선

- **CoffeeCard 컴포넌트** 대폭 개선
  - 모드 배지 추가 (Café/HomeCafe/Lab 시각적 구분)
  - 평점 표시 (별점 시각화)
  - 태그 표시 (최대 3개 + 더보기)
  - 텍스트 말줄임 처리로 카드 일정한 크기 유지
- **SearchBar 컴포넌트** 신규 추가
  - 검색 아이콘 및 초기화 버튼
  - 실시간 검색 지원
  - 반응형 디자인
- **FilterPanel 컴포넌트** 신규 추가
  - 토글 방식의 필터 패널
  - 활성 필터 개수 배지
  - 모든 필터 옵션 통합 관리

### 🔧 기술적 개선

- **성능 최적화**: `useMemo`를 활용한 필터링 결과 캐싱
- **의존성 추가**: `@tailwindcss/line-clamp` 플러그인
- **타입 안전성**: `FilterOptions` 인터페이스 추가

### 📚 문서화

- **docs 폴더 구조** 생성
- **검색/필터링 기능 문서** 완성 (`docs/features/SEARCH_AND_FILTER.md`)
- **문서화시스템 README** 작성 (`docs/README.md`)

---

## [0.2.0] - 2025-01-29

### ✨ 새로운 기능

- **Foundation 기반 상세 페이지** 완전 구현
  - 모드별 특화 정보 표시 (Cafe/HomeCafe/Lab)
  - 향미 프로파일 시스템 (카테고리별 색상 구분)
  - Match Score 분석 시각화
  - 감각 표현 체계적 표시
  - 완전한 액션 버튼 (편집/삭제/공유)

### 🏗️ 아키텍처 개선

- **타입 시스템 확장**
  - `CoffeeMode`, `FlavorCategory`, `SensoryExpression` 타입 추가
  - `HomeCafeData`, `LabData`, `MatchScore` 인터페이스 구현
  - 확장된 `CoffeeRecord` 인터페이스
- **향미 데이터베이스** 구축
  - 30+ 향미 프로파일 (6개 카테고리)
  - 감각 표현 데이터베이스
  - 카테고리별 색상 맵핑 시스템

### 🎨 컴포넌트 시스템

- **모듈화된 상세 페이지** (8개 컴포넌트)
  - `HeaderSection`, `BasicInfoCard`, `ModeSpecificSection`
  - `FlavorProfileSection`, `MatchScoreSection`
  - `PersonalEvaluationSection`, `ActionButtonsSection`
- **향미 시각화** 컴포넌트
  - `FlavorChip`, `SensoryExpressionItem`

### 🔧 기능 개선

- **편집 모드** 완전 구현
  - URL 파라미터 기반 편집 모드 (`/record?edit=123`)
  - 기존 데이터 로딩 및 폼 프리필
  - 편집/생성 모드 구분
- **로컬 스토리지** 데이터 관리
  - 샘플 데이터 확장 (Foundation 기능 포함)
  - CRUD 오퍼레이션 완성

---

## [0.1.0] - 2025-01-28

### 🎉 프로젝트 초기 설정

- **Next.js 15.4.5** 프로젝트 생성
- **TypeScript** 및 **Tailwind CSS** 설정
- **프로젝트 구조** 설계
- **Git 저장소** 초기화

### ✨ 핵심 기능 구현

- **커피 기록 시스템**
  - 기본 정보 입력 (커피명, 카페명, 원산지, 로스팅 레벨)
  - 맛 표현 시스템 (편하게/전문가 모드)
  - 개인 메모 및 평점 시스템
- **데이터 저장**
  - 로컬 스토리지 기반 데이터 영속성
  - CRUD 오퍼레이션 구현
  - 실시간 목록 업데이트

### 🎨 사용자 인터페이스

- **홈페이지**: 히어로 섹션 + 최근 기록 목록
- **기록 페이지**: 커피 정보 입력 폼
- **기본 상세 페이지**: 저장된 기록 조회
- **커피 카드**: 목록 형태 미리보기

### 🏗️ 아키텍처 결정

- **모달 방식 → 페이지 방식 전환** (사용자 선호에 따라)
- **중첩 디렉토리 구조 해결** (`app/app` → `app`)
- **로컬 우선 데이터 전략**

### 🔧 개발 환경 설정

- **ESLint/Prettier** 설정 준비
- **VS Code** 설정 파일
- **Tailwind CSS** 커스텀 컬러 팔레트
- **프로젝트 문서화** 시작

---

## 버전 관리 규칙

### 버전 번호 규칙 (Semantic Versioning)

- **Major (X.0.0)**: 호환성이 깨지는 주요 변경
- **Minor (0.X.0)**: 새로운 기능 추가
- **Patch (0.0.X)**: 버그 수정 및 소규모 개선

### 변경사항 카테고리

- 🎉 **프로젝트 시작**: 초기 설정
- ✨ **새로운 기능**: 신규 기능 추가
- 🎨 **UI/UX 개선**: 사용자 인터페이스 개선
- 🏗️ **아키텍처**: 구조적 변경
- 🔧 **기능 개선**: 기존 기능 향상
- 🐛 **버그 수정**: 오류 수정
- 📚 **문서화**: 문서 추가/수정
- 🚀 **성능**: 성능 개선
- 🔒 **보안**: 보안 개선

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-30  
**관리자**: CupNote Team
