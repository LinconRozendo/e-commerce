import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.js";
import config from "../../libs/config.js";
import db from "../../db.js";

const User = db.models.User;
const Product = db.models.Product;

describe("Routes: Favorites", () => {
    let tokenCustomer;
    let customerUser;
    let product;

    beforeAll(async () => {
        await app.db.sequelize.sync();
    });

    afterAll(async () => {
        await app.db.sequelize.close();
    });

    beforeEach(async () => {
        
        await Product.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
        await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true, force: true });

        customerUser = await User.create({
            name: "Lincon DINOVO",
            email: "dinovo@test.com",
            password: "12345",
            role: "customer"
        });
        tokenCustomer = jwt.sign({ id: customerUser.id }, config.jwtSecret);

        
        const sellerUser = await User.create({
            name: "Seller",
            email: "seller@test.com",
            password: "12345",
            role: "seller"
        });

        
        product = await Product.create({
            name: "Elden Ring",
            price: 2000.00,
            description: "Obra de arte",
            url: "http://img.com",
            seller_id: sellerUser.id,
            sold: false
        });
    });

    describe("POST /favorites/:id", () => {
        test("Deve adicionar produto aos favoritos", async () => {
            const res = await request(app)
                .post(`/favorites/${product.id}`)
                .set("Authorization", `Bearer ${tokenCustomer}`);

            expect(res.statusCode).toEqual(201);
            expect(res.body.msg).toContain("adicionado");
        });

        test("Deve retornar 404 se produto não existe", async () => {
            const res = await request(app)
                .post("/favorites/9999")
                .set("Authorization", `Bearer ${tokenCustomer}`);

            expect(res.statusCode).toEqual(404);
        });
    });

    describe("GET /favorites", () => {
        test("Deve listar produtos favoritos do usuário", async () => {
            // Adiciona aos favoritos primeiro
            await request(app)
                .post(`/favorites/${product.id}`)
                .set("Authorization", `Bearer ${tokenCustomer}`);

            // Tenta listar
            const res = await request(app)
                .get("/favorites")
                .set("Authorization", `Bearer ${tokenCustomer}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toEqual("Elden Ring");
        });
    });

    describe("DELETE /favorites/:id", () => {
        test("Deve remover produto dos favoritos", async () => {
            // Adiciona primeiro
            await request(app)
                .post(`/favorites/${product.id}`)
                .set("Authorization", `Bearer ${tokenCustomer}`);

            // Remove
            const res = await request(app)
                .delete(`/favorites/${product.id}`)
                .set("Authorization", `Bearer ${tokenCustomer}`);

            expect(res.statusCode).toEqual(204);

            // Lista deve estar vazia
            const listRes = await request(app)
                .get("/favorites")
                .set("Authorization", `Bearer ${tokenCustomer}`);
            
            expect(listRes.body).toHaveLength(0);
        });
    });
});