import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycupnote.app',
  appName: 'CupNote',
  webDir: 'out',  // Next.js static export directory
  server: {
    url: 'https://mycupnote.com',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#FAF7F2',
    allowsLinkPreview: false,
    // 앱 백그라운드에서도 JavaScript 실행 유지
    limitsNavigationsToAppBoundDomains: false,
    allowsInlineMediaPlayback: true,
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
