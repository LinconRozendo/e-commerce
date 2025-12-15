import express from "express";
import auth from "../auth.js";
import cors from "cors";
import morgan from "morgan";
import logger from "./logger.js";
import compression from "compression";
import helmet from "helmet";


export default app => {
    app.set("port", 3000);
    app.set("json spaces", 4);
    app.use(morgan("common", {
        stream: {
            write: (message) => {
                logger.info(message.trim());
            }
        }
    }));
    app.use(helmet());
    app.use(cors({
        origin: ["http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }));
    app.use(compression());
    app.use(express.json());
    app.use(auth.initialize());
    app.use((req, res, next) => {
        if (req.body?.id) {
            delete req.body.id;
        }
        next();
    });
};