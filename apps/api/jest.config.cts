module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  maxWorkers: 2,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  moduleNameMapper: {
    '^@secure-task-system/data$': '<rootDir>/../../libs/data/src/index.ts',
    '^@secure-task-system/data/(.*)$': '<rootDir>/../../libs/data/src/$1',
    '^@secure-task-system/auth$': '<rootDir>/../../libs/auth/src/index.ts',
    '^@secure-task-system/auth/(.*)$': '<rootDir>/../../libs/auth/src/$1',
  },
};
