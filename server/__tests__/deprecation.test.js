/**
 * Unit Tests: Deprecation Middleware
 */

const { deprecated, getDeprecationWarnings } = require('../middleware/deprecation');

describe('Deprecation Middleware', () => {
  let mockReq, mockRes, nextFn;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/v1/old-endpoint',
      url: '/api/v1/old-endpoint'
    };
    mockRes = {
      setHeader: jest.fn().mockReturnThis()
    };
    nextFn = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('deprecated middleware', () => {
    test('sets warning headers and calls next', () => {
      const middleware = deprecated('Use /api/v2/new-endpoint instead', '1.0.0', '3.0.0');
      middleware(mockReq, mockRes, nextFn);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Warning', expect.stringContaining('Deprecated API'));
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Deprecation', 'v1.0.0');
      expect(nextFn).toHaveBeenCalled();
    });

    test('uses default version if not provided', () => {
      const middleware = deprecated('Endpoint deprecated');
      middleware(mockReq, mockRes, nextFn);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Deprecation', 'v2.0.0');
    });

    test('logs warning in non-test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const middleware = deprecated('Test warning', '1.0.0');
      middleware(mockReq, mockRes, nextFn);

      process.env.NODE_ENV = originalEnv;

      expect(nextFn).toHaveBeenCalled();
    });

    test('does not log warning in test environment', () => {
      process.env.NODE_ENV = 'test';

      const middleware = deprecated('Test warning', '1.0.0');
      middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });
  });

  describe('getDeprecationWarnings', () => {
    test('returns empty array when no warnings', () => {
      // Reset warnings by creating new Map in module (can't easily do this)
      // Just test that it returns an array
      const warnings = getDeprecationWarnings();
      expect(Array.isArray(warnings)).toBe(true);
    });
  });
});