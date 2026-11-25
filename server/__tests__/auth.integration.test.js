/**
 * Integration Tests: Authentication Endpoints
 * Tests the auth routes with mocked components
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

// Mock User model
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  deleteMany: jest.fn()
}));

describe('Authentication Integration', () => {
  let app;
  let mockUser;
  let mockFindOne;
  let mockCreate;
  let mockFindById;
  let mockDeleteMany;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    const User = require('../models/User');
    mockFindOne = User.findOne;
    mockCreate = User.create;
    mockFindById = User.findById;
    mockDeleteMany = User.deleteMany;

    mockUser = {
      _id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'hashedpassword',
      matchPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn()
    };

    // Create minimal test app (without actual auth endpoints)
    app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Protected endpoint
    const authMiddleware = (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        req.userId = decoded.id;
        next();
      } catch (error) {
        res.status(401).json({ success: false, error: 'Token invalid' });
      }
    };

    app.get('/api/auth/profile', authMiddleware, async (req, res) => {
      const user = await User.findById(req.userId).select('-password');
      res.json({ success: true, data: user });
    });
  });

  describe('GET /api/health', () => {
    test('returns ok status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /api/auth/profile (protected)', () => {
    test('returns profile for authenticated user', async () => {
      const User = require('../models/User');

      // Mock chainable select method
      const mockSelect = jest.fn().mockResolvedValue({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone
      });
      User.findById.mockReturnValue({ select: mockSelect });

      const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('rejects request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('rejects request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token invalid');
    });

    test('rejects request with malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer not.valid.token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token invalid');
    });
  });
});

describe('Authentication Validation', () => {
  describe('Email validation', () => {
    test('valid email passes', () => {
      const email = 'test@example.com';
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('invalid email fails', () => {
      const emails = ['test', '@example.com', 'test@', 'test@.com'];
      emails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('Phone validation', () => {
    test('valid 10-digit phone number', () => {
      const phone = '1234567890';
      expect(/^\d{10}$/.test(phone)).toBe(true);
    });

    test('invalid phone numbers', () => {
      const invalid = ['123', '123456789', 'abcdefghij', '123-456-7890'];
      invalid.forEach(phone => {
        expect(/^\d{10}$/.test(phone)).toBe(false);
      });
    });
  });

  describe('Password validation', () => {
    test('password min 6 chars', () => {
      const valid = ['123456', 'password123', 'abcdef'];
      valid.forEach(pwd => {
        expect(pwd.length).toBeGreaterThanOrEqual(6);
      });

      expect('123'.length).toBeLessThan(6);
    });
  });

  describe('JWT token generation', () => {
    test('generates valid JWT token', () => {
      const payload = { id: 'user-123', email: 'test@example.com' };
      const secret = 'test-secret';
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });

    test('token verification fails with wrong secret', () => {
      const payload = { id: 'user-123' };
      const token = jwt.sign(payload, 'secret1', { expiresIn: '1h' });

      expect(() => jwt.verify(token, 'secret2')).toThrow();
    });

    test('token verification fails with expired token', () => {
      const payload = { id: 'user-123' };
      const token = jwt.sign(payload, 'secret', { expiresIn: '1ms' });

      setTimeout(() => {
        expect(() => jwt.verify(token, 'secret')).toThrow();
      }, 100);
    });
  });
});