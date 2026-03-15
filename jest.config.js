/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s', '**/__tests__/**/*.spec.[jt]s'],
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'app/api/**/*.js',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

module.exports = config;
