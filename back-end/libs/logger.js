import winston from "winston";
import fs from "fs";
import path, { format } from "path";

// Verifica e cria a pasta logs caso não exista  
if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}

const logger = winston.createLogger({
    
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        // Salva o que foi gerado no arquivo logs/app.log
        new winston.transports.File({
            filename: path.join("logs", "app.log"),
            maxSize: 1048576,
            maxFiles: 10,
        }),
        // Mostra no console o que foi gerado
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ],
});


export default logger;


