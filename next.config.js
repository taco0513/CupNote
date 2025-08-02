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
  // 성능 최적화 설정
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 실험적 기능 활성화
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // ESLint 에러를 무시하고 빌드 진행
  eslint: {
    ignoreDuringBuilds: true,
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