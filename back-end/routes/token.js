import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";
import config from "../libs/config.js";


const router = Router();
const User = db.models.User;

router.post("/token", async (req, res) => {
    try {
        if (req.body.email && req.body.password) {
            const email = req.body.email;
            const password = req.body.password;
            const user = await User.findOne({ where: {email: email} });

            if (user) {
                
                if (user.isPassword(user.password, password)) {
                    const payload = { id: user.id };

                    const token = jwt.sign(payload, config.jwtSecret, {
                        expiresIn: "1h"
                    });

                    return res.json({ token: token });
                }
            }
        }

        return res.sendStatus(401);

    } catch (error) {
        res.sendStatus(401);
    }
});


export default router;