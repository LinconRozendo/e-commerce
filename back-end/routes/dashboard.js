import { Router } from "express";
import db from "../db.js";
import auth from "../auth.js";

const router = Router();
const Product = db.models.Product;
const { Op } = db.Sequelize;

router.route("/dashboard")
    .all(auth.authenticate())

    .get(async (req, res) => {
        try {
            const userId = req.user.id;

            const totalProducts = await Product.count({
                where: { seller_id: userId }
            });

            const totalSold = await Product.count({
                where: { seller_id: userId, sold: true }
            });

            const totalRevenue = await Product.sum('price', {
                where: { seller_id: userId, sold: true }
            });

            const bestSeller = await Product.findOne({
                attributes: [
                    'name',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('name')), 'salesCount']
                ],
                where: {
                    seller_id: userId,
                    sold: true
                },
                group: ['name'],
                order: [[db.Sequelize.literal('"salesCount"'), 'DESC']],
                limit: 1,
                raw: true
            });

            res.json({
                total_products: totalProducts,
                total_sold: totalSold,
                total_revenue: totalRevenue || 0, // Se for null (nenhuma venda) e retorna 0
                best_selling_product: bestSeller ? bestSeller.name : "Nenhum"
            });

        } catch (error) {
            console.error("Erro no dashboard:", error);
            res.status(500).json({ msg: "Erro ao carregar dashboard." });
        }
    });

export default router;