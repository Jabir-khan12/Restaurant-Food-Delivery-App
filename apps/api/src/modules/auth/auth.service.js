import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import crypto from 'crypto';
import ms from 'ms';

import { User } from './user.model.js';
import { Session } from './session.model.js';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors.js';
import { logger } from '../../infra/logger.js';

// ─── Token Helpers ────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

async function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function registerUser(
  input,
  ip,
  userAgent,
) {
  // Check existing
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  if (input.phone) {
    const existingPhone = await User.findOne({ phone: input.phone }).lean();
    if (existingPhone) {
      throw new ConflictError('A user with this phone number already exists');
    }
  }

  // Hash password
  const passwordHash = await argon2.hash(input.password);

  // Create email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: input.role || 'customer',
    status: 'pending_verification',
    emailVerificationToken: await hashToken(emailVerificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // Generate tokens
  const tokens = await createSession(user, ip, userAgent);

  logger.info({ userId: user._id, role: user.role }, 'User registered');

  return { user, tokens };
}

export async function loginUser(
  input,
  ip,
  userAgent,
) {
  // Find user with password
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.status === 'suspended') {
    throw new UnauthorizedError('Your account has been suspended');
  }

  if (user.status === 'deleted') {
    throw new UnauthorizedError('Account not found');
  }

  // Verify password
  const isValid = await argon2.verify(user.passwordHash, input.password);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create session
  const tokens = await createSession(user, ip, userAgent);

  logger.info({ userId: user._id }, 'User logged in');

  return { user, tokens };
}

export async function refreshTokens(
  refreshToken,
  ip,
  userAgent,
) {
  const hashedToken = await hashToken(refreshToken);

  // Find session
  const session = await Session.findOne({
    hashedRefreshToken: hashedToken,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    // Possible reuse attack — if token was already rotated, revoke all sessions
    const revokedSession = await Session.findOne({ hashedRefreshToken: hashedToken });
    if (revokedSession) {
      logger.warn({ userId: revokedSession.userId }, 'Refresh token reuse detected — revoking all sessions');
      await Session.updateMany(
        { userId: revokedSession.userId },
        { revokedAt: new Date() },
      );
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Get user
  const user = await User.findById(session.userId);
  if (!user || user.status !== 'active') {
    await Session.updateOne({ _id: session._id }, { revokedAt: new Date() });
    throw new UnauthorizedError('User not found or inactive');
  }

  // Revoke old session
  session.revokedAt = new Date();
  await session.save();

  // Create new session (token rotation)
  const tokens = await createSession(user, ip, userAgent);

  return tokens;
}

export async function logoutUser(refreshToken) {
  const hashedToken = await hashToken(refreshToken);
  await Session.updateOne(
    { hashedRefreshToken: hashedToken },
    { revokedAt: new Date() },
  );
}

export async function logoutAllSessions(userId) {
  await Session.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() },
  );
  // Increment token version to invalidate all access tokens
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
  logger.info({ userId }, 'All sessions revoked');
}

export async function verifyEmail(token) {
  const hashedToken = await hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  user.emailVerified = true;
  user.status = 'active';
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.info({ userId: user._id }, 'Email verified');
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return 'If your email is registered, you will receive a reset link';
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = await hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // TODO: Send email with resetToken (not the hash)
  logger.info({ userId: user._id }, 'Password reset token generated');

  return resetToken; // In production, this is sent via email, not returned
}

export async function resetPassword(token, newPassword) {
  const hashedToken = await hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  user.passwordHash = await argon2.hash(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1; // Invalidate all existing tokens
  await user.save();

  // Revoke all sessions
  await Session.updateMany({ userId: user._id }, { revokedAt: new Date() });

  logger.info({ userId: user._id }, 'Password reset successful');
}

export async function changePassword(
  userId,
  currentPassword,
  newPassword,
) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isValid = await argon2.verify(user.passwordHash, currentPassword);
  if (!isValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  user.passwordHash = await argon2.hash(newPassword);
  user.tokenVersion += 1;
  await user.save();

  // Revoke all sessions except current (caller should re-auth)
  await Session.updateMany({ userId: user._id }, { revokedAt: new Date() });

  logger.info({ userId: user._id }, 'Password changed');
}

export async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

export async function updateProfile(
  userId,
  data,
) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (data.phone && data.phone !== user.phone) {
    const existing = await User.findOne({ phone: data.phone, _id: { $ne: userId } });
    if (existing) {
      throw new ConflictError('Phone number already in use');
    }
  }

  if (data.name) user.name = data.name;
  if (data.phone) user.phone = data.phone;
  if (data.avatar) user.avatar = data.avatar;

  await user.save();
  return user;
}

export async function getActiveSessions(userId) {
  return Session.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select('device ip userAgent createdAt expiresAt')
    .sort({ createdAt: -1 })
    .lean();
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

async function createSession(
  user,
  ip,
  userAgent,
) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = await hashToken(refreshToken);

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  const expiresAt = new Date(Date.now() + ms(expiresIn));

  await Session.create({
    userId: user._id,
    hashedRefreshToken,
    device: userAgent ? parseDevice(userAgent) : undefined,
    ip,
    userAgent,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

function parseDevice(userAgent) {
  // Simplified device detection
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}
