const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/token');

const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme === 'Bearer' && token) {
    return token;
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return next(new ApiError(401, 'Unauthorized: missing access token'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select('-password -refreshTokenHash');

    if (!user) {
      return next(new ApiError(401, 'Unauthorized: user does not exist'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Unauthorized: invalid or expired token'));
  }
};

module.exports = {
  protect
};
