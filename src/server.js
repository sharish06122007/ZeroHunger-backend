// server.js - ZeroHunger Backend Entry Point (Railway Production)

require("dotenv").config();

const http = require("http");
const app = require("./app");

const connectDB = require("./config/db");
const logger = require("./config/logger");

const { initSocket } = require("./config/socket");


const PORT = process.env.PORT || 3000;


// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Handle server errors (EADDRINUSE etc.)
server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} already in use.`);
        if (process.env.NODE_ENV !== 'production') {
            const altPort = Number(PORT) + 1;
            logger.warn(`Attempting to listen on alternate port ${altPort} (development retry)`);
            server.listen(altPort, '0.0.0.0');
            return;
        }
        process.exit(1);
    }
    logger.error('Server error:', err);
    process.exit(1);
});

// Start Server First (Railway Requirement)
server.listen(PORT, '0.0.0.0', async () => {
    const addr = server.address();
    const activePort = addr && addr.port ? addr.port : PORT;
    logger.info(`🚀 ZeroHunger API running on port ${activePort}`);
    logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Connect Database After Server Starts
    try {
        await connectDB();
        logger.info('✅ MongoDB connected successfully');
    } catch (error) {
        logger.error('❌ MongoDB connection failed:', error.message || error);
    }
});



// ===============================
// Unhandled Promise Errors
// ===============================

process.on(
    "unhandledRejection",
    (reason) => {

        logger.error(
            "Unhandled Promise Rejection:",
            reason
        );

    }
);




// ===============================
// Uncaught Errors
// ===============================

process.on(
    "uncaughtException",
    (error)=>{

        logger.error(
            "Uncaught Exception:",
            error
        );


        shutdown();

    }
);




// ===============================
// Graceful Shutdown
// ===============================

const shutdown = ()=>{


    logger.info(
        "Shutting down server..."
    );


    server.close(
        ()=>{


            logger.info(
                "HTTP server closed"
            );


            process.exit(0);

        }
    );


};




process.on(
    "SIGTERM",
    shutdown
);


process.on(
    "SIGINT",
    shutdown
);