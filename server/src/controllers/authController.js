import User from '../models/User.js';
import DeveloperProfile from '../models/DeveloperProfile.js';
import ClientProfile from '../models/ClientProfile.js';
import { generateAccessToken, generateRefreshToken, setTokenCookies, clearTokenCookies, verifyRefreshToken } from '../utils/jwt.js';
import { generateVerificationToken, generatePasswordResetToken, hashToken } from '../utils/crypto.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { USER_ROLES } from '../constants/index.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return errorResponse(res, 'An account with this email already exists', 409);

  if (!Object.values(USER_ROLES).filter(r => r !== USER_ROLES.ADMIN).includes(role)) {
    return errorResponse(res, 'Invalid role', 400);
  }

  const { token, hashed, expires } = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: hashed,
    emailVerificationExpires: expires,
  });

  if (role === USER_ROLES.DEVELOPER) {
    await DeveloperProfile.create({ user: user._id });
  } else if (role === USER_ROLES.CLIENT) {
    await ClientProfile.create({ user: user._id });
  }

  sendVerificationEmail(user, token).catch(console.error);

  await createAuditLog({
    user: user._id, action: 'USER_REGISTERED',
    entity: 'User', entityId: user._id,
    ip: req.ip, userAgent: req.get('User-Agent'),
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  setTokenCookies(res, accessToken, refreshToken);

  return successResponse(res, { user: user.toPublicJSON(), accessToken }, 'Account created successfully', 201);
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return errorResponse(res, 'Invalid email or password', 401);
  if (user.isSuspended) return errorResponse(res, `Account suspended: ${user.suspensionReason || 'Policy violation'}`, 403);
  if (!user.isActive)   return errorResponse(res, 'Account is deactivated', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return errorResponse(res, 'Invalid email or password', 401);

  user.lastLogin  = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    user: user._id, action: 'USER_LOGIN',
    entity: 'User', entityId: user._id,
    ip: req.ip, userAgent: req.get('User-Agent'),
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  setTokenCookies(res, accessToken, refreshToken);

  return successResponse(res, { user: user.toPublicJSON(), accessToken }, 'Logged in successfully');
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookies(res);
  return successResponse(res, {}, 'Logged out successfully');
});

// GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = null;
  if (user.role === USER_ROLES.DEVELOPER) {
    profile = await DeveloperProfile.findOne({ user: user._id });
  } else if (user.role === USER_ROLES.CLIENT) {
    profile = await ClientProfile.findOne({ user: user._id });
  }
  return successResponse(res, { user: user.toPublicJSON(), profile });
});

// POST /api/v1/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return errorResponse(res, 'Verification token is required', 400);

  const hashed = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) return errorResponse(res, 'Invalid or expired verification token', 400);

  user.isEmailVerified        = true;
  user.emailVerificationToken  = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({ user: user._id, action: 'EMAIL_VERIFIED', entity: 'User', entityId: user._id, ip: req.ip });
  return successResponse(res, {}, 'Email verified successfully');
});

// POST /api/v1/auth/resend-verification
export const resendVerification = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.isEmailVerified) return errorResponse(res, 'Email is already verified', 400);

  const { token, hashed, expires } = generateVerificationToken();
  user.emailVerificationToken  = hashed;
  user.emailVerificationExpires = expires;
  await user.save({ validateBeforeSave: false });

  sendVerificationEmail(user, token).catch(console.error);
  return successResponse(res, {}, 'Verification email sent');
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Prevent email enumeration — always return success
  const user = await User.findOne({ email });
  if (user) {
    const { token, hashed, expires } = generatePasswordResetToken();
    user.passwordResetToken   = hashed;
    user.passwordResetExpires  = expires;
    await user.save({ validateBeforeSave: false });
    sendPasswordResetEmail(user, token).catch(console.error);
  }
  return successResponse(res, {}, 'If that email exists, a reset link has been sent');
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return errorResponse(res, 'Token and new password are required', 400);

  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) return errorResponse(res, 'Invalid or expired reset token', 400);

  user.password         = password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires  = undefined;
  await user.save();

  await createAuditLog({ user: user._id, action: 'PASSWORD_RESET', entity: 'User', entityId: user._id, ip: req.ip });
  clearTokenCookies(res);
  return successResponse(res, {}, 'Password reset successfully. Please log in.');
});

// POST /api/v1/auth/refresh
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return errorResponse(res, 'Refresh token required', 401);

  try {
    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.userId);
    if (!user || !user.isActive) return errorResponse(res, 'Invalid refresh token', 401);

    const accessToken  = generateAccessToken(user._id, user.role);
    const newRefresh   = generateRefreshToken(user._id);
    setTokenCookies(res, accessToken, newRefresh);
    return successResponse(res, { accessToken });
  } catch {
    return errorResponse(res, 'Invalid or expired refresh token', 401);
  }
});

// PATCH /api/v1/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user    = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return errorResponse(res, 'Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();

  await createAuditLog({ user: user._id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: user._id, ip: req.ip });
  return successResponse(res, {}, 'Password changed successfully');
});
