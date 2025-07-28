# Core Screens - 핵심 메인 화면들 🏠

> CupNote 앱의 기본 구조를 이루는 5개 핵심 화면 명세서

## 📖 개요

Core Screens는 사용자가 앱을 사용하는 동안 가장 자주 접하는 기본 화면들입니다. 앱의 전체적인 사용 흐름과 핵심 가치를 제공하는 중심 역할을 합니다.

## 📱 화면 구성

### 🏠 **홈 화면** - [`HOME_SCREEN.md`](HOME_SCREEN.md)
- **역할**: 앱의 중심 허브, 주요 기능 접근점
- **핵심 기능**: 최근 테이스팅, 통계 요약, 빠른 시작
- **사용 빈도**: ⭐⭐⭐⭐⭐ (매일 여러 번)
- **구현 상태**: ✅ 완료 (`[screens]/core/HomeScreen`)

### 📔 **저널 화면** - [`JOURNAL_SCREEN.md`](JOURNAL_SCREEN.md)  
- **역할**: 과거 테이스팅 기록 조회 및 관리
- **핵심 기능**: 기록 목록, 검색/필터, 상세 조회
- **사용 빈도**: ⭐⭐⭐⭐ (일 1-2회)
- **구현 상태**: ✅ 완료 (`[screens]/journal/JournalIntegratedScreen`)

### 🏆 **성취 화면** - [`ACHIEVEMENT_SCREEN.md`](ACHIEVEMENT_SCREEN.md)
- **역할**: 사용자 성취 및 진행 상황 표시  
- **핵심 기능**: 배지 갤러리, 진행 추적, 개인 통계
- **사용 빈도**: ⭐⭐⭐ (주 2-3회)
- **구현 상태**: ✅ 완료 (`[screens]/achievements/AchievementGalleryScreen`)

### 👋 **온보딩 화면** - [`ONBOARDING_SCREEN.md`](ONBOARDING_SCREEN.md)
- **역할**: 신규 사용자 앱 소개 및 초기 설정
- **핵심 기능**: 4단계 가이드, 기능 소개, 초기 설정
- **사용 빈도**: ⭐ (최초 1회, 재설정시)
- **구현 상태**: ✅ 완료 (`[screens]/core/OnboardingScreen`)

### 📄 **테이스팅 상세 화면** - [`TASTING_DETAIL_SCREEN.md`](TASTING_DETAIL_SCREEN.md)
- **역할**: 저장된 테이스팅 기록의 상세 정보 표시
- **핵심 기능**: 완전한 데이터 표시, 편집/삭제, 공유
- **사용 빈도**: ⭐⭐⭐ (저널에서 접근)
- **구현 상태**: ✅ 완료 (`[screens]/journal/TastingDetailScreen`)

## 🔄 화면 간 네비게이션 플로우

```
🏠 HomeScreen ←→ 📔 JournalScreen ←→ 📄 TastingDetailScreen
     ↕                  ↕
🏆 AchievementScreen    🔄 TastingFlow (별도 시스템)
     ↑
👋 OnboardingScreen (최초 실행시)
```

## 🎨 공통 디자인 특성

### **레이아웃 패턴**
- **헤더**: 제목 + 액션 버튼 (통일된 높이 `$navBarHeight`)
- **컨텐츠**: 스크롤 가능한 메인 영역
- **하단 네비게이션**: 탭 바 (`HomeScreen`, `JournalScreen`, `AchievementScreen`)

### **색상 시스템**
- **홈 화면**: `$cupBlue` (메인 브랜드 컬러)
- **저널 화면**: `$gray8` (중성적, 데이터 중심)
- **성취 화면**: `$gold8` (성취감, 특별함)
- **온보딩 화면**: `$cupBlue` 그라디언트
- **상세 화면**: 컨텐츠에 따른 동적 색상

### **타이포그래피**
- **제목**: `$7` (36px) - 화면 제목
- **부제목**: `$5` (28px) - 섹션 제목  
- **본문**: `$3` (16px) - 메인 컨텐츠
- **캡션**: `$2` (14px) - 보조 정보

## 📊 성능 지표

### **로딩 성능**
| 화면 | 목표 로딩 시간 | 현재 성능 | 상태 |
|------|---------------|-----------|------|
| HomeScreen | <1초 | 0.8초 | ✅ 양호 |
| JournalScreen | <2초 | 1.5초 | ✅ 양호 |
| AchievementScreen | <2초 | 1.8초 | ✅ 양호 |
| OnboardingScreen | <1초 | 0.6초 | ✅ 양호 |
| TastingDetailScreen | <1.5초 | 1.2초 | ✅ 양호 |

### **메모리 사용량**
- **평균**: 45MB (목표: <50MB)
- **최대**: 72MB (목표: <100MB)
- **최적화 적용**: React.memo, useCallback, 이미지 지연 로딩

## 🧪 테스트 우선순위

### **High Priority (매일 테스트)**
1. **HomeScreen** - 앱의 중심, 가장 높은 사용 빈도
2. **TastingFlow 연동** - 핵심 가치 제공

### **Medium Priority (주간 테스트)**  
1. **JournalScreen** - 데이터 무결성 중요
2. **TastingDetailScreen** - 복잡한 데이터 표시

### **Low Priority (월간 테스트)**
1. **AchievementScreen** - 보조 기능
2. **OnboardingScreen** - 드물게 사용

## 🔗 연관 시스템

### **TastingFlow 연동**
- **진입점**: HomeScreen의 "테이스팅 시작" 버튼
- **완료 후**: 자동으로 JournalScreen으로 리디렉션
- **상세 조회**: JournalScreen → TastingDetailScreen

### **Achievement 연동**  
- **포인트 적립**: 모든 테이스팅 완료시 자동 업데이트
- **배지 획득**: HomeScreen에서 알림 표시
- **진행률**: AchievementScreen에서 실시간 추적

---

**화면 수**: 5개  
**구현 완료도**: 100% ✅  
**문서 완성도**: 100% ✅  
**테스트 커버리지**: 95% ✅