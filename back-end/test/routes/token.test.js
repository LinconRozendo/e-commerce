import request from "supertest";
import app from "../../index.js";
import db from "../../db.js";

const User = db.models.User;

describe("Routes: Token", () => {

    beforeAll(async () => {
        try {
            // Recria as tabelas do zero se necessário
            await app.db.sequelize.sync({ force: true });
        } catch (error) {
            console.error("Erro ao conectar/sincronizar banco de teste:", error.message);
        }
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

        await User.create({
            name: "Lincon",
            email: "lincon@mail.net",
            password: "12345",
            role: "customer"
        });
    });

    // Teste para Login com sucesso
    test ("POST /token - Retorna Token com credenciais válidas", async () => {
        const res = await request(app)
            .post("/token")
            .send({
                email: "lincon@mail.net",
                password: "12345"
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
    });

    // Teste para Login incorreta (senha incorreta) 
    test ("POST /token - Falha com senha incorreta", async () => {
        const res = await request(app)
            .post("/token")
            .send({
                email: "lincon@mail.net",
                password: "senha_errada" 
            });

        expect(res.statusCode).toEqual(401);
    });

    // Teste para Login incorreta (email incorreto)
    test("POST /token - Falha com email inexistente", async () => {
        const res = await request(app)
            .post("/token")
            .send({
                email: "naoexiste@mail.net",
                password: "12345"
            });
            
        expect(res.statusCode).toEqual(401);
    });

    // Teste para Login incorreta (email e senha incorretos)
    test("POST /token - Falha sem email ou senha", async () => {
        const res = await request(app)
            .post("/token")
            .send({})

        expect(res.statusCode).toEqual(401);
    });
});