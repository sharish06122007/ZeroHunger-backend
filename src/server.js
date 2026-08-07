// ======================================================
// ZeroHunger Backend Server
// Railway Production Entry Point
// ======================================================


require("dotenv").config();


const http = require("http");

const app = require("./app");

const connectDB = require("./config/db");

const logger = require("./config/logger");

const { initSocket } = require("./config/socket");




// Railway provides PORT automatically

const PORT = process.env.PORT || 3000;



// Create HTTP Server

const server = http.createServer(app);




// Initialize Socket.IO

initSocket(server);





// ======================================================
// Start Server
// ======================================================


server.listen(
    PORT,
    "0.0.0.0",
    async () => {


        logger.info(
            `🚀 ZeroHunger API running on port ${PORT}`
        );
        console.log("Server Started");


        logger.info(
            `📋 Environment: ${process.env.NODE_ENV || "production"}`
        );



        // Connect Database after server starts

        try {


            await connectDB();


            logger.info(
                "✅ MongoDB connected successfully"
            );
            console.log("MongoDB Connected");


        } catch(error){


            logger.error(
                "❌ MongoDB connection failed:",
                error.message
            );


            // Do not stop server
            // Railway health check can still pass

        }


    }
);






// ======================================================
// Server Error Handler
// ======================================================


server.on(
    "error",
    (error)=>{


        logger.error(
            "Server Error:",
            error
        );


        process.exit(1);


    }
);






// ======================================================
// Unhandled Errors
// ======================================================


process.on(
    "unhandledRejection",
    (reason)=>{


        logger.error(
            "Unhandled Promise Rejection:",
            reason
        );


    }
);





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







// ======================================================
// Graceful Shutdown
// ======================================================


function shutdown(){


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


}






process.on(
    "SIGTERM",
    shutdown
);


process.on(
    "SIGINT",
    shutdown
);