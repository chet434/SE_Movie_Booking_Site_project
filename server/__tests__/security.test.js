/**
 * Unit Tests: Security Configuration
 * Tests the security validation and configuration functions
 */

const {
  validateEnv,
  getCorsConfig,
  getJwtConfig,
  getRateLimitConfig,
  requiredEnvVars,
  optionalEnvVars
} = require('../config/security');

describe('Security Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('validateEnv', () => {
    test('passes when all required env vars are present', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'test-secret-key-for-validation-12345';

      expect(() => validateEnv()).not.toThrow();
    });

    test('throws when MONGODB_URI is missing', () => {
      process.env.JWT_SECRET = 'test-secret-key-for-validation-12345';
      delete process.env.MONGODB_URI;

      expect(() => validateEnv()).toThrow('Missing required environment variables');
    });

    test('throws when JWT_SECRET is missing', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      delete process.env.JWT_SECRET;

      expect(() => validateEnv()).toThrow('Missing required environment variables');
    });

    test('throws when JWT_SECRET is too short', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'short-secret';

      expect(() => validateEnv()).toThrow('JWT_SECRET must be at least 32 characters');
    });

    test('throws when MONGODB_URI has invalid format', () => {
      process.env.MONGODB_URI = 'mysql://localhost:27017/test';
      process.env.JWT_SECRET = 'test-secret-key-for-validation-12345';

      expect(() => validateEnv()).toThrow('MONGODB_URI must start with');
    });

    test('accepts mongodb+srv:// URIs', () => {
      process.env.MONGODB_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/test';
      process.env.JWT_SECRET = 'test-secret-key-for-validation-12345';

      expect(() => validateEnv()).not.toThrow();
    });

    test('lists all missing required variables', () => {
      delete process.env.MONGODB_URI;
      delete process.env.JWT_SECRET;

      try {
        validateEnv();
        fail('Should have thrown');
      } catch (error) {
        expect(error.message).toContain('MONGODB_URI');
        expect(error.message).toContain('JWT_SECRET');
      }
    });
  });

  describe('getCorsConfig', () => {
    test('returns cors origin from env when set', () => {
      process.env.CORS_ORIGIN = 'http://localhost:5173';

      const config = getCorsConfig();

      expect(config.origin).toBe('http://localhost:5173');
      expect(config.credentials).toBe(true);
    });

    test('handles comma-separated origins', () => {
      process.env.CORS_ORIGIN = 'http://localhost:5173,http://localhost:3000';

      const config = getCorsConfig();

      expect(config.origin).toEqual(['http://localhost:5173', 'http://localhost:3000']);
    });

    test('returns localhost for development by default', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.CORS_ORIGIN;

      const config = getCorsConfig();

      expect(config.origin).toBe('http://localhost:5173');
    });

    test('returns configured origin in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://example.com';

      const config = getCorsConfig();

      expect(config.origin).toBe('https://example.com');
    });

    test('returns default origin in production when CORS_ORIGIN not set', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.CORS_ORIGIN;

      const config = getCorsConfig();

      expect(config.origin).toBe('https://yourdomain.com');
    });

    test('always includes required methods', () => {
      const config = getCorsConfig();

      expect(config.methods).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
      expect(config.allowedHeaders).toContain('Content-Type');
      expect(config.allowedHeaders).toContain('Authorization');
      expect(config.allowedHeaders).toContain('X-Requested-With');
    });

    test('includes 24 hour maxAge', () => {
      const config = getCorsConfig();

      expect(config.maxAge).toBe(86400);
    });
  });

  describe('getJwtConfig', () => {
    test('returns JWT config with sensible defaults', () => {
      const config = getJwtConfig();

      expect(config.expiresIn).toBe('1h');
      expect(config.refreshExpiresIn).toBe('7d');
    });

    test('uses custom JWT_EXPIRES_IN from env', () => {
      process.env.JWT_EXPIRES_IN = '30m';
      process.env.JWT_SECRET = 'test-secret-key-for-validation';

      const config = getJwtConfig();

      expect(config.expiresIn).toBe('30m');
    });

    test('uses custom JWT_REFRESH_EXPIRES_IN from env', () => {
      process.env.JWT_REFRESH_EXPIRES_IN = '14d';
      process.env.JWT_SECRET = 'test-secret-key-for-validation';

      const config = getJwtConfig();

      expect(config.refreshExpiresIn).toBe('14d');
    });

    test('uses custom JWT_SECRET from env', () => {
      process.env.JWT_SECRET = 'custom-secret-key';

      const config = getJwtConfig();

      expect(config.secret).toBe('custom-secret-key');
    });

    test('derives refreshSecret from JWT_SECRET', () => {
      process.env.JWT_SECRET = 'test-secret-key-for-validation';

      const config = getJwtConfig();

      expect(config.refreshSecret).toBe('test-secret-key-for-validation_refresh');
    });
  });

  describe('getRateLimitConfig', () => {
    test('returns rate limit config with defaults', () => {
      const config = getRateLimitConfig();

      expect(config.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(config.max).toBe(100);
    });

    test('uses custom RATE_LIMIT_MAX from env', () => {
      process.env.RATE_LIMIT_MAX = '200';

      const config = getRateLimitConfig();

      expect(config.max).toBe(200);
    });

    test('uses custom RATE_LIMIT_WINDOW_MS from env', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '300000'; // 5 minutes

      const config = getRateLimitConfig();

      expect(config.windowMs).toBe(300000);
    });

    test('includes standard headers', () => {
      const config = getRateLimitConfig();

      expect(config.standardHeaders).toBe(true);
      expect(config.legacyHeaders).toBe(false);
    });

    test('includes error message for rate limit exceeded', () => {
      const config = getRateLimitConfig();

      expect(config.message).toEqual({
        success: false,
        error: 'Too many requests from this IP, please try again later'
      });
    });
  });

  describe('exported constants', () => {
    test('requiredEnvVars contains MONGODB_URI and JWT_SECRET', () => {
      expect(requiredEnvVars).toContain('MONGODB_URI');
      expect(requiredEnvVars).toContain('JWT_SECRET');
    });

    test('optionalEnvVars contains PORT and other optional vars', () => {
      expect(optionalEnvVars).toContain('PORT');
      expect(optionalEnvVars).toContain('NODE_ENV');
      expect(optionalEnvVars).toContain('JWT_EXPIRES_IN');
      expect(optionalEnvVars).toContain('CORS_ORIGIN');
      expect(optionalEnvVars).toContain('RATE_LIMIT_MAX');
      expect(optionalEnvVars).toContain('RATE_LIMIT_WINDOW_MS');
    });
  });
});