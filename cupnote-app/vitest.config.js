import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/main.ts',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData/*',
          '**/*.spec.ts',
          '**/*.test.ts',
        ],
        thresholds: {
          global: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
          },
        },
      },
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  }),
)
