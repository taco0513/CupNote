# PWA 구현 가이드

## 구현 완료 사항

### 1. PWA 기본 설정
- ✅ manifest.json 생성
  - 앱 이름, 설명, 테마 색상
  - 아이콘 설정 (SVG 플레이스홀더)
  - 시작 URL 및 디스플레이 모드
  - 앱 숏컷 (새 기록, 통계)

- ✅ Service Worker 구현
  - 정적 자산 캐싱
  - 오프라인 폴백
  - API 응답 캐싱
  - Background sync 준비

- ✅ next-pwa 통합
  - 자동 Service Worker 등록
  - 런타임 캐싱 설정
  - Supabase API/Storage 캐싱

### 2. 오프라인 지원
- ✅ IndexedDB 기반 오프라인 스토리지
  - CoffeeRecord 로컬 저장
  - 동기화 상태 추적
  - 사용자별 데이터 분리

- ✅ 오프라인 동기화 시스템
  - 자동 주기적 동기화 (1분 간격)
  - 온라인 복귀 시 자동 동기화
  - 수동 동기화 버튼
  - 동기화 상태 표시

- ✅ SupabaseStorage 오프라인 지원
  - 온라인/오프라인 자동 감지
  - 오프라인 시 IndexedDB 사용
  - 온라인 시 Supabase 우선

### 3. UI/UX 개선
- ✅ PWA 설치 프롬프트
  - 3회 방문 후 자동 표시
  - 설치/나중에 옵션
  - 설치 완료 시 자동 숨김

- ✅ 동기화 상태 표시
  - 실시간 온라인/오프라인 상태
  - 대기 중인 동기화 개수
  - 수동 동기화 버튼

- ✅ 메타 태그 최적화
  - Apple 웹 앱 지원
  - 테마 색상 설정
  - 뷰포트 최적화

## 테스트 방법

### 1. PWA 설치 테스트
```bash
# 개발 서버 시작
npm run dev

# Chrome DevTools 열기
# Application 탭 → Manifest 확인
# 설치 가능 여부 확인
```

### 2. 오프라인 테스트
1. Chrome DevTools → Network → Offline 체크
2. 새 커피 기록 생성
3. 홈 화면에서 기록 확인
4. Online으로 전환
5. 자동 동기화 확인

### 3. 모바일 테스트
- Android: Chrome → 메뉴 → "홈 화면에 추가"
- iOS: Safari → 공유 → "홈 화면에 추가"

## 주의사항

1. **아이콘**: 현재 SVG 플레이스홀더 사용 중
   - 프로덕션에서는 PNG로 변환 필요
   - pwa-asset-generator 사용 권장

2. **Service Worker**: 개발 모드에서는 비활성화
   - 프로덕션 빌드에서만 활성화
   - 캐시 업데이트 시 버전 관리 필요

3. **오프라인 동기화**
   - 충돌 해결 전략 필요
   - 대용량 이미지 동기화 최적화 필요

## 향후 개선사항

1. **Push Notifications**
   - FCM 통합
   - 동기화 완료 알림
   - 커피 기록 리마인더

2. **Background Sync**
   - 더 강력한 동기화 메커니즘
   - 실패한 동기화 재시도

3. **Performance**
   - 이미지 lazy loading
   - 캐시 전략 최적화
   - 번들 크기 최적화

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 로컬 프로덕션 테스트
npm start

# Lighthouse PWA 검사
# Chrome DevTools → Lighthouse → PWA 체크
```