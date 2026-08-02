// server.js - entry point

require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');


const PORT = process.env.PORT || 3000;


const startServer = async () => {

  try {

    // Connect Database
    await connectDB();


    // Create HTTP Server
    const server = http.createServer(app);


    // Listen on Railway port
    server.listen(PORT, '0.0.0.0', () => {

      logger.info(
        `🚀 ZeroHunger API running on port ${PORT}`
      );

      logger.info(
        `📋 Environment: ${process.env.NODE_ENV || 'development'}`
      );

    });


    // Handle unhandled promise errors
    process.on(
      'unhandledRejection',
      (reason) => {

        logger.error(
          'Unhandled Rejection:',
          reason
        );

      }
    );


    // Graceful shutdown
    process.on(
      'SIGTERM',
      () => {

        logger.info(
          'SIGTERM received — shutting down gracefully'
        );


        server.close(() => {

          logger.info(
            'HTTP server closed'
          );


          process.exit(0);

        });

      }
    );


  } catch(error){

    logger.error(
      'Server startup failed:',
      error
    );

    process.exit(1);

  }

};


startServer();