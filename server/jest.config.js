module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'middleware/**/*.js',
    'controllers/**/*.js',
    'repositories/**/*.js',
    'config/**/*.js',
    'utils/**/*.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000
};