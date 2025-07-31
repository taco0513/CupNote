/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
      '**/playwright-tests/**',
      // Temporarily exclude incomplete test files
      'src/lib/__tests__/achievements.test.ts',
      'src/lib/__tests__/error-handler.test.ts',
      'src/lib/__tests__/offline-storage.test.ts',
      'src/lib/__tests__/offline-sync.test.ts',
      'src/components/__tests__/LazyImage.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.next/**',
        '**/playwright-tests/**',
        'src/app/**/page.tsx', // App Router pages
        'src/app/**/layout.tsx', // App Router layouts
        'src/app/**/loading.tsx', // App Router loading components
        'src/app/**/error.tsx', // App Router error components
        'src/app/**/not-found.tsx', // App Router not-found components
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // Handle Next.js specific imports
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})