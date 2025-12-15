export default (sequelize, DataTypes) => {
    const Cart = sequelize.define("Cart", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        status: {
           type: DataTypes.ENUM('active', 'ordered'), // Lógica para saber se foi comprado ou não
           defaultValue: 'active' 
        }
    },
    {
        underscored: true
    });

    
    Cart.associate = (models) => {
        // Associando o carrinho para um cliente
        Cart.belongsTo(models.User, { foreignKey: 'customer_id' });
        // Associando o carrinho para vários itens do carrinho
        Cart.hasMany(models.CartItem, { 
            as: 'items', // Permite fazer: cart.getItems()
            foreignKey: 'cart_id' 
        });
    };

    return Cart;
};