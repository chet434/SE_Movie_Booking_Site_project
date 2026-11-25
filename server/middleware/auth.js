const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtConfig } = require('../config/security');

// Protect routes — verify JWT access token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const config = getJwtConfig();
      const decoded = jwt.verify(token, config.secret);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please log in again.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token is invalid or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }
};

// Refresh access token using refresh token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    const config = getJwtConfig();
    const decoded = jwt.verify(refreshToken, config.refreshSecret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    const newToken = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: config.expiresIn
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: config.expiresIn
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token.'
    });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin permission is required.'
    });
  }
};

module.exports = { protect, adminOnly, refresh };
