// utils/generateToken.js
const jwt = require('jsonwebtoken');

function generateTokens(payload) {
  const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'superrefreshsecretkey123';
  
  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

module.exports = { generateTokens };
