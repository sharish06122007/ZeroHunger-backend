// app.js - ZeroHunger Express Application Configuration

require("dotenv").config();

const path = require("path");
const express = require("express");

// ===============================
// CORS Configuration
// ===============================


const allowedOrigins = [

    "http://localhost:4200",

    "http://localhost:3000",

    "https://zerohunger-frontend-production.up.railway.app",

    "https://zerohunger.vercel.app",

    process.env.CLIENT_URL

].filter(Boolean);



const corsOptions = {

    origin: function(origin, callback){


        // Allow Postman / Mobile Apps / Server Requests
        if(!origin){

            return callback(null,true);

        }



        const allowed =

            allowedOrigins.includes(origin)

            ||

            /^https:\/\/.*\.vercel\.app$/i.test(origin)

            ||

            /^https:\/\/.*\.up\.railway\.app$/i.test(origin);



        if(allowed){

            return callback(null,true);

        }



        console.log(
            "Blocked CORS:",
            origin
        );


        return callback(
            new Error("CORS blocked")
        );


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

        "Origin",

        "X-Requested-With",

        "x-auth-token"

    ],


    exposedHeaders:[

        "Set-Cookie"

    ]

};




app.use(
    cors(corsOptions)
);



app.options(
    "*",
    cors(corsOptions)
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