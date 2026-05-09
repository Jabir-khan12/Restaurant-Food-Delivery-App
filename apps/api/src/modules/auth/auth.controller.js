
import * as authService from './auth.service.js';
// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(
  req,
  res,
  next,
) {
  try {
    const { user, tokens } = await authService.registerUser(
      req.body,
      req.ip,
      req.headers['user-agent'],
    );

    // Set refresh token cookie
    setRefreshCookie(res, tokens.refreshToken);

    res.status(201).json({
      success: true,
      data: { user, tokens: { accessToken: tokens.accessToken } },
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    next(error);
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  req,
  res,
  next,
) {
  try {
    const { user, tokens } = await authService.loginUser(
      req.body,
      req.ip,
      req.headers['user-agent'],
    );

    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      data: { user, tokens: { accessToken: tokens.accessToken } },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refresh(
  req,
  res,
  next,
) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token is required' },
      });
      return;
    }

    const tokens = await authService.refreshTokens(
      refreshToken,
      req.ip,
      req.headers['user-agent'],
    );

    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(
  req,
  res,
  next,
) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

// ─── Logout All Sessions ──────────────────────────────────────────────────────

export async function logoutAll(
  req,
  res,
  next,
) {
  try {
    await authService.logoutAllSessions(req.user.userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'All sessions revoked' });
  } catch (error) {
    next(error);
  }
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(
  req,
  res,
  next,
) {
  try {
    await authService.verifyEmail(req.params.token);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPassword(
  req,
  res,
  next,
) {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If your email is registered, you will receive a reset link',
    });
  } catch (error) {
    next(error);
  }
}

// ─── Reset Password ──────────────────────────────────────────────────────────

export async function resetPassword(
  req,
  res,
  next,
) {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

// ─── Change Password ─────────────────────────────────────────────────────────

export async function changePassword(
  req,
  res,
  next,
) {
  try {
    await authService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Password changed. Please login again.' });
  } catch (error) {
    next(error);
  }
}

// ─── Get Profile ──────────────────────────────────────────────────────────────

export async function getProfile(
  req,
  res,
  next,
) {
  try {
    const user = await authService.getProfile(req.user.userId);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(
  req,
  res,
  next,
) {
  try {
    const user = await authService.updateProfile(req.user.userId, req.body);
    res.json({ success: true, data: { user }, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
}

// ─── Get Active Sessions ──────────────────────────────────────────────────────

export async function getActiveSessions(
  req,
  res,
  next,
) {
  try {
    const sessions = await authService.getActiveSessions(req.user.userId);
    res.json({ success: true, data: { sessions } });
  } catch (error) {
    next(error);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/v1/auth',
  });
}
