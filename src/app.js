// app.js - Express application configuration
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const { swaggerSpec } = require('./config/swagger');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'zerohunger_cookie_secret'));
app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));

// Global Rate Limiter
app.use(rateLimiter.global);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Route - Redirects to Swagger UI
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System & Database Health Endpoint
 *     description: Returns heartbeat, database connection status, and uptime.
 *     tags:
 *       - Health Check
 *     responses:
 *       200:
 *         description: System operational
 *         content:
 *           application/json:
 *             example:
 *               status: "ok"
 *               database: "connected"
 *               uptime: 1234
 *               timestamp: "2026-08-02T16:30:00.000Z"
 */
app.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
  res.json({
    success: true,
    message: 'ZeroHunger API is running',
    version: '2.0.0',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Swagger OpenAPI Specification UI & Specs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none } .swagger-ui { font-family: sans-serif }',
  customSiteTitle: 'ZeroHunger API Documentation',
}));

app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  const yamlString = YAML.stringify(swaggerSpec, 4);
  res.send(yamlString);
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, errors: [] });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
