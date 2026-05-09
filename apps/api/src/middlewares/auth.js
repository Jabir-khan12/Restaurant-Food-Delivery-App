
import jwt from 'jsonwebtoken';

import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { User } from '../modules/auth/user.model.js';

// Extend Express Request

/**
 * Verifies JWT access token from Authorization header.
 * Attaches user info to req.user.
 */
export async function authenticate(
  req,
  _res,
  next,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token is missing');
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check token version (instant invalidation on password change)
    const user = await User.findById(payload.userId).select('tokenVersion status').lean();

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError('Account is not active');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedError('Token has been invalidated');
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
    } else {
      next(error);
    }
  }
}

/**
 * Requires the user to have one of the specified roles.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

/**
 * Requires the user's account to be active.
 * Use after authenticate middleware.
 */
export function requireActive(req, _res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  // Account status is already checked in authenticate
  next();
}
