# CupNote 코드 청소 계획

## 🗑️ 제거 대상 파일들 (53개)

### 개발/테스트 페이지들
- `/demo` - 데모 페이지
- `/demo-toast` - 토스트 테스트
- `/button-showcase` - 버튼 쇼케이스
- `/desktop-test` - 데스크탑 테스트
- `/tablet-test` - 태블릿 테스트
- `/test-simple` - 간단 테스트
- `/fluid-showcase` - 플루이드 쇼케이스
- `/performance-showcase` - 성능 쇼케이스
- `/responsive-showcase` - 반응형 쇼케이스
- `/responsive-test` - 반응형 테스트
- `/responsive-concept` - 반응형 컨셉

### 디자인 샘플들
- `/design-samples/*` - 모든 디자인 샘플
- `/homepage-concepts` - 홈페이지 컨셉
- `/analytics-concept` - 분석 컨셉

### 사용하지 않는 페이지들  
- `/features` - 기능 페이지 (정적)
- `/performance` - 성능 페이지 (빈 페이지)
- `/stats` - 통계 페이지 (my-records와 중복)
- `/records` - 기록 페이지 (my-records와 중복)

## 🔧 리팩토링 대상

### 중복 라우트 정리
- `/records` → `/my-records` (통합)
- `/stats` → `/my-records` (통합)

### 아키텍처 개선
- 거대한 컴포넌트 분리
- 중복 로직 제거
- 타입 안전성 개선
- 성능 최적화

## 📊 예상 결과
- 파일 수: 283개 → ~200개 (30% 감소)
- 번들 크기: 20-30% 감소
- 빌드 시간: 15-25% 개선
- 유지보수성: 대폭 향상