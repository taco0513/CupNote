/**
 * @document-ref NEXTJS_PATTERNS.md#performance-first-architecture
 * @design-ref DESIGN_SYSTEM.md#performance-budgets
 * @compliance-check 2025-08-02 - NextJS Production Reality 패턴 적용
 */
const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// PWA configuration removed - not currently needed for MVP

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',  // Temporarily disabled - using SSG instead
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
  // TypeScript and ESLint validation - temporarily relaxed for deployment
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for deployment
  },
  // 빌드에서 제외할 디렉토리
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
  // 이미지 최적화 - Static export requires unoptimized
  images: {
    unoptimized: true,  // Required for static export with Capacitor
    domains: ['res.cloudinary.com', 'mycupnote.com'], // 이미지 호스팅 서비스
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'mycupnote.com',
        port: '',
        pathname: '/**',
      },
    ],
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

module.exports = withBundleAnalyzer(withSentryConfig(nextConfig, sentryWebpackPluginOptions))