# iOS TestFlight Deployment Guide

> CupNote v1.4.0 iOS TestFlight 배포 가이드  
> 완성일: 2025-08-06

## 🎯 배포 준비 완료 상태

### ✅ iOS App 설정 완료
- **Target Platform**: iPhone Only (iPad 지원 제거)
- **Marketing Version**: 1.4.0
- **Build Version**: 4
- **Bundle Identifier**: com.cupnote.app
- **Deployment Target**: iOS 15.0+

### ✅ App Store Connect 검증 통과
모든 TestFlight 업로드 검증 오류가 해결되었습니다:

1. **iPad Icon 요구 사항 제거**: iPad 관련 아이콘 (167x167) 완전 제거
2. **Invalid UIBackgroundModes 해결**: background-processing, background-fetch 제거
3. **iPad Interface 설정 제거**: UISupportedInterfaceOrientations~ipad 삭제
4. **Target Device Family**: iPhone Only (TARGETED_DEVICE_FAMILY = "1")

## 🛠 기술적 개선사항 (v1.4.0)

### 성능 향상
- **TypeScript Strict Checking**: noImplicitAny, noImplicitReturns 활성화
- **Achievement Type 통합**: 3개 중복 타입을 단일 소스로 통합
- **Error Boundaries 확장**: Async, Form, Data 전용 Error Boundary 구현

### 보안 강화
- **CSP (Content Security Policy)**: XSS, Code Injection 방어 완전 구현
- **Security Headers**: X-XSS-Protection, X-Frame-Options, HSTS 설정
- **Permissions Policy**: 불필요한 브라우저 API 접근 차단

### 실시간 기능 인프라
- **Realtime Manager**: Supabase WebSocket 중앙 관리 시스템
- **Core Web Vitals**: LCP, CLS, INP, TTFB 자동 추적
- **Performance Monitoring**: Real User Monitoring (RUM) 구현

## 📱 TestFlight 업로드 절차

### 1. Xcode 프로젝트 확인
```bash
cd ios/App
xcodebuild -showBuildSettings -project App.xcodeproj -target App | grep -E "MARKETING_VERSION|CURRENT_PROJECT_VERSION|TARGETED_DEVICE_FAMILY"
```

**Expected Output:**
```
CURRENT_PROJECT_VERSION = 4
MARKETING_VERSION = 1.4.0  
TARGETED_DEVICE_FAMILY = 1
```

### 2. Next.js 빌드 실행
```bash
npm run build
npx cap sync ios
```

### 3. Xcode Archive 생성
1. Xcode에서 `ios/App/App.xcodeproj` 열기
2. **Product** → **Archive** 선택
3. Archive 성공 확인

### 4. App Store Connect 업로드
1. Organizer에서 **Distribute App** 선택
2. **App Store Connect** 선택
3. **Upload** 선택
4. 자동 검증 통과 확인
5. **Upload** 버튼 클릭

### 5. TestFlight Beta 설정
App Store Connect에서:
1. **TestFlight** 탭으로 이동
2. 업로드된 빌드 확인
3. **Beta App Information** 작성
4. **Internal Testing** 또는 **External Testing** 설정
5. 테스터 초대 및 배포

## 🔍 검증 체크리스트

### Pre-Upload 확인사항
- [ ] Next.js 빌드 성공 (`npm run build`)
- [ ] Capacitor 동기화 완료 (`npx cap sync ios`)
- [ ] iOS Marketing Version 1.4.0 확인
- [ ] Build Version 4 확인
- [ ] iPhone Only 타겟 확인

### Post-Upload 확인사항
- [ ] App Store Connect 업로드 성공
- [ ] TestFlight Processing 완료
- [ ] Beta App Information 작성
- [ ] Internal Testing 활성화
- [ ] 테스터 초대 완료

## 📋 App Store Connect 정보

### Beta App Information
```yaml
App Name: CupNote
Subtitle: 나만의 커피 기록 & 커뮤니티
Description: |
  스페셜티 커피 애호가들을 위한 개인화된 커피 기록 플랫폼입니다.
  
  주요 기능:
  • 2-Mode 커피 기록 시스템 (Cafe/HomeCafe)
  • AI 기반 커뮤니티 매칭
  • 개인화된 맛 분석 및 추천
  • 성장 트래킹 및 성취 시스템
  
  전문가의 복잡한 용어에 부담을 느끼지 않고, 
  자신만의 언어로 커피를 기록하고 다른 사람들과 경험을 나눌 수 있습니다.

Keywords: 커피, 스페셜티커피, 커피기록, 테이스팅, 커뮤니티
Categories: 
  - Primary: Food & Drink
  - Secondary: Lifestyle
```

### Version Information
- **Version**: 1.4.0
- **Build**: 4
- **Release Type**: Internal Testing
- **Platform**: iPhone
- **Minimum iOS Version**: 15.0

## 🚨 트러블슈팅

### 일반적인 문제 해결

**1. Archive 실패**
```bash
# Clean build
cd ios/App
xcodebuild clean -project App.xcodeproj -scheme App
```

**2. Code Signing 오류**
- Xcode → Signing & Capabilities 확인
- Automatic 체크 및 Team 선택 확인
- Provisioning Profile 업데이트

**3. Upload 실패**
- 네트워크 연결 확인
- Xcode 최신 버전 사용
- Application Loader 대안 사용

**4. TestFlight Processing 지연**
- 일반적으로 10-60분 소요
- 복잡한 앱의 경우 더 오래 걸릴 수 있음
- Apple Developer 포럼에서 서비스 상태 확인

## 📞 지원 및 문의

### Apple Developer Support
- [App Store Connect 도움말](https://help.apple.com/app-store-connect/)
- [TestFlight 베타 테스팅 가이드](https://help.apple.com/app-store-connect/#/devdc42b26b8)

### 프로젝트 관련
- GitHub Issues: [CupNote Repository Issues](https://github.com/your-repo/cupnote/issues)
- 개발 문서: `docs/current/` 디렉토리 참조

---

**생성일**: 2025-08-06  
**마지막 업데이트**: v1.4.0 TestFlight 준비 완료  
**작성자**: Claude Code SuperClaude Framework  