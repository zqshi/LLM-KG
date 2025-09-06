import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        'mock-server.cjs',
        'vite.config.ts',
        'vitest.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // 核心模块需要更高的覆盖率
        'src/api/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/stores/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    // 并行测试以提高速度

    // 超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    // 测试文件匹配模式
    include: [
      'tests/**/*.test.{js,ts}',
      'tests/**/*.spec.{js,ts}',
      'src/**/__tests__/**/*.{js,ts}',
      'src/**/*.test.{js,ts}',
      'src/api/__tests__/**/*.{js,ts}',
      'src/views/audit/components/__tests__/**/*.{js,ts}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'cypress/',
      'e2e/'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests')
    }
  },
  define: {
    // 测试环境变量
    'import.meta.env.MODE': '"test"',
    'import.meta.env.VITE_API_BASE_URL': '"http://localhost:3001"',
    'import.meta.env.VITE_APP_TITLE': '"测试环境"'
  }
})