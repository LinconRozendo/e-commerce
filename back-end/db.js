import { Sequelize } from "sequelize"
import config from "./libs/config.js"
import userModel from "./models/user.js";
import cartModel from "./models/cart.js";
import cartItemModel from "./models/cartItem.js";
import orderModel from "./models/order.js";
import productModel from "./models/product.js";

// Configurando para sempre indicar que o banco é postgres
const dbParams = config.params || {};
if (!dbParams.dialect) {
    dbParams.dialect = "postgres";
}

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    dbParams
);

const db = {
    sequelize,
    Sequelize,
    models: {},
};


db.models.User = userModel(sequelize, Sequelize.DataTypes);
db.models.Cart = cartModel(sequelize, Sequelize.DataTypes);
db.models.CartItem = cartItemModel(sequelize, Sequelize.DataTypes);
db.models.Order = orderModel(sequelize, Sequelize.DataTypes);
db.models.Product = productModel(sequelize, Sequelize.DataTypes);


Object.keys(db.models).forEach((key) => {
    if (db.models[key].associate) {
        db.models[key].associate(db.models);
    }
});



export default db;