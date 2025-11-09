const config = {
  rootDir: '../../',
  preset: 'ts-jest',
  globalSetup: '<rootDir>/tests/e2e/setup.js',
  globalTeardown: '<rootDir>/tests/e2e/teardown.js',
  testEnvironment: '<rootDir>/tests/e2e/puppeteer_environment.js',
  testMatch: ['<rootDir>/tests/e2e/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tests/e2e/tsconfig.json'
    }
  }
}

export default config
