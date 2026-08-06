// src/app.js - ZeroHunger Express Application
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const YAML = require('yamljs');

const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const logger = require('./config/logger');
const { corsOptions, originValidator } = require('./config/cors');

const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');
const volunteerRoutes = require('./routes/volunteer');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const homeFoodRoutes = require('./routes/homeFood');
const chatRoutes = require('./routes/chat');

const app = express();

// Trust proxy (useful on Railway / proxy hosts)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Log origin and CORS decision
app.use((req, res, next) => {
  const origin = req.headers.origin || 'no-origin';
  originValidator(origin, (err, allowed) => {
    const decision = allowed ? 'allowed' : 'blocked';
    logger.debug(`CORS origin: ${origin} -> ${decision}`);
    next();
  });
});

// CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'zerohunger_cookie_secret'));

// Performance & logging
app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use(rateLimiter.global);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'ZeroHunger API',
    message: 'Backend is running successfully 🚀',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    docs: '/api-docs',
  });
});

// Health
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'ZeroHunger API Running', version: '2.0.0', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'ZeroHunger API Documentation' }));
app.get('/openapi.json', (req, res) => res.json(swaggerSpec));
app.get('/openapi.yaml', (req, res) => { res.type('text/yaml'); res.send(YAML.stringify(swaggerSpec, 4)); });

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/volunteer', volunteerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/home-food', homeFoodRoutes);
app.use('/api/v1/chat', chatRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

module.exports = app;
