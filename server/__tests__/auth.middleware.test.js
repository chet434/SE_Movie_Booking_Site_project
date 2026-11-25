/**
 * Unit Tests: Authentication Middleware
 */

const { protect, adminOnly, refresh } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('../config/security', () => ({
  getJwtConfig: () => ({
    secret: 'test-jwt-secret-key-for-unit-tests',
    refreshSecret: 'test-jwt-secret-key-for-unit-tests_refresh',
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  })
}));

describe('Authentication Middleware', () => {
  let mockReq, mockRes, nextFn;
  let mockUser;
  let mockFindById;
  const JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFn = jest.fn();

    mockUser = {
      _id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      select: jest.fn().mockReturnThis()
    };

    const User = require('../models/User');
    mockFindById = User.findById;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('protect middleware', () => {
    test('calls next with error when no token provided', async () => {
      await protect(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    });

    test('calls next with error when authorization header is missing Bearer', async () => {
      mockReq.headers.authorization = 'invalid-no-bearer';

      await protect(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('calls next with error when token is malformed', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await protect(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized. Token is invalid or expired.'
      });
    });

    test('sets req.user when token is valid', async () => {
      const token = jwt.sign({ id: 'test-user-id', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;

      mockFindById.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      await protect(mockReq, mockRes, nextFn);

      expect(mockReq.user).toBeDefined();
      expect(nextFn).toHaveBeenCalled();
    });

    test('calls next with error when user not found', async () => {
      const token = jwt.sign({ id: 'nonexistent-user' }, JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;

      mockFindById.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null)
      }));

      await protect(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found. Please log in again.'
      });
    });
  });

  describe('adminOnly middleware', () => {
    test('calls next when user is admin', () => {
      mockReq.user = { role: 'admin' };

      adminOnly(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
    });

    test('returns 403 when user is not admin', () => {
      mockReq.user = { role: 'user' };

      adminOnly(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin permission is required.'
      });
    });

    test('returns 403 when user is not logged in', () => {
      mockReq.user = null;

      adminOnly(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('refresh middleware', () => {
    test('returns error when refresh token is missing', async () => {
      mockReq.body = {};

      await refresh(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token is required.'
      });
    });

    test('returns error when refresh token is invalid', async () => {
      mockReq.body = { refreshToken: 'invalid-token' };

      await refresh(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('returns error when user not found', async () => {
      const refreshToken = jwt.sign({ id: 'nonexistent-user' }, 'test-jwt-secret-key-for-unit-tests_refresh', { expiresIn: '7d' });
      mockReq.body = { refreshToken };

      mockFindById.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null)
      }));

      await refresh(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});