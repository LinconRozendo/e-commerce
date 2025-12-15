import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.js";
import config from "../../libs/config.js";
import db from "../../db.js";

const User = db.models.User;
const Product = db.models.Product;
const Cart = db.models.Cart;
const CartItem = db.models.CartItem;
const Order = db.models.Order;

describe("Routes: Cart e CartItems", () => {
    let tokencustomer;
    let tokenSeller;
    let product;
    let customerUser;

    beforeAll(async () => {
        await app.db.sequelize.sync();
    });

    afterAll(async () => {
        await app.db.sequelize.close();
    });

    beforeEach(async () => {
        
        await CartItem.destroy({ where: {}, truncate: true, cascade: true });
        await Cart.destroy({ where: {}, truncate: true, cascade: true });
        await Order.destroy({ where: {}, truncate: true, cascade: true });
        await Product.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
        await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true, force: true });


        customerUser = await User.create({
            name: "Customer",
            email: "customer@test.com",
            password: "12345",
            role: "customer"
        });
        tokencustomer = jwt.sign({ id: customerUser.id }, config.jwtSecret);

        const sellerUser = await User.create({
            name: "Seller",
            email: "seller@test.com",
            password: "12345",
            role: "seller"
        });
        tokenSeller = jwt.sign({ id: sellerUser.id }, config.jwtSecret);

        
        product = await Product.create({
            name: "Memoria Ram",
            price: 4000.00,
            description: "Novo",
            url: "http://img.com",
            seller_id: sellerUser.id,
            sold: false
        });
    });

    describe("POST /cart (Adicionar)", () => {
        test("Deve adicionar item ao carrinho", async () => {
            const res = await request(app)
                .post("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`)
                .send({ productId: product.id });

            expect(res.statusCode).toEqual(201);
            expect(res.body.product_id).toEqual(product.id);
            expect(res.body.quantity).toEqual(1);
        });

        test("Não deve adicionar produto já vendido (400)", async () => {
            // Atualiza um produto  para  vendido (sold = true)
            await product.update({ sold: true });

            const res = await request(app)
                .post("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`)
                .send({ productId: product.id });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe("GET /cart", () => {
        test("Deve listar itens do carrinho e calcular total", async () => {
            // Adiciona item primeiro
            await request(app)
                .post("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`)
                .send({ productId: product.id });

            const res = await request(app)
                .get("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.items).toHaveLength(1);
            expect(res.body.total).toEqual(4000.00);
        });
    });

    describe("POST /cart/checkout (Finalizar Compra)", () => {
        test("Sucesso - Deve criar pedido, marcar produto como vendido e limpar carrinho", async () => {
            // Coloca no carrinho
            await request(app)
                .post("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`)
                .send({ productId: product.id });

            // Finaliza Compra
            const res = await request(app)
                .post("/cart/checkout")
                .set("Authorization", `Bearer ${tokencustomer}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.msg).toContain("sucesso");

            
            // Verifica se o produto estar vendido
            const updatedProduct = await Product.findByPk(product.id);
            expect(updatedProduct.sold).toBe(true);
            expect(updatedProduct.customer_id).toBe(customerUser.id);

            // Verifica se o carrinho estar vazio
            const cartRes = await request(app)
                .get("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`);
            expect(cartRes.body.items).toHaveLength(0);
            expect(cartRes.body.total).toEqual(0);

            // Verifica se o pedido  existe
            const orders = await Order.findAll({ where: { customer_id: customerUser.id } });
            expect(orders).toHaveLength(1);
        });

        test("Falha - Race Condition (Produto vendido antes do checkout)", async () => {
            // Cliente coloca no carrinho
            await request(app)
                .post("/cart")
                .set("Authorization", `Bearer ${tokencustomer}`)
                .send({ productId: product.id });

            // Outra pessoa comprou o produto nesse meio tempo
            await product.update({ sold: true });

            // Cliente tenta finalizar
            const res = await request(app)
                .post("/cart/checkout")
                .set("Authorization", `Bearer ${tokencustomer}`);

            // Deve falhar (Conflict) e avisar que o item foi removido
            expect(res.statusCode).toEqual(409); 
            expect(res.body.msg).toContain("vendidos por outra pessoa");
        });
    });
});