export default (sequelize, DataTypes) => {
    const CartItem = sequelize.define("CartItem", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        underscored: true,
        tableName: 'cart_items' // Força cart_item ao invés de cartItem
    });

    CartItem.associate = (models) => {
        // Associa item do carrinho ao carrinho
        CartItem.belongsTo(models.Cart, { 
            foreignKey: {
                name: 'cart_id',
                allowNull: false
            }
        });
        // Associa item do carrinho a produto
        CartItem.belongsTo(models.Product, { 
            foreignKey: {
                name: 'product_id',
                allowNull: false
            }
        });
    };

    return CartItem;
};