export default async (app) => {
    try {
        await app.db.sequelize.sync();

        if (process.env.NODE_ENV !== "test") {
            app.listen(process.env.PORT, () => {
                console.log(`E-Commerce API - porta ${app.get("port")}`);
            });
        };
    } catch (error) {
        console.error("Erro ao conectar no banco de dados: ", error);
    }
};