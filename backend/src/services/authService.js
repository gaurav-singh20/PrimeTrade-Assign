const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const {
  compareTokenHash,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../utils/token');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const generateAuthPayload = async (user) => {
  const tokenPayload = {
    sub: user._id.toString(),
    role: user.role
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);
  const refreshTokenHash = await hashToken(refreshToken);

  await User.findByIdAndUpdate(user._id, { refreshTokenHash });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
};

const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const user = await User.create({ name, email, password, role: 'user' });
  return generateAuthPayload(user);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return generateAuthPayload(user);
};

const refreshUserToken = async (incomingRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user) {
    throw new ApiError(401, 'User not found for refresh token');
  }

  const isValid = await compareTokenHash(incomingRefreshToken, user.refreshTokenHash);
  if (!isValid) {
    throw new ApiError(401, 'Refresh token is revoked or mismatched');
  }

  const authPayload = await generateAuthPayload(user);
  return authPayload;
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  sanitizeUser
};
