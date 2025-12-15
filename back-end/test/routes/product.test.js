import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.js";
import config from "../../libs/config.js";
import db from "../../db.js";

const User = db.models.User;
const Product = db.models.Product;

describe("Routes: Products", () => {
    let tokenCustomer;
    let tokenSeller;
    let sellerId;

    beforeAll(async () => {
        await app.db.sequelize.sync();
    });

    afterAll(async () => {
        await app.db.sequelize.close();
    });

    beforeEach(async () => {
       
        await Product.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
        await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true, force: true });

        // Cria cliente
        const customer = await User.create({
            name: "Customer",
            email: "customer@test.com",
            password: "12345",
            role: "customer"
        });
        tokenCustomer = jwt.sign({ id: customer.id }, config.jwtSecret);

        // Cria vendedor
        const seller = await User.create({
            name: "Seller",
            email: "seller@test.com",
            password: "12345",
            role: "seller"
        });
        sellerId = seller.id;
        tokenSeller = jwt.sign({ id: seller.id }, config.jwtSecret);
    });

    describe("POST /products", () => {
        test("Vendedor - Deve criar produto com sucesso", async () => {
            const res = await request(app)
                .post("/products")
                .set("Authorization", `Bearer ${tokenSeller}`)
                .send({
                    name: "PlayStation 5",
                    price: 2500.00,
                    description: "Console novo",
                    url: "http://img.com/ps5.jpg"
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toEqual("PlayStation 5");
            expect(res.body.seller_id).toEqual(sellerId);
        });

        test("Cliente - Não deve criar produto", async () => {
            const res = await request(app)
                .post("/products")
                .set("Authorization", `Bearer ${tokenCustomer}`) 
                .send({
                    name: "Hack Product",
                    price: 10,
                    description: "Tentativa",
                    url: "http://foto.com"
                });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe("GET /products", () => {
        test("Deve listar produtos publicamente", async () => {
            // Primeiro, criamos um produto (como vendedor) para ter o que listar
            await request(app)
                .post("/products")
                .set("Authorization", `Bearer ${tokenSeller}`)
                .send({ 
                    name: "TV Samsung", 
                    price: 2000, 
                    description: "Smart TV", 
                    url: "http://tv.com" 
                });

            // Agora testamos a listagem (sem token, pois é pública)
            const res = await request(app).get("/products");
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].name).toEqual("TV Samsung");
        });
    });
});