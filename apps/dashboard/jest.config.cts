module.exports = {
  displayName: 'dashboard',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/../../node_modules/jest-preset-angular/setup-jest.js'],
  testEnvironment: 'jsdom',
  maxWorkers: 2,
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  coverageDirectory: '../../coverage/apps/dashboard',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
};
