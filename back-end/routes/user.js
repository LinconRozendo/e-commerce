import { Router } from "express";
import db from "../db.js";
import auth from "../auth.js";


const router = Router();
const User = db.models.User;


router.route("/user")
    .all(auth.authenticate()) 
    

    .get(async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ["id", "name", "email", "role", "is_active"]
            });
            res.json(user);
        } catch (error) {
            res.status(412).json({ msg: error.message });
        }
    })


    .delete(async (req, res) => {
        try {
            
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.sendStatus(404);
            } 

            if (user.role === 'customer') {
                // Se for cliente exclui deixando o histórico de compras (via paranoid: true)
                await user.destroy();
                res.sendStatus(204); 
            } else {
                // Se for vendedor apenas desativa o user
                await user.update({ is_active: false });
                res.status(200).json({ msg: "Conta de vendedor desativada." });
            }
        } catch (error) {
            res.status(412).json({ msg: error.message });
        }
    });


router.post("/users", async (req, res) => {
    try {

        if (!["customer", "seller"].includes(req.body.role)) {
            return res.status(400).json({ msg: "Role inválido. Use 'customer' ou 'seller'." });
        }

        const user = await User.create(req.body);
        res.status(201).json({ 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(412).json({ msg: error.message });
    }
});

export default router;