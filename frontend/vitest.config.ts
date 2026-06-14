import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',
    // Setup files for global test configuration
    setupFiles: ['./src/test/setup.ts'],
    // Exclude E2E tests from Vitest runs
    exclude: ['node_modules', 'dist', '**/e2e/**'],
    // Hoist mocks to the top of the test file
    hoist: true,
    // Test coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'e2e/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/index.ts',
        '**/types.ts',
      ],
      // Coverage thresholds
      lines: 80,
      functions: 85,
      branches: 75,
      statements: 80,
    },
    // Global test timeout
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 10000,
    // Clear mocks between tests
    clearMocks: true,
    // Restore mocks between tests
    restoreMocks: true,
    // Globals for test functions (describe, it, expect, etc)
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
