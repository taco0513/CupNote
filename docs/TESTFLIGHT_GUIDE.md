# 📱 CupNote TestFlight 배포 가이드

## 🎯 Option 1: Capacitor를 사용한 iOS 앱 변환 (권장)

### 1️⃣ Capacitor 설치 및 초기화

```bash
# Capacitor 설치
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Capacitor 초기화
npx cap init CupNote com.mycupnote.app https://mycupnote.com

# iOS 플랫폼 추가
npx cap add ios
```

### 2️⃣ Next.js 빌드 설정 수정

**`next.config.js` 수정:**
```javascript
module.exports = {
  output: 'export',  // Static export for Capacitor
  images: {
    unoptimized: true  // Required for static export
  },
  assetPrefix: './',  // Relative paths for Capacitor
}
```

### 3️⃣ Capacitor 설정 파일

**`capacitor.config.json` 생성:**
```json
{
  "appId": "com.mycupnote.app",
  "appName": "CupNote",
  "webDir": "out",
  "bundledWebRuntime": false,
  "ios": {
    "contentInset": "automatic",
    "preferredContentMode": "mobile"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000,
      "backgroundColor": "#FAF7F2",
      "showSpinner": false
    }
  }
}
```

### 4️⃣ 빌드 및 동기화

```bash
# Next.js 정적 빌드
npm run build
npm run export  # or next export

# Capacitor 동기화
npx cap sync ios

# Xcode 열기
npx cap open ios
```

### 5️⃣ iOS 앱 설정 (Xcode)

1. **Bundle Identifier**: `com.mycupnote.app`
2. **Display Name**: CupNote
3. **Version**: 1.0.0
4. **Build**: 1
5. **Deployment Target**: iOS 14.0+
6. **Device Orientation**: Portrait only

### 6️⃣ 필수 권한 추가 (Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>커피 사진을 촬영하기 위해 카메라 접근이 필요합니다</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>커피 사진을 선택하기 위해 사진 라이브러리 접근이 필요합니다</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>카페 위치를 기록하기 위해 위치 정보가 필요합니다</string>
```

### 7️⃣ 앱 아이콘 및 스플래시 스크린

```bash
# 아이콘 생성 도구 설치
npm install -D @capacitor/assets

# 아이콘 및 스플래시 생성
npx capacitor-assets generate --ios
```

필요한 이미지:
- `icon-1024x1024.png` - 앱 아이콘 원본
- `splash-2732x2732.png` - 스플래시 스크린 원본

---

## 🎯 Option 2: React Native (처음부터 개발)

### React Native 프로젝트 생성

```bash
# React Native CLI 설치
npm install -g react-native-cli

# 프로젝트 생성
npx react-native init CupNoteApp --template react-native-template-typescript

cd CupNoteApp

# 필수 패키지 설치
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens
npm install @supabase/supabase-js
npm install react-native-async-storage/async-storage
npm install react-native-vector-icons
```

---

## 📝 TestFlight 배포 프로세스

### 1. Apple Developer 계정 준비
- Apple Developer Program 가입 ($99/년)
- App Store Connect 접속

### 2. App Store Connect 설정
1. 새 앱 생성
2. Bundle ID: `com.mycupnote.app`
3. SKU: `cupnote-001`
4. 앱 정보 입력

### 3. 인증서 및 프로비저닝 프로파일
```bash
# Xcode에서 자동 관리 권장
Signing & Capabilities → Automatically manage signing ✅
```

### 4. 앱 빌드 및 아카이브
1. Xcode: Product → Archive
2. Distribute App → App Store Connect → Upload
3. 빌드 처리 대기 (약 10-30분)

### 5. TestFlight 설정
1. App Store Connect → TestFlight
2. 빌드 선택
3. 테스터 그룹 생성
4. 테스터 이메일 추가
5. 테스트 정보 작성

### 6. 베타 테스팅
- 테스터에게 초대 이메일 발송
- TestFlight 앱에서 설치
- 90일간 테스트 가능

---

## 🚨 체크리스트

### 필수 준비물
- [ ] Apple Developer 계정
- [ ] Mac 컴퓨터 (Xcode 필요)
- [ ] 앱 아이콘 (1024x1024px)
- [ ] 스크린샷 (iPhone 용)
- [ ] 앱 설명 텍스트
- [ ] 개인정보 처리방침 URL

### 앱 메타데이터
- **앱 이름**: CupNote - 커피 테이스팅 노트
- **부제목**: 나만의 커피 여정을 기록하세요
- **카테고리**: 음식 및 음료
- **키워드**: 커피, 테이스팅, 노트, 카페, 스페셜티
- **지원 URL**: https://mycupnote.com/support
- **개인정보 URL**: https://mycupnote.com/privacy

### 스크린샷 사이즈
- iPhone 14 Pro Max: 1290 × 2796
- iPhone 14 Pro: 1179 × 2556
- iPhone 8 Plus: 1242 × 2208

---

## 🎯 예상 일정

1. **Capacitor 설치 및 설정**: 1시간
2. **iOS 빌드 생성**: 30분
3. **Xcode 설정**: 1시간
4. **App Store Connect 설정**: 1시간
5. **TestFlight 업로드**: 30분
6. **처리 대기**: 10-30분
7. **테스터 초대**: 10분

**총 예상 시간**: 4-5시간

---

## 🆘 문제 해결

### 빌드 에러
```bash
# Pod 재설치
cd ios
pod install
cd ..
```

### Capacitor 동기화 문제
```bash
# 클린 빌드
npx cap sync ios --clean
```

### 코드 서명 문제
- Xcode → Preferences → Accounts → Apple ID 추가
- Team 선택 확인

---

## 📱 추가 기능 (선택사항)

### 푸시 알림
```bash
npm install @capacitor/push-notifications
npx cap sync ios
```

### 생체 인증
```bash
npm install @capacitor-community/native-biometric
npx cap sync ios
```

### 오프라인 지원
```bash
npm install @capacitor/storage
npx cap sync ios
```

---

## 🚀 다음 단계

1. **Capacitor 설치** 후 iOS 빌드 생성
2. **Xcode**에서 프로젝트 열기
3. **시뮬레이터**에서 테스트
4. **실제 기기**에서 테스트
5. **TestFlight** 업로드
6. **베타 테스터** 모집
7. **피드백** 수집 및 개선
8. **App Store** 정식 출시

---

## 💡 팁

- PWA 기능은 대부분 그대로 작동합니다
- Supabase는 네이티브 앱에서도 완벽 호환
- 기존 Next.js 코드를 최대한 재사용 가능
- TestFlight 빌드는 90일간 유효
- 최대 10,000명 테스터 초대 가능