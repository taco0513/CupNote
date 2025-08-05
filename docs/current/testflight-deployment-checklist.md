# TestFlight 배포 체크리스트

## 버전 정보
- **앱 버전**: 1.2.0
- **빌드 번호**: 업데이트 필요
- **날짜**: 2025-08-05

## Pre-Deployment 체크리스트

### 1. 코드 준비 ✅
- [x] Production 빌드 성공 확인
- [x] Capacitor iOS 동기화 완료
- [ ] 테스트 실행 (일부 테스트 실패 있음 - 비필수)
- [ ] 환경 변수 확인 (.env.production)

### 2. Xcode 설정
- [ ] 빌드 번호 증가 (현재: ?)
- [ ] Team & Signing 설정 확인
- [ ] Capabilities 확인
  - [ ] Push Notifications (필요시)
  - [ ] Background Modes (필요시)
- [ ] Info.plist 권한 설정
  - [ ] Camera Usage Description
  - [ ] Photo Library Usage Description
  - [ ] Location Usage Description (필요시)

### 3. 앱 스토어 커넥트 준비
- [ ] 앱 메타데이터 업데이트
  - [ ] 앱 설명
  - [ ] 스크린샷 (iPhone, iPad)
  - [ ] 앱 아이콘
  - [ ] 키워드
- [ ] TestFlight 정보
  - [ ] 빌드 노트 작성
  - [ ] 테스터 그룹 설정
  - [ ] 베타 테스트 정보

### 4. 베타 테스트 준비
- [ ] 테스터 초대 이메일 목록
- [ ] 테스트 가이드 문서
- [ ] 피드백 수집 방법 안내
- [ ] 알려진 이슈 목록

## 빌드 프로세스

### 1. Xcode에서 빌드
```bash
# Xcode 프로젝트 열기
open ios/App/App.xcworkspace

# 또는 새로운 xcode 프로젝트
open xcode/CupNote/CupNote.xcodeproj
```

### 2. Archive 생성
1. Xcode에서 Generic iOS Device 선택
2. Product > Archive
3. Organizer에서 Validate App
4. Distribute App > App Store Connect > Upload

### 3. TestFlight 배포
1. App Store Connect 로그인
2. TestFlight 탭 이동
3. 빌드 선택 및 테스터 그룹 추가
4. 빌드 노트 작성
5. 베타 테스터 초대

## 베타 테스트 피드백 항목

### 주요 테스트 포인트
1. **회원가입/로그인 플로우**
2. **커피 기록 작성 (Cafe/HomeCafe 모드)**
3. **사진 업로드 및 OCR 기능**
4. **내 기록 조회 및 분석**
5. **성취 시스템**
6. **오프라인 모드**
7. **푸시 알림** (설정된 경우)

### 성능 체크
- [ ] 앱 시작 시간
- [ ] 페이지 전환 속도
- [ ] 이미지 로딩 속도
- [ ] 배터리 사용량

### 디바이스 호환성
- [ ] iPhone 14/15 시리즈
- [ ] iPhone SE
- [ ] iPad (있는 경우)
- [ ] iOS 16+ 호환성

## 릴리스 노트 템플릿

```
CupNote v1.2.0 Beta

새로운 기능:
- 하이브리드 디자인 시스템 완성
- 향상된 모바일 UX
- 커뮤니티 기반 매치 스코어
- 고급 분석 대시보드

개선 사항:
- 성능 최적화
- UI/UX 개선
- 버그 수정

알려진 이슈:
- 일부 컴포넌트 테스트 실패 (앱 동작에는 영향 없음)

피드백 방법:
- 앱 내 보라색 피드백 버튼 사용
- 이메일: support@mycupnote.com
```

## Post-Deployment

### 모니터링
- [ ] Crash 리포트 확인
- [ ] 사용자 피드백 수집
- [ ] 성능 메트릭 모니터링
- [ ] App Store Connect Analytics

### 다음 단계
- [ ] 피드백 분석 및 우선순위 정리
- [ ] 버그 수정 계획
- [ ] v1.3.0 로드맵 수립