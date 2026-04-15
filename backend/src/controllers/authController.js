const asyncHandler = require('../utils/asyncHandler');
const {
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser
} = require('../services/authService');

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/v1/auth/refresh'
});

const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await registerUser(req.body);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { accessToken, user }
  });
});

const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUser(req.body);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { accessToken, user }
  });
});

const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

  const { accessToken, refreshToken, user } = await refreshUserToken(incomingRefreshToken);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: { accessToken, user }
  });
});

const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);

  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout
};
