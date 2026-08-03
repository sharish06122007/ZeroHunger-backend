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


// Routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');


const app = express();


// Railway reverse proxy support
app.set('trust proxy', 1);


// ===============================
// Security Middleware
// ===============================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);


// ===============================
// CORS Configuration
// ===============================

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  'https://localhost:4200',
  'https://zerohunger.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.includes(origin)
      || /^https:\/\/.*\.vercel\.app$/i.test(origin)
      || /^https:\/\/.*\.up\.railway\.app$/i.test(origin)
      || /^https:\/\/.*\.netlify\.app$/i.test(origin)
      || /^http:\/\/localhost(:\d+)?$/i.test(origin)
      || /^https:\/\/localhost(:\d+)?$/i.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


// ===============================
// Body Parsing
// ===============================

app.use(
  express.json({
    limit: '10mb'
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);


app.use(
  cookieParser(
    process.env.COOKIE_SECRET || 'zerohunger_cookie_secret'
  )
);


// ===============================
// Performance & Logging
// ===============================

app.use(compression());


app.use(
  morgan(
    'combined',
    {
      stream: logger.stream
    }
  )
);


// ===============================
// Rate Limiting
// ===============================

app.use(
  rateLimiter.global
);


// ===============================
// Static Files
// ===============================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);



// ===============================
// Root Route
// ===============================

app.get('/', (req,res)=>{

  res.json({
    success:true,
    name:"ZeroHunger API",
    message:"Backend is running successfully 🚀",
    version:"2.0.0",
    documentation:"/api-docs"
  });

});



// ===============================
// Health Check
// ===============================

app.get('/health',(req,res)=>{

  const databaseStatus =
    mongoose.connection &&
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";


  res.status(200).json({

    status:"ok",

    database:databaseStatus,

    uptime:Math.floor(
      process.uptime()
    ),

    timestamp:
      new Date().toISOString()

  });

});



// API Health

app.get('/api/v1/health',(req,res)=>{


  const databaseStatus =
    mongoose.connection &&
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";


  res.json({

    success:true,

    message:
      "ZeroHunger API is running",

    version:"2.0.0",

    database:
      databaseStatus,

    timestamp:
      new Date().toISOString()

  });


});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    timestamp: new Date().toISOString(),
  });
});



// ===============================
// Swagger Documentation
// ===============================


app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerSpec,
    {
      customCss:
      `
      .swagger-ui .topbar {
        display:none
      }

      .swagger-ui {
        font-family:sans-serif
      }
      `,

      customSiteTitle:
      "ZeroHunger API Documentation"

    }
  )
);



app.get('/openapi.json',(req,res)=>{

  res.setHeader(
    'Content-Type',
    'application/json'
  );

  res.send(
    swaggerSpec
  );

});



app.get('/openapi.yaml',(req,res)=>{

  res.setHeader(
    'Content-Type',
    'text/yaml'
  );


  res.send(
    YAML.stringify(
      swaggerSpec,
      4
    )
  );

});



// ===============================
// API Routes
// ===============================


app.use(
  '/api/v1/auth',
  authRoutes
);


app.use(
  '/api/v1/food',
  foodRoutes
);


app.use(
  '/api/v1/requests',
  requestRoutes
);


app.use(
  '/api/v1/dashboard',
  dashboardRoutes
);



// ===============================
// 404 Handler
// ===============================


app.use(
  (req,res)=>{

    res.status(404).json({

      success:false,

      message:
      `Route ${req.originalUrl} not found`,

      errors:[]

    });

  }
);



// ===============================
// Global Error Handler
// ===============================


app.use(
  errorHandler
);



module.exports = app;