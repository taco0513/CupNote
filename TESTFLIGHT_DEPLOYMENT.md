# TestFlight 배포 가이드 - v1.5.0 Build 7

## 1. Xcode에서 Archive 생성

### 사전 준비
- [x] 빌드 번호 업데이트: 6 → 7 완료
- [x] Next.js 프로덕션 빌드 완료
- [x] Capacitor iOS 동기화 완료
- [x] Xcode 프로젝트 열기 완료

### Archive 생성 단계

1. **디바이스 선택**
   - 상단 툴바에서 "Any iOS Device (arm64)" 선택
   - 시뮬레이터가 아닌 실제 디바이스 타겟 선택 필수

2. **빌드 설정 확인**
   - Scheme: App
   - Configuration: Release
   - Team: 개발자 계정 확인

3. **Archive 생성**
   - 메뉴: Product → Archive
   - 또는 단축키: ⌘ + Shift + B (빌드) → Product → Archive
   - 빌드 시간: 약 2-5분

4. **Archive 검증**
   - Archive 완료 후 Organizer 창 자동 열림
   - 빌드 정보 확인:
     - Version: 1.5.0
     - Build: 7
     - Bundle ID: com.mycupnote.app

## 2. TestFlight 업로드

### App Store Connect 업로드

1. **Distribute App 클릭**
   - Organizer 창에서 방금 생성한 Archive 선택
   - "Distribute App" 버튼 클릭

2. **배포 방법 선택**
   - "App Store Connect" 선택
   - Next 클릭

3. **배포 옵션**
   - "Upload" 선택 (TestFlight 및 App Store용)
   - Next 클릭

4. **앱 정보 확인**
   - Automatically manage signing 체크
   - Next 클릭

5. **업로드 전 검증**
   - Xcode가 자동으로 앱 검증 수행
   - 문제 없으면 "Upload" 클릭

6. **업로드 진행**
   - 업로드 시간: 약 5-10분
   - 완료 메시지 확인

## 3. App Store Connect에서 TestFlight 설정

### 빌드 처리 대기
- App Store Connect 접속: https://appstoreconnect.apple.com
- 앱 선택: CupNote
- TestFlight 탭 이동
- 빌드 처리 시간: 약 10-30분 (Apple 서버 처리)

### TestFlight 빌드 활성화

1. **빌드 상태 확인**
   - 상태가 "Processing" → "Ready to Submit" 변경 대기
   - 이메일 알림 수신 확인

2. **테스트 정보 입력**
   - Test Information 클릭
   - What to Test: 새로운 기능 및 버그 수정 내용 입력
   ```
   v1.5.0 Build 7 업데이트 내용:
   - 커뮤니티 매치 점수 시스템 개선
   - 데이터 저장 안정성 향상
   - UI/UX 개선 및 버그 수정
   ```

3. **내부 테스터 추가**
   - Internal Testing 그룹 생성/선택
   - 테스터 이메일 추가
   - 빌드 선택 후 저장

4. **외부 테스터 추가 (선택사항)**
   - External Testing 그룹 생성
   - 테스터 이메일 추가 (최대 10,000명)
   - Apple 리뷰 필요 (1-2일 소요)

## 4. 테스터 초대 및 설치

### 테스터 초대
- 자동으로 초대 이메일 발송
- TestFlight 앱 설치 링크 포함

### 테스터 설치 과정
1. TestFlight 앱 다운로드 (App Store)
2. 초대 이메일의 링크 클릭
3. "Accept" 클릭
4. "Install" 클릭하여 앱 설치

## 5. 체크리스트

- [x] 빌드 번호 업데이트 (6 → 7)
- [x] 프로덕션 빌드 생성
- [x] Capacitor 동기화
- [ ] Xcode Archive 생성
- [ ] App Store Connect 업로드
- [ ] TestFlight 빌드 처리 대기
- [ ] 테스트 정보 입력
- [ ] 테스터 초대
- [ ] 설치 및 테스트 확인

## 6. 주의사항

- **빌드 번호**: 매번 증가시켜야 함 (현재: 7)
- **버전 번호**: 마케팅 버전 (현재: 1.5.0)
- **처리 시간**: Apple 서버 처리로 10-30분 대기 필요
- **외부 테스터**: Apple 리뷰 필요 (1-2일)
- **유효 기간**: TestFlight 빌드는 90일간 유효

## 7. 문제 해결

### Archive가 Organizer에 나타나지 않을 때
- Skip Install이 YES로 설정되어 있는지 확인
- Build Settings → Deployment → Skip Install = NO

### 업로드 실패 시
- Apple ID 및 App-specific password 확인
- Xcode → Preferences → Accounts 재로그인
- 네트워크 연결 확인

### 빌드 처리가 오래 걸릴 때
- Apple 서버 상태 확인: https://developer.apple.com/system-status/
- 보통 30분 이내 처리, 최대 24시간까지 걸릴 수 있음

---

생성일: 2025-08-07
현재 상태: Archive 생성 대기 중