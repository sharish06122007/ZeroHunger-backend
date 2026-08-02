// utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generate access and refresh JWT tokens.
 * @param {object} payload Payload to embed (usually user id & role)
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

module.exports = { generateTokens };
