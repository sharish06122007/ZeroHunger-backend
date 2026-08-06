// config/cors.js - Centralized CORS config for Express and Socket.IO
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  'https://zerohunger.vercel.app',
].filter(Boolean);

const isRailway = (origin) => /^https?:\/\/(?:.*\.)?railway\.app$/i.test(origin);
const isVercel = (origin) => /^https:\/\/.*\.vercel\.app$/i.test(origin);

const originValidator = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin) || isRailway(origin) || isVercel(origin)) return callback(null, true);
  return callback(new Error('Not allowed by CORS'), false);
};

const corsOptions = {
  origin: originValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-auth-token', 'Origin'],
};

module.exports = { allowedOrigins, corsOptions, originValidator, cors };
