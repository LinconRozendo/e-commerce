export default (sequelize, DataTypes) => {
    const Order = sequelize.define("Order", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },   
    },
    {
        underscored: true,
    });

    Order.associate = (models) => {
        // Um pedido pertence a um cliente
        Order.belongsTo(models.User, { 
            as: 'customer', 
            foreignKey: {
                name: 'customer_id',
                allowNull: false
            }
        });

        // Ligação de histórico de pedido entre pedido e usuário
        Order.belongsToMany(models.Product, { 
            through: 'order_items', 
            as: 'products',
            foreignKey: 'order_id',
            otherKey: 'product_id'
        });
    };

    return Order;
};