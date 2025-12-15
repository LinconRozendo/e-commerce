import { Router } from "express";
import db from "../db.js";
import auth from "../auth.js";


const router = Router();
const Product = db.models.Product;
const User = db.models.User;

router.route("/favorites")
    .all(auth.authenticate())
    
    // Lista todos os favoritos do usuário
    .get(async (req, res) => {
        try {

            const user = await User.findByPk(req.user.id);

            // O método getFavorites() existe porque definimos "as: 'favorites'" no model
            const favorites = await user.getFavorites({
                attributes: ["id", "name", "price", "url", "sold"],
                joinTableAttributes: [] // Remove dados da tabela de ligação (UserFavorites) para limpar o JSON
            });

            res.json(favorites);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });

router.route("/favorites/:id")
    .all(auth.authenticate())

    // Adiciona o produto aos favoritos
    .post(async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).json({ msg: "Produto não encontrado." });
            }

            const user = await User.findByPk(req.user.id);
            
            // Método mágico do Sequelize (add + Nome do Alias no Singular[Favorite])
            // Se já existir, ele ignora (não duplica)
            await user.addFavorite(product);

            res.status(201).json({ msg: "Produto adicionado aos favoritos." });

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    })


    .delete(async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).json({ msg: "Produto não encontrado." });
            }

            const user = await User.findByPk(req.user.id);

            // Método mágico para remover [Favorite]
            await user.removeFavorite(product);

            res.sendStatus(204); 
            
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });

export default router;