import { Router } from 'express';
import { body } from 'express-validator';
import {
  register, login, logout, getMe, verifyEmail,
  resendVerification, forgotPassword, resetPassword,
  refreshToken, changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['client', 'developer']).withMessage('Role must be client or developer'),
  validate,
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
], login);

router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/verify-email', [body('token').notEmpty(), validate], verifyEmail);
router.post('/resend-verification', authenticate, resendVerification);
router.post('/refresh', refreshToken);

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
  validate,
], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
], resetPassword);

router.patch('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate,
], changePassword);

export default router;
