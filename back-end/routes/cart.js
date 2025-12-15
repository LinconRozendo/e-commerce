import { Router } from "express";
import db from "../db.js";
import auth from "../auth.js";

const router = Router();
const Cart = db.models.Cart;
const CartItem = db.models.CartItem;
const Product = db.models.Product;
const Order = db.models.Order;;

// Middleware auxiliar para buscar (ou criar) o carrinho do usuário logado
const getMyCart = async (userId) => {
    const [cart] = await Cart.findOrCreate({
        where: { customer_id: userId, status: 'active' },
        defaults: { customer_id: userId, status: 'active' }
    });
    return cart;
};

router.route("/cart")
    .all(auth.authenticate())

    
    .get(async (req, res) => {
        try {
            const cart = await Cart.findOne({
                where: { customer_id: req.user.id, status: 'active' },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [{ 
                            model: Product, 
                            attributes: ['id', 'name', 'price', 'url', 'sold'] 
                        }]
                    }
                ]
            });

            if (!cart) {
                return res.json({ items: [], total: 0 });
            }

            // Calcula o total somando os preços
            const total = cart.items.reduce((acc, item) => {
                return acc + (parseFloat(item.Product.price) * item.quantity);
            }, 0);

            res.json({
                id: cart.id,
                items: cart.items,
                total: parseFloat(total.toFixed(2))
            });

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    })

    // Adiciona item ao carrinho ---
    .post(async (req, res) => {
        try {
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({ msg: "Informe o productId." });
            };
            
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).json({ msg: "Produto não encontrado." });
            };
            
            if (product.sold) {
                return res.status(400).json({ msg: "Este produto já foi vendido." });
            }
            
            // Impedi que o vendedor compre o próprio produto
            if (product.seller_id === req.user.id) {
                return res.status(400).json({ msg: "Você não pode comprar seu próprio produto." });
            }

            // Pega o carrinho
            const cart = await getMyCart(req.user.id);


            const [item, created] = await CartItem.findOrCreate({
                where: { cart_id: cart.id, product_id: productId },
                defaults: { 
                    cart_id: cart.id, 
                    product_id: productId, 
                    quantity: 1,
                    price: product.price 
                }
            });

            if (!created) {
                return res.status(400).json({ msg: "Este produto já está no seu carrinho." });
            }

            res.status(201).json(item);

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });


router.route("/cart/:productId")
    .all(auth.authenticate()) 

    .delete(async (req, res) => {

        try {
            const cart = await Cart.findOne({ where: { customer_id: req.user.id, status: 'active' } });
            
            if (!cart) {
                return res.sendStatus(404);
            }

            const result = await CartItem.destroy({
                where: { 
                    cart_id: cart.id, 
                    product_id: req.params.productId 
                }
            });

            if (result) {
                res.sendStatus(204);
            } else {
                res.status(404).json({ msg: "Item não encontrado no carrinho." });
            }
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });


router.route("/cart/checkout")
    .all(auth.authenticate()) 


    .post(async (req, res) => {
        try {
            // Busca carrinho com produtos
            const cart = await Cart.findOne({
                where: { customer_id: req.user.id, status: 'active' },
                include: [{ model: CartItem, as: 'items', include: [Product] }]
            });

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ msg: "Carrinho vazio." });
            }

            // Caso alguém compre enquanto outro usuário deseja
            const soldItems = cart.items.filter(item => item.Product.sold === true);
            if (soldItems.length > 0) {
                // Remove os itens vendidos do carrinho automaticamente e avisa
                await CartItem.destroy({ where: { id: soldItems.map(i => i.id) } });
                return res.status(409).json({ 
                    msg: "Alguns itens do seu carrinho foram vendidos por outra pessoa e removidos.",
                    removed_items: soldItems.map(i => i.Product.name)
                });
            }

            const totalAmount = cart.items.reduce((acc, item) => acc + parseFloat(item.Product.price), 0);

            // Cria o Pedido
            const order = await Order.create({
                customer_id: req.user.id,
                total_amount: totalAmount,
                status: 'completed'
            });

            // Atualiza o(s) produto(s) (marcar como vendido(s)) e associa ao Pedido
            for (const item of cart.items) {
                await item.Product.update({ 
                    sold: true, 
                    customer_id: req.user.id 
                });
                
                await order.addProduct(item.Product, { 
                    through: { 
                        price: item.Product.price, 
                        quantity: 1 
                    } 
                });
            }

            await CartItem.destroy({ where: { cart_id: cart.id } });

            res.json({ 
                msg: "Compra realizada com sucesso!", 
                order_id: order.id,
                total: totalAmount
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Erro ao processar compra.", error: error.message });
        }
    });

export default router;