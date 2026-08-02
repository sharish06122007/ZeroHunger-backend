// server.js - ZeroHunger Backend Entry Point

require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');


/*
  Railway automatically provides PORT.
  Local development uses 3000.
*/
const PORT = process.env.PORT || 3000;



const startServer = async () => {

  try {

    // Connect MongoDB
    await connectDB();


    // Create HTTP server
    const server = http.createServer(app);



    // Start server
    server.listen(
      PORT,
      '0.0.0.0',
      () => {

        logger.info(
          `🚀 ZeroHunger API running on port ${PORT}`
        );

        logger.info(
          `📋 Environment: ${process.env.NODE_ENV || 'development'}`
        );

      }
    );



    // Handle unhandled promise errors
    process.on(
      'unhandledRejection',
      (reason) => {

        logger.error(
          'Unhandled Promise Rejection:',
          reason
        );

      }
    );



    // Handle uncaught errors
    process.on(
      'uncaughtException',
      (error) => {

        logger.error(
          'Uncaught Exception:',
          error
        );

        process.exit(1);

      }
    );



    // Railway shutdown handling
    process.on(
      'SIGTERM',
      () => {

        logger.info(
          'SIGTERM received. Shutting down gracefully...'
        );


        server.close(
          () => {

            logger.info(
              'HTTP server closed'
            );


            process.exit(0);

          }
        );

      }
    );



    // Handle manual shutdown
    process.on(
      'SIGINT',
      () => {

        logger.info(
          'SIGINT received. Shutting down...'
        );


        server.close(
          () => {

            process.exit(0);

          }
        );

      }
    );


  } catch(error) {


    logger.error(
      '❌ Server startup failed:',
      error
    );


    process.exit(1);

  }

};



startServer();