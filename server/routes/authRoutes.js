const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../schemas/authSchemas');

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', validate({ body: refreshTokenSchema }), refreshToken);
router.get('/profile', protect, getProfile);
router.put('/profile', validate({ body: updateProfileSchema }), protect, updateProfile);
router.put('/change-password', validate({ body: changePasswordSchema }), protect, changePassword);

module.exports = router;
