/**
 * Unit Tests: Validation Middleware
 */

const { validate } = require('../middleware/validate');
const { z } = require('zod');

describe('Validation Middleware', () => {
  let mockReq, mockRes, nextFn;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    mockRes = {};
    nextFn = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validate middleware', () => {
    describe('body validation', () => {
      test('validates and parses valid body', () => {
        const schema = z.object({
          name: z.string(),
          age: z.number().min(0)
        });

        mockReq.body = { name: 'John', age: 25 };

        const middleware = validate({ body: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(mockReq.body).toEqual({ name: 'John', age: 25 });
        expect(nextFn).toHaveBeenCalledWith();
      });

      test('passes ZodError to next when body validation fails', () => {
        const schema = z.object({
          email: z.string().email()
        });

        mockReq.body = { email: 'invalid-email' };

        const middleware = validate({ body: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalledTimes(1);
        expect(nextFn.mock.calls[0][0]).toBeDefined();
        expect(nextFn.mock.calls[0][0].name).toBe('ZodError');
      });

      test('throws when body is missing required fields', () => {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(6)
        });

        mockReq.body = { email: 'test@example.com' };

        const middleware = validate({ body: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalled();
        const error = nextFn.mock.calls[0][0];
        expect(error.name).toBe('ZodError');
      });
    });

    describe('query validation', () => {
      test('validates and parses valid query', () => {
        const schema = z.object({
          page: z.string().optional(),
          limit: z.string().optional()
        });

        mockReq.query = { page: '1', limit: '20' };

        const middleware = validate({ query: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalledWith();
      });

      test('passes ZodError to next when query validation fails', () => {
        const schema = z.object({
          limit: z.number()
        });

        mockReq.query = { limit: 'not-a-number' };

        const middleware = validate({ query: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalled();
        const error = nextFn.mock.calls[0][0];
        expect(error.name).toBe('ZodError');
      });
    });

    describe('params validation', () => {
      test('validates and parses valid params', () => {
        const schema = z.object({
          id: z.string().regex(/^[a-f\d]{24}$/i)
        });

        mockReq.params = { id: '507f1f77bcf86cd799439011' };

        const middleware = validate({ params: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(mockReq.params.id).toBe('507f1f77bcf86cd799439011');
        expect(nextFn).toHaveBeenCalledWith();
      });

      test('passes ZodError to next when params validation fails', () => {
        const schema = z.object({
          id: z.string().regex(/^[a-f\d]{24}$/i)
        });

        mockReq.params = { id: 'invalid-id' };

        const middleware = validate({ params: schema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalled();
        const error = nextFn.mock.calls[0][0];
        expect(error.name).toBe('ZodError');
      });
    });

    describe('combined validation', () => {
      test('validates body, query, and params together', () => {
        const bodySchema = z.object({ name: z.string() });
        const querySchema = z.object({ page: z.string() });
        const paramsSchema = z.object({ id: z.string() });

        mockReq.body = { name: 'Test' };
        mockReq.query = { page: '1' };
        mockReq.params = { id: 'test-id' };

        const middleware = validate({ body: bodySchema, query: querySchema, params: paramsSchema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalledWith();
      });

      test('stops on first validation error', () => {
        const bodySchema = z.object({ name: z.string() });
        const querySchema = z.object({ page: z.number() });

        mockReq.body = { name: 'Test' };
        mockReq.query = { page: 'invalid' };

        const middleware = validate({ body: bodySchema, query: querySchema });
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalled();
        expect(nextFn.mock.calls[0][0].name).toBe('ZodError');
      });

      test('handles empty validation object', () => {
        mockReq.body = { name: 'Test' };
        mockReq.query = { page: '1' };
        mockReq.params = { id: 'test-id' };

        const middleware = validate({});
        middleware(mockReq, mockRes, nextFn);

        expect(nextFn).toHaveBeenCalledWith();
      });
    });
  });
});