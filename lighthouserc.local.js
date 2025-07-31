// 로컬 개발용 Lighthouse CI 설정
module.exports = {
  ci: {
    collect: {
      // 로컬 개발 서버 사용
      url: [
        'http://localhost:3001/',
        'http://localhost:3001/records', 
        'http://localhost:3001/achievements',
        'http://localhost:3001/stats',
        'http://localhost:3001/performance'
      ],
      numberOfRuns: 1, // 로컬에서는 빠른 실행을 위해 1회만
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-web-security'
      }
    },
    assert: {
      assertions: {
        // 로컬 개발용으로 더 관대한 기준 적용
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'first-input-delay': ['warn', { maxNumericValue: 150 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        'interactive': ['warn', { maxNumericValue: 4500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // 카테고리 점수 (로컬 개발용 기준)
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
        'categories:pwa': ['warn', { minScore: 0.7 }]
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-results'
    }
  }
}