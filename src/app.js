// app.js - ZeroHunger Express Application Configuration

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const { swaggerSpec } = require("./config/swagger");

const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./config/logger");


// ===============================
// Routes
// ===============================

const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const requestRoutes = require("./routes/requests");
const dashboardRoutes = require("./routes/dashboard");
const volunteerRoutes = require("./routes/volunteer");
const notificationRoutes = require("./routes/notifications");
const searchRoutes = require("./routes/search");
const homeFoodRoutes = require("./routes/homeFood");
const chatRoutes = require("./routes/chat");



const app = express();



// ===============================
// Railway Configuration
// ===============================

app.set(
    "trust proxy",
    1
);




// ===============================
// Security Middleware
// ===============================

app.use(

    helmet({

        crossOriginResourcePolicy:{
            policy:"cross-origin"
        }

    })

);




// ===============================
// CORS
// ===============================


const allowedOrigins=[

    "http://localhost:4200",

    "http://localhost:3000",

    process.env.CLIENT_URL,

    "https://zerohunger.vercel.app"

].filter(Boolean);



app.use(

cors({

    origin:(origin,callback)=>{


        if(!origin){

            return callback(null,true);

        }



        if(

            allowedOrigins.includes(origin)

            ||

            /^https:\/\/.*\.vercel\.app$/i.test(origin)

            ||

            /^https:\/\/.*\.up\.railway\.app$/i.test(origin)

        ){

            return callback(null,true);

        }



        return callback(null,false);


    },


    credentials:true,


    methods:[

        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"

    ],


    allowedHeaders:[

        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With"

    ]


})

);



app.options(
    "*",
    cors()
);





// ===============================
// Body Parser
// ===============================


app.use(

express.json({

    limit:"10mb"

})

);



app.use(

express.urlencoded({

    extended:true,

    limit:"10mb"

})

);



app.use(

cookieParser(

    process.env.COOKIE_SECRET ||

    "zerohunger_cookie_secret"

)

);




// ===============================
// Performance
// ===============================


app.use(
    compression()
);



app.use(

morgan(

    "combined",

    {

        stream:logger.stream

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

"/uploads",

express.static(

path.join(

__dirname,

"../uploads"

)

)

);






// ===============================
// Root Route
// ===============================


app.get(

"/",

(req,res)=>{


res.status(200).json({

    success:true,

    service:"ZeroHunger API",

    message:"Backend is running successfully 🚀",

    version:"2.0.0",

    environment:
    process.env.NODE_ENV,

    docs:"/api-docs"


});


}

);






// ===============================
// Railway Health Check
// ===============================


app.get(

"/health",

(req,res)=>{


res.status(200).json({

    status:"OK",

    database:

    mongoose.connection.readyState===1

    ?

    "connected"

    :

    "disconnected",


    uptime:

    Math.floor(

        process.uptime()

    ),


    timestamp:

    new Date().toISOString()


});


}

);





app.get(

"/api/v1/health",

(req,res)=>{


res.json({

    success:true,

    message:"ZeroHunger API Running",

    version:"2.0.0",

    database:

    mongoose.connection.readyState===1

    ?

    "connected"

    :

    "disconnected"


});


}

);







// ===============================
// Swagger
// ===============================


app.use(

"/api-docs",

swaggerUi.serve,

swaggerUi.setup(

swaggerSpec,

{

customSiteTitle:
"ZeroHunger API Documentation"

}

)

);





app.get(

"/openapi.json",

(req,res)=>{


res.json(swaggerSpec);


}

);





app.get(

"/openapi.yaml",

(req,res)=>{


res.type("text/yaml");

res.send(

YAML.stringify(

swaggerSpec,

4

)

);


}

);








// ===============================
// API Routes
// ===============================


app.use(

"/api/v1/auth",

authRoutes

);


app.use(

"/api/v1/food",

foodRoutes

);



app.use(

"/api/v1/requests",

requestRoutes

);



app.use(

"/api/v1/dashboard",

dashboardRoutes

);



app.use(

"/api/v1/volunteer",

volunteerRoutes

);



app.use(

"/api/v1/notifications",

notificationRoutes

);



app.use(

"/api/v1/search",

searchRoutes

);



app.use(

"/api/v1/home-food",

homeFoodRoutes

);



app.use(

"/api/v1/chat",

chatRoutes

);






// ===============================
// 404 Handler
// ===============================


app.use(

(req,res)=>{


res.status(404).json({

    success:false,

    message:
    `Route ${req.originalUrl} not found`

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