import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycupnote.app',
  appName: 'CupNote',
  webDir: '.next',  // Next.js build directory
  server: {
    // Production server URL
    url: 'https://mycupnote.com',
    cleartext: false,
    allowNavigation: ['mycupnote.com', '*.mycupnote.com']
  },
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    backgroundColor: '#FAF7F2',
    allowsLinkPreview: false,
    // 앱 백그라운드에서도 JavaScript 실행 유지
    limitsNavigationsToAppBoundDomains: false,
    allowsInlineMediaPlayback: true,
    // 스크롤은 허용하되 CSS로 바운스 제어
    scrollEnabled: true,
    // 세션 유지를 위한 설정
    webViewPreferences: {
      'WKWebViewOnly': true,
      'WKSuspendInBackground': false
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FAF7F2',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;