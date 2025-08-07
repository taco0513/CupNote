# CupNote 배포 로드맵

## 🚀 Phase 1: 현재 (2025년 1월) - Capacitor WebView
**목표**: 빠른 TestFlight 배포 및 사용자 피드백 수집

### ✅ 완료된 작업
- Next.js 웹 앱 개발 완료
- Capacitor iOS 통합
- 프로덕션 웹사이트 배포 (mycupnote.com)
- TestFlight 빌드 준비 (v1.5.0 Build 7)

### 📱 현재 앱 구조
```
CupNote iOS App (Capacitor)
    ↓
WebView로 mycupnote.com 로드
    ↓
사용자에게는 네이티브 앱처럼 보임
```

### 장점
- ✅ 즉시 배포 가능
- ✅ 웹과 앱 동일한 경험
- ✅ 업데이트 쉬움 (서버만 업데이트)
- ✅ 개발 시간 최소화

### 단점
- ❌ 인터넷 연결 필수
- ❌ 웹뷰 성능 한계
- ❌ 일부 네이티브 기능 제한

### TestFlight 배포 체크리스트
- [x] Build 번호 업데이트 (7)
- [x] Capacitor 설정 완료
- [ ] Xcode Archive 생성
- [ ] App Store Connect 업로드
- [ ] TestFlight 테스터 초대

---

## 🎯 Phase 2: 단기 개선 (2025년 2월) - PWA 기능 추가
**목표**: 오프라인 지원 및 성능 개선

### 계획된 개선사항
1. **Service Worker 구현**
   - 오프라인 캐싱
   - 백그라운드 동기화
   - 푸시 알림

2. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 레이지 로딩

3. **네이티브 기능 추가**
   - 카메라 플러그인
   - 로컬 저장소
   - 생체 인증

### 예상 작업
```javascript
// Service Worker 추가
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA(nextConfig)
```

---

## 🦋 Phase 3: 장기 계획 (2025년 3-4월) - Flutter 마이그레이션
**목표**: 진짜 네이티브 앱으로 전환

### Flutter 마이그레이션 이유
1. **완전한 오프라인 지원**
2. **네이티브 성능** (60fps)
3. **더 나은 UX**
4. **앱스토어 최적화**

### 마이그레이션 전략
```
1단계: Flutter 환경 설정 (1주)
├── Flutter SDK 설치
├── 개발 환경 구성
└── 기본 프로젝트 생성

2단계: 핵심 기능 구현 (2주)
├── 인증 시스템
├── 커피 기록 폼
├── 데이터베이스 연동
└── 기본 UI 구현

3단계: 전체 기능 구현 (2주)
├── 모든 페이지 마이그레이션
├── 네이티브 기능 추가
├── 테스팅
└── 최적화

4단계: 배포 (1주)
├── TestFlight 배포
├── 사용자 피드백
├── 버그 수정
└── 정식 출시
```

### Flutter 프로젝트 구조 (예정)
```
cupnote_flutter/
├── lib/
│   ├── main.dart              # 앱 진입점
│   ├── models/                # 데이터 모델
│   │   ├── coffee.dart
│   │   └── user.dart
│   ├── screens/               # 화면
│   │   ├── home/
│   │   ├── record/
│   │   └── profile/
│   ├── widgets/               # 재사용 위젯
│   ├── services/              # API 서비스
│   │   ├── auth_service.dart
│   │   └── supabase_service.dart
│   └── utils/                 # 유틸리티
├── assets/                    # 이미지, 폰트
└── pubspec.yaml              # 의존성 관리
```

### 주요 Flutter 패키지 (예정)
```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0    # Supabase 연동
  provider: ^6.0.0             # 상태 관리
  go_router: ^12.0.0           # 라우팅
  cached_network_image: ^3.0.0 # 이미지 캐싱
  shared_preferences: ^2.0.0   # 로컬 저장소
  flutter_animate: ^4.0.0      # 애니메이션
```

---

## 📊 예상 타임라인

```
2025년 1월: Capacitor WebView 앱 출시 (현재)
    ↓
2025년 2월: PWA 기능 추가, 오프라인 지원
    ↓
2025년 3월: Flutter 개발 시작
    ↓
2025년 4월: Flutter 앱 TestFlight
    ↓
2025년 5월: Flutter 앱 정식 출시
```

## 💰 비용 비교

| 항목 | Capacitor (현재) | Flutter (향후) |
|------|-----------------|---------------|
| 개발 시간 | 0 (완료) | 3-4주 |
| 유지보수 | 쉬움 | 중간 |
| 성능 | 중간 | 최고 |
| 오프라인 | ❌ | ✅ |
| 앱 크기 | ~50MB | ~15MB |
| 도메인 비용 | 필요 | 불필요 |

## 🎯 성공 지표

### Phase 1 (현재)
- [ ] TestFlight 배포 완료
- [ ] 100명 베타 테스터 확보
- [ ] 주요 버그 수정
- [ ] 사용자 피드백 수집

### Phase 2 (PWA)
- [ ] 오프라인 모드 구현
- [ ] 로딩 속도 < 2초
- [ ] Service Worker 캐싱
- [ ] 푸시 알림 구현

### Phase 3 (Flutter)
- [ ] 완전한 오프라인 지원
- [ ] 60fps UI 성능
- [ ] 앱 크기 < 20MB
- [ ] 앱스토어 정식 출시

---

## 📝 메모

### 왜 바로 Flutter로 가지 않는가?
1. **시간**: 현재 앱이 이미 완성됨
2. **피드백**: 사용자 반응을 먼저 확인
3. **리스크**: 단계적 접근으로 리스크 최소화
4. **학습**: Flutter 학습 시간 확보

### Flutter 마이그레이션 시 재사용 가능한 것들
- Supabase 백엔드 (그대로 사용)
- API 구조
- 비즈니스 로직
- 디자인 시스템
- 사용자 데이터

### 데이터 마이그레이션
- Supabase를 계속 사용하므로 데이터 마이그레이션 불필요
- 사용자는 동일한 계정으로 로그인
- 모든 데이터 자동 연동

---

생성일: 2025-01-07
업데이트: Phase 1 진행 중