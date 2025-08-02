/**
 * @document-ref NEXTJS_PATTERNS.md#performance-first-architecture
 * @design-ref DESIGN_SYSTEM.md#performance-budgets
 * @compliance-check 2025-08-02 - NextJS Production Reality 패턴 적용
 */
const { withSentryConfig } = require('@sentry/nextjs')

// PWA 설정 임시 비활성화
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
//   buildExcludes: [/middleware-manifest\.json$/],
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'supabase-cache',
//         expiration: {
//           maxEntries: 50,
//           maxAgeSeconds: 60 * 60 * 24 // 24 hours
//         }
//       }
//     },
//     {
//       urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*$/,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'supabase-images',
//         expiration: {
//           maxEntries: 100,
//           maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
//         }
//       }
//     }
//   ]
// })

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 성능 최적화 설정 - Production Reality 패턴
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true, // styled-components 최적화
  },
  // 성능 모니터링 강화
  poweredByHeader: false, // 보안 헤더 제거
  generateEtags: true, // ETag 생성으로 캐싱 최적화
  // 실험적 기능 활성화 - Production Reality 패턴
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
    typedRoutes: true, // 타입 안전한 라우팅
    optimizeCss: true, // CSS 최적화
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'], // Web Vitals 추적
  },
  // 번들 분석 설정
  productionBrowserSourceMaps: false, // 프로덕션 소스맵 비활성화
  // ESLint 에러를 무시하고 빌드 진행
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 체크 제외 패턴
  typescript: {
    ignoreBuildErrors: true, // 임시로 무시
  },
  // 빌드에서 제외할 디렉토리
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
  // 이미지 최적화
  images: {
    domains: ['res.cloudinary.com'], // 이미지 호스팅 서비스
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Gzip 압축 활성화
  compress: true,
  // 불필요한 파일 제외
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

// Sentry 설정
const sentryWebpackPluginOptions = {
  // Sentry 빌드 최적화 설정
  silent: true, // 빌드 시 로그 최소화
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // 소스맵 업로드 설정
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  
  // 성능 최적화
  sourcemaps: {
    disable: process.env.NODE_ENV === 'development',
    deleteAfterUpload: true,
  }
}

// PWA 임시 비활성화
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
// module.exports = withPWA(nextConfig)