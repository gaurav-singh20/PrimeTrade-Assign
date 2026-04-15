const express = require('express');
const { body } = require('express-validator');
const { login, logout, refresh, register } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const emailValidation = body('email').isEmail().withMessage('Valid email is required').normalizeEmail();
const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),
    emailValidation,
    passwordValidation
  ],
  validateRequest,
  register
);

router.post('/login', [emailValidation, passwordValidation], validateRequest, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);

module.exports = router;
