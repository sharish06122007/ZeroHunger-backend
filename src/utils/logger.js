const fs = require("fs");
const path = require("path");
const winston = require("winston");


const logDirectory = path.join(
    __dirname,
    "../logs"
);


// Create logs folder if missing

if(!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory);
}



const logger = winston.createLogger({

    level:"info",

    format:winston.format.combine(

        winston.format.timestamp(),

        winston.format.json()

    ),


    transports:[

        new winston.transports.File({

            filename:path.join(
                logDirectory,
                "error.log"
            ),

            level:"error"

        }),


        new winston.transports.File({

            filename:path.join(
                logDirectory,
                "combined.log"
            )

        })

    ]

});




// Console logging in development

if(process.env.NODE_ENV !== "production"){

    logger.add(

        new winston.transports.Console({

            format:winston.format.simple()

        })

    );

}



// For morgan

logger.stream = {

    write:(message)=>{

        logger.info(
            message.trim()
        );

    }

};



module.exports = logger;