import { Router } from "express";
import db from "../db.js";
import auth from "../auth.js";


const router = Router();
const Order = db.models.Order;
const Product = db.models.Product;

router.route("/orders")
    .all(auth.authenticate())
    
    // Pedidos do cliente
    .get(async (req, res) => {
        try {
            const orders = await Order.findAll({
                where: { customer_id: req.user.id },
                order: [['created_at', 'DESC']], 
                include: [{
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price', 'url'],
                    through: {  } 
                }]
            });

            res.json(orders);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });

router.route("/orders/:id")
    .all(auth.authenticate())

    // Pedido Específico 
    .get(async (req, res) => {
        try {
            const order = await Order.findOne({
                where: { 
                    id: req.params.id,
                    customer_id: req.user.id 
                },
                include: [{
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price', 'url', 'sold'],
                    through: {  }
                }]
            });

            if (!order) {
                return res.status(404).json({ msg: "Pedido não encontrado." });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });


export default router;