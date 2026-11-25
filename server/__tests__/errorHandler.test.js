/**
 * Unit tests for centralized error handling middleware.
 * Tests the errorHandler and asyncHandler middleware functions.
 */

const { errorHandler, asyncHandler } = require('../middleware/errorHandler');
const { ApiError, NotFound, BadRequest, Unauthorized, Forbidden, Conflict, ValidationError, TooManyRequests, InternalServerError } = require('../utils/ApiError');

describe('errorHandler middleware', () => {
  let mockReq, mockRes, nextFn;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFn = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('ApiError instances', () => {
    test('handles NotFound (404) ApiError with operational flag', () => {
      const err = NotFound('Movie not found');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Movie not found',
        })
      );
    });

    test('handles BadRequest (400) with custom message', () => {
      const err = BadRequest('Invalid input');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid input',
        })
      );
    });

    test('handles Unauthorized (401) error', () => {
      const err = Unauthorized('Not authenticated');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Not authenticated',
        })
      );
    });

    test('handles Forbidden (403) error', () => {
      const err = Forbidden('Access denied');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Access denied',
        })
      );
    });

    test('handles Conflict (409) error', () => {
      const err = Conflict('Resource already exists');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Resource already exists',
        })
      );
    });

    test('handles ValidationError (422) error', () => {
      const err = ValidationError('Invalid data format');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid data format',
        })
      );
    });

    test('handles TooManyRequests (429) error', () => {
      const err = TooManyRequests('Rate limit exceeded');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Rate limit exceeded',
        })
      );
    });
  });

  describe('Mongoose errors', () => {
    test('handles CastError (invalid ObjectId)', () => {
      const err = new Error('CastError');
      err.name = 'CastError';
      err.path = '_id';
      err.value = 'invalid-object-id';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid _id: invalid-object-id',
        })
      );
    });

    test('handles DuplicateKeyError (E11000)', () => {
      const err = new Error('Duplicate key error');
      err.code = 11000;
      err.keyPattern = { email: 1 };
      err.value = 'test@example.com';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Duplicate value for email: test@example.com',
        })
      );
    });
  });

  describe('Zod Validation errors', () => {
    test('handles Zod ValidationError', () => {
      const err = new Error('Validation failed');
      err.name = 'ZodError';
      err.errors = [{ message: 'Invalid email' }, { message: 'Required' }];

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid email, Required',
        })
      );
    });
  });

  describe('JWT errors', () => {
    test('handles JsonWebTokenError', () => {
      const err = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid or expired token',
        })
      );
    });

    test('handles TokenExpiredError', () => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid or expired token',
        })
      );
    });
  });

  describe('Non-operational errors', () => {
    test('returns generic message for internal errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const err = new Error('Database connection lost');
      err.stack = 'Error: Database connection lost\n    at...';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal Server Error',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    test('includes stack trace for non-operational errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const err = new Error('Database connection lost');
      err.stack = 'Error: Database connection lost\n    at test.js:10:5';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database connection lost',
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    test('includes stack trace in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      const err = new Error('Test error');
      err.stack = 'Error: Test error\n    at test.js:5:10';

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Test error',
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Response format', () => {
    test('always returns success: false on error', () => {
      const err = new Error('Any error');

      errorHandler(err, mockReq, mockRes, nextFn);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    test('stack is not included in production for non-operational errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const err = new Error('Internal error');
      err.stack = 'Error: Internal error\n    at app.js:10:5';

      errorHandler(err, mockReq, mockRes, nextFn);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('stack');

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('asyncHandler wrapper', () => {
  let mockReq, mockRes, nextFn;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    nextFn = jest.fn();
  });

  test('calls next with error when async handler throws', async () => {
    const testError = new Error('Async test error');
    const asyncHandlerFn = asyncHandler(async () => {
      throw testError;
    });

    await asyncHandlerFn(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith(testError);
  });

  test('calls next with error for rejected promises', async () => {
    const rejectionError = new Error('Promise rejected');
    const asyncHandlerFn = asyncHandler(() => {
      return Promise.reject(rejectionError);
    });

    await asyncHandlerFn(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith(rejectionError);
  });

  test('does not call next when handler succeeds', async () => {
    const asyncHandlerFn = asyncHandler(async () => {
      return { data: 'success' };
    });

    await asyncHandlerFn(mockReq, mockRes, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
  });

  test('handles synchronous throws in async handler', async () => {
    const syncError = new Error('Sync throw');
    const asyncHandlerFn = asyncHandler(async () => {
      throw syncError;
    });

    await asyncHandlerFn(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith(syncError);
  });
});

describe('ApiError class', () => {
  test('creates ApiError with correct properties', () => {
    const error = new ApiError(404, 'Not found', true);

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  test('creates non-operational error when isOperational is false', () => {
    const error = new ApiError(500, 'Bug', false);

    expect(error.isOperational).toBe(false);
  });

  test('captures stack trace by default', () => {
    const error = new ApiError(400, 'Bad request');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Bad request');
  });

  test('preserves custom stack when provided', () => {
    const customStack = 'Custom stack trace';
    const error = new ApiError(500, 'Error', true, customStack);

    expect(error.stack).toBe(customStack);
  });

  test('sets statusCode as number', () => {
    const error = new ApiError(500, 'Error');
    expect(typeof error.statusCode).toBe('number');
  });
});

describe('Error factory functions', () => {
  test('BadRequest creates 400 error', () => {
    const error = BadRequest('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
  });

  test('Unauthorized creates 401 error', () => {
    const error = Unauthorized('Not authenticated');
    expect(error.statusCode).toBe(401);
  });

  test('Forbidden creates 403 error', () => {
    const error = Forbidden('Access denied');
    expect(error.statusCode).toBe(403);
  });

  test('NotFound creates 404 error', () => {
    const error = NotFound('Resource missing');
    expect(error.statusCode).toBe(404);
  });

  test('Conflict creates 409 error', () => {
    const error = Conflict('Resource exists');
    expect(error.statusCode).toBe(409);
  });

  test('ValidationError creates 422 error', () => {
    const error = ValidationError('Invalid data');
    expect(error.statusCode).toBe(422);
  });

  test('TooManyRequests creates 429 error', () => {
    const error = TooManyRequests('Rate limited');
    expect(error.statusCode).toBe(429);
  });

  test('InternalServerError creates 500 error with isOperational false', () => {
    const error = InternalServerError('Server error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });

  test('BadRequest has default message', () => {
    const error = BadRequest();
    expect(error.message).toBe('Bad request');
  });

  test('NotFound has default message', () => {
    const error = NotFound();
    expect(error.message).toBe('Resource not found');
  });
});