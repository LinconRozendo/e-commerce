import "dotenv/config"
import express from "express";
import middlewares from "./libs/middleware.js";
import boot from "./libs/boot.js";
import db from "./db.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRoutes from "./routes/index.js";
import cartRoutes from "./routes/cart.js";
import favoriteRoutes from "./routes/favorite.js";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
import tokenRoutes from "./routes/token.js";
import userRoutes from "./routes/user.js";
import dashboardRoutes from "./routes/dashboard.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocs = JSON.parse(fs.readFileSync(path.join(__dirname, './swagger.json')));


const app = express()

app.db = db;

middlewares(app);

// rotas
app.use("/", indexRoutes);
app.use("/", cartRoutes);
app.use("/", favoriteRoutes);
app.use("/", orderRoutes);
app.use("/", productRoutes);
app.use("/", tokenRoutes);
app.use("/", userRoutes);
app.use("/", dashboardRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


if (process.env.NODE_ENV !== "test") {
    boot(app);
}


export default app;

