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


// Start Server First (Railway Requirement)
server.listen(PORT, "0.0.0.0", async () => {

    logger.info(
        `🚀 ZeroHunger API running on port ${PORT}`
    );


    logger.info(
        `📋 Environment: ${process.env.NODE_ENV || "development"}`
    );


    // Connect Database After Server Starts
    try {

        await connectDB();

        logger.info(
            "✅ MongoDB connected successfully"
        );


    } catch(error) {

        logger.error(
            "❌ MongoDB connection failed:",
            error.message
        );

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