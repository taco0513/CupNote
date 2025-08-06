# iOS 홈페이지 스크롤 문제

## 문제 설명
- 홈페이지에서만 스크롤시 컨텐츠가 상단 헤더와 하단 네비게이션에 가려지는 문제
- 다른 페이지들(설정, 내 기록 등)은 정상 작동

## 시도한 해결 방법들

### 1. PageLayout 패딩 조정
- `pt-20 pb-32` → `pt-24 pb-32` 등 다양한 값 시도
- inline style로 calc() 사용하여 safe area 계산
- 결과: 해결되지 않음

### 2. OnboardingFlow 제거
- `fixed inset-0` 스타일이 문제일 가능성으로 완전 비활성화
- 결과: 해결되지 않음

### 3. 페이지 구조 통일
- 설정 페이지와 동일한 구조로 재구성
- Navigation + PageLayout + ProtectedRoute 구조
- 결과: 해결되지 않음

### 4. CSS 충돌 확인
- globals.css의 iOS fallback CSS 비활성화
- 중복된 position:fixed 제거
- 결과: 해결되지 않음

## 추후 확인 필요 사항
1. 브라우저 DevTools에서 실제 렌더링된 요소들의 높이와 위치 확인
2. JavaScript로 동적으로 적용되는 스타일 확인
3. iOS Safari 특정 버그 가능성 조사
4. Capacitor iOS 앱에서의 WebView 관련 설정 확인

## 임시 해결책
- 현재 상태로 유지하되, 사용자 피드백 수집
- 다른 우선순위 높은 작업 먼저 처리