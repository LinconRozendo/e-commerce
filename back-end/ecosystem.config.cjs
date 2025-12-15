module.exports = {
    apps: [{
        name: "back-end-commerce",
        script: "./index.js",
        instances: "max",
        exec_mode: "cluster",
        watch: false, // atributo para rodar melhor na produção
        env_file: ".env",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }]
};