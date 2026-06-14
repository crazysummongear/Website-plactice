export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  // Coverage thresholds for code quality
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85,
    },
  },
  // Verbose output for better debugging
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Restore all mocks between tests
  restoreMocks: true,
};
