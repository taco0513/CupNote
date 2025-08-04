# 📱 CupNote iOS 앱 - Xcode 프로젝트 생성 가이드

## 🚀 가장 빠른 TestFlight 배포 방법 (2시간)

### 1️⃣ Xcode에서 새 프로젝트 생성

1. **Xcode 열기**
2. **Create New Project** → **iOS** → **App**
3. 설정 입력:
   - **Product Name**: CupNote
   - **Team**: Your Apple Developer Account
   - **Organization Identifier**: com.mycupnote
   - **Bundle Identifier**: com.mycupnote.app
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Use Core Data**: No
   - **Include Tests**: No

### 2️⃣ WebView 구현 (ContentView.swift)

```swift
import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "https://cupnote.vercel.app")!)
            .edgesIgnoringSafeArea(.all)
    }
}

struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = false
        
        // iOS 상태바 스타일
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }
}
```

### 3️⃣ Info.plist 권한 추가

```xml
<key>NSCameraUsageDescription</key>
<string>커피 사진을 촬영하기 위해 카메라 접근이 필요합니다</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>커피 사진을 선택하기 위해 사진 라이브러리 접근이 필요합니다</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>카페 위치를 기록하기 위해 위치 정보가 필요합니다</string>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>cupnote.vercel.app</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### 4️⃣ 앱 아이콘 설정

1. **Assets.xcassets** → **AppIcon** 클릭
2. 각 사이즈별 아이콘 드래그 & 드롭:
   - 1024×1024 (App Store)
   - 180×180 (iPhone)
   - 120×120 (iPhone)
   - 87×87 (iPhone)
   - 80×80 (iPhone)
   - 60×60 (iPhone)
   - 58×58 (iPhone)
   - 40×40 (iPhone)
   - 20×20 (Notification)

### 5️⃣ Launch Screen 설정

1. **LaunchScreen.storyboard** 열기
2. 배경색: #FAF7F2
3. 중앙에 ☕ 이모지 또는 로고 배치

### 6️⃣ 빌드 설정

1. **프로젝트 설정** → **General**:
   - **Deployment Target**: iOS 14.0
   - **Device Orientation**: Portrait only
   - **Status Bar Style**: Default

2. **Signing & Capabilities**:
   - **Automatically manage signing**: ✅
   - **Team**: Your Developer Account

### 7️⃣ TestFlight 업로드

1. **Product** → **Archive**
2. **Distribute App** 선택
3. **App Store Connect** → **Upload**
4. 옵션 선택:
   - **Upload your app's symbols**: ✅
   - **Manage Version and Build Number**: ✅
5. **Upload** 클릭

### 8️⃣ App Store Connect 설정

1. https://appstoreconnect.apple.com 접속
2. **My Apps** → **+** → **New App**
3. 정보 입력:
   - **Platform**: iOS
   - **Name**: CupNote
   - **Primary Language**: Korean
   - **Bundle ID**: com.mycupnote.app
   - **SKU**: cupnote-001

### 9️⃣ TestFlight 설정

1. **TestFlight** 탭 클릭
2. **Internal Testing** → **+** → 테스터 추가
3. **Build** 선택 (처리 완료 후)
4. **Start Testing** 클릭

---

## 📱 개선된 WebView (선택사항)

### 네이티브 느낌 추가

```swift
import SwiftUI
import WebKit

struct ContentView: View {
    @State private var isLoading = true
    @State private var canGoBack = false
    @State private var canGoForward = false
    
    var body: some View {
        ZStack {
            WebViewContainer(
                isLoading: $isLoading,
                canGoBack: $canGoBack,
                canGoForward: $canGoForward
            )
            
            if isLoading {
                LoadingView()
            }
        }
        .edgesIgnoringSafeArea(.all)
    }
}

struct LoadingView: View {
    var body: some View {
        ZStack {
            Color(hex: "FAF7F2")
            
            VStack(spacing: 20) {
                Text("☕")
                    .font(.system(size: 64))
                
                Text("CupNote")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(Color(hex: "6D3410"))
                
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .scaleEffect(1.5)
            }
        }
    }
}

struct WebViewContainer: UIViewRepresentable {
    @Binding var isLoading: Bool
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.applicationNameForUserAgent = "CupNote-iOS/1.0"
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        
        // 바운스 효과 제거
        webView.scrollView.bounces = false
        
        // 초기 URL 로드
        if let url = URL(string: "https://cupnote.vercel.app") {
            webView.load(URLRequest(url: url))
        }
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        // 업데이트 로직
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: WebViewContainer
        
        init(_ parent: WebViewContainer) {
            self.parent = parent
        }
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.isLoading = true
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.isLoading = false
            parent.canGoBack = webView.canGoBack
            parent.canGoForward = webView.canGoForward
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.isLoading = false
        }
    }
}

// Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
```

---

## ⏱️ 예상 시간

1. **Xcode 프로젝트 생성**: 10분
2. **WebView 코드 작성**: 20분
3. **앱 아이콘 설정**: 15분
4. **빌드 & 아카이브**: 15분
5. **TestFlight 업로드**: 20분
6. **App Store Connect 설정**: 20분
7. **처리 대기**: 10-30분

**총 소요 시간: 2시간**

---

## ✅ 체크리스트

- [ ] Xcode 설치 (최신 버전)
- [ ] Apple Developer 계정 ($99/년)
- [ ] 앱 아이콘 1024×1024
- [ ] Bundle ID: com.mycupnote.app
- [ ] 인증서 및 프로비저닝 프로파일

---

## 🎯 다음 단계

1. **Xcode 열기**
2. **새 프로젝트 생성**
3. **위 코드 복사/붙여넣기**
4. **실제 기기에서 테스트**
5. **TestFlight 업로드**
6. **베타 테스터 초대**

이 방법이 가장 빠르고 확실합니다! 🚀