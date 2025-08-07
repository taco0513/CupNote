import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycupnote.app',
  appName: 'CupNote',
  webDir: 'out',
  server: {
    // 프로덕션 서버 사용 (TestFlight용)
    url: 'https://mycupnote.com',
    cleartext: false,
    allowNavigation: ['mycupnote.com', '*.mycupnote.com']
  },
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