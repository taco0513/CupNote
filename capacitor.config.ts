import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycupnote.app',
  appName: 'CupNote',
  webDir: 'out',
  // server 설정 제거 - 번들된 정적 파일 사용
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    backgroundColor: '#FAF7F2',
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false,
    allowsInlineMediaPlayback: true,
    scrollEnabled: true,
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