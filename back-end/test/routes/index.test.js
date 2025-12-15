import request from "supertest";
import app from "../../index.js";


describe("Routes: Index", () => {

    beforeAll(async () => {
        await app.db.sequelize.sync();
    });

    test("GET /", async () => {

        const res = await request(app).get("/");

        expect(res.statusCode).toEqual(200);

        expect(res.body).toEqual( { status: "E-Commerce API"});
    });

    afterAll(async () => {
        await app.db.sequelize.close();
    });
    
});