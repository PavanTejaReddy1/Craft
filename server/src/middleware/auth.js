import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authenticate request via JWT in cookie or Authorization header.
 * Attaches req.user on success.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    if (user.isSuspended) {
      return errorResponse(res, `Account suspended: ${user.suspensionReason || 'Policy violation'}`, 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please log in again', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid authentication token', 401);
    }
    return errorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Authorize specific roles.
 * Usage: authorize('admin', 'client')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
};

/**
 * Optional auth — attaches req.user if token present but does not block unauthenticated requests.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    }
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isActive && !user.isSuspended) {
      req.user = user;
    }
  } catch (_) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
