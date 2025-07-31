module.exports = {
  ci: {
    collect: {
      // 자동으로 빌드된 Next.js 앱을 사용
      startServerCommand: 'npm run build && npm start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/records',
        'http://localhost:3000/achievements',
        'http://localhost:3000/stats',
        'http://localhost:3000/performance'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      assertions: {
        // Core Web Vitals 임계값 설정
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // 기타 성능 지표
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        
        // 접근성
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // 베스트 프랙티스
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        
        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // PWA
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // 성능 카테고리 전체 점수
        'categories:performance': ['warn', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      // 추후 LHCI Server 설정 시 사용
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token'
    }
  }
}