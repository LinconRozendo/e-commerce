import "dotenv/config";
import logger from "./logger.js";

const env = process.env.NODE_ENV || "development";

const commonConfig = {
    jwtSecret: process.env.JWT_SECRET,
    jwtSession: { session: false }
};

const configs = {
    test: {
        database: process.env.DB_NAME_TEST,
        username: process.env.DB_USER_TEST,
        password: process.env.DB_PASS_TEST,
        params: {
            dialect: "postgres",
            host: process.env.DB_HOST_TEST,
            port: process.env.DB_PORT_TEST,
            logging: false,
            define: {
                underscored: true,
            },
        },
    },
    development: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        params: {
            dialect: "postgres",
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            logging: (sql) => {
                logger.info(`[Database] ${sql}`);
            },
            define: {
                underscored: true,
            },
        },
    },
};


export default {
    ...commonConfig,
    ...configs[env]
};