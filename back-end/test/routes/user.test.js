import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.js";
import config from "../../libs/config.js";
import db from "../../db.js";

const User = db.models.User;

describe("Routes: Users", () => {
    let userCustomer;
    let userSeller;
    let tokencustomer;
    let tokenSeller;

    beforeAll(async () => {
        await app.db.sequelize.sync();
    });

    afterAll(async () => {
        await app.db.sequelize.close();
    });

    beforeEach(async () => {

        await User.destroy({ 
            where: {}, 
            truncate: true, 
            cascade: true, 
            restartIdentity: true, 
            force: true 
        });

        
        userCustomer = await User.create({
            name: "Lincon Customer",
            email: "customer@mail.com",
            password: "12345",
            role: "customer"
        });

        tokencustomer = jwt.sign({ id: userCustomer.id }, config.jwtSecret);

        userSeller = await User.create({
            name: "Lincon Seller",
            email: "seller@mail.com",
            password: "12345",
            role: "seller"
        });
        tokenSeller = jwt.sign({ id: userSeller.id }, config.jwtSecret);
    });

    describe("POST /users", () => {
        test("Deve cadastrar um novo usuário", async () => {
            const res = await request(app)
                .post("/users")
                .send({
                    name: "Mary Jane",
                    email: "mary@gmail.net",
                    password: "12345",
                    role: "customer"
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toEqual("Mary Jane");
            expect(res.body.role).toEqual("customer");
            expect(res.body.password).toBeUndefined();
        });

        test("Deve falhar com role inválido", async () => {
            const res = await request(app)
                .post("/users")
                .send({
                    name: "Green Red",
                    email: "gray@mail.com",
                    password: "12345",
                    role: "admin"
                });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe("GET /user (Profile)", () => {
        test("Deve retornar os dados do usuário autenticado", async () => {
            const res = await request(app)
                .get("/user") 
                .set("Authorization", `Bearer ${tokencustomer}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toEqual("customer@mail.com");
        });
    });

    describe("DELETE /user", () => {
        test("CLIENTE: Deve ser excluído", async () => {
            const res = await request(app)
                .delete("/user")
                .set("Authorization", `Bearer ${tokencustomer}`);

            expect(res.statusCode).toEqual(204);

            // Verifica delete do cliente sem perde o histórico
            const deletedUser = await User.findOne({ 
                where: { id: userCustomer.id }, 
                paranoid: false 
            });
            expect(deletedUser.deletedAt).not.toBeNull();
        });

        test("VENDEDOR: Deve ser apenas desativado", async () => {
            const res = await request(app)
                .delete("/user")
                .set("Authorization", `Bearer ${tokenSeller}`);

            expect(res.statusCode).toEqual(200);

            const updatedUser = await User.findByPk(userSeller.id);
            expect(updatedUser.is_active).toBe(false);
            expect(updatedUser.deletedAt).toBeNull();
        });
    });
});