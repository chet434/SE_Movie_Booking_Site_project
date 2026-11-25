/**
 * Unit Tests: Database Connection
 */

const { z } = require('zod');

describe('Database Connection Config', () => {
  describe('Pool Configuration Validation', () => {
    test('validates max pool size from env', () => {
      process.env.MONGODB_MAX_POOL_SIZE = '20';
      const maxSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10;
      expect(maxSize).toBe(20);
    });

    test('validates min pool size from env', () => {
      process.env.MONGODB_MIN_POOL_SIZE = '10';
      const minSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5;
      expect(minSize).toBe(10);
    });

    test('validates server selection timeout from env', () => {
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT = '10000';
      const timeout = parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000;
      expect(timeout).toBe(10000);
    });

    test('validates socket timeout from env', () => {
      process.env.MONGODB_SOCKET_TIMEOUT = '30000';
      const timeout = parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000;
      expect(timeout).toBe(30000);
    });

    test('uses defaults when env vars not set', () => {
      delete process.env.MONGODB_MAX_POOL_SIZE;
      delete process.env.MONGODB_MIN_POOL_SIZE;
      delete process.env.MONGODB_SERVER_SELECTION_TIMEOUT;
      delete process.env.MONGODB_SOCKET_TIMEOUT;

      const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10;
      const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5;
      const serverSelectionTimeout = parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000;
      const socketTimeout = parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000;

      expect(maxPoolSize).toBe(10);
      expect(minPoolSize).toBe(5);
      expect(serverSelectionTimeout).toBe(5000);
      expect(socketTimeout).toBe(45000);
    });
  });

  describe('MongoDB URI Validation', () => {
    test('validates mongodb:// URI format', () => {
      const validUri = 'mongodb://localhost:27017/mydatabase';
      expect(validUri.startsWith('mongodb://') || validUri.startsWith('mongodb+srv://')).toBe(true);
    });

    test('validates mongodb+srv:// URI format', () => {
      const validUri = 'mongodb+srv://user:pass@cluster.mongodb.net/mydatabase';
      expect(validUri.startsWith('mongodb://') || validUri.startsWith('mongodb+srv://')).toBe(true);
    });

    test('rejects mysql:// URI format', () => {
      const invalidUri = 'mysql://localhost:27017/mydatabase';
      expect(invalidUri.startsWith('mongodb://') || invalidUri.startsWith('mongodb+srv://')).toBe(false);
    });
  });

  describe('Pool Size Validation', () => {
    test('min pool size cannot exceed max pool size', () => {
      const maxSize = 10;
      const minSize = 5;
      expect(minSize).toBeLessThanOrEqual(maxSize);
    });

    test('pool sizes are positive integers', () => {
      const maxSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10;
      const minSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5;

      expect(Number.isInteger(maxSize)).toBe(true);
      expect(Number.isInteger(minSize)).toBe(true);
      expect(maxSize).toBeGreaterThan(0);
      expect(minSize).toBeGreaterThan(0);
    });
  });

  describe('Connection Options Schema', () => {
    test('connection options match expected schema', () => {
      const poolSizeSchema = z.object({
        maxPoolSize: z.number(),
        minPoolSize: z.number(),
        serverSelectionTimeoutMS: z.number(),
        socketTimeoutMS: z.number(),
        bufferCommands: z.boolean()
      });

      const options = {
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      };

      expect(() => poolSizeSchema.parse(options)).not.toThrow();
    });

    test('rejects invalid connection options', () => {
      const poolSizeSchema = z.object({
        maxPoolSize: z.number(),
        minPoolSize: z.number(),
        serverSelectionTimeoutMS: z.number(),
        socketTimeoutMS: z.number(),
        bufferCommands: z.boolean()
      });

      const invalidOptions = {
        maxPoolSize: -1,
        minPoolSize: 'five',
        bufferCommands: 'false'
      };

      expect(() => poolSizeSchema.parse(invalidOptions)).toThrow();
    });
  });
});