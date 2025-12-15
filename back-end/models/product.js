export default (sequelize, DataTypes) => {

    const Product = sequelize.define("Product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                isUrl: true
            }
        },
        sold: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        underscored: true,

    });

    Product.associate = (models) => {
        
        // É permitido um produto sem um comprador inicial
        Product.belongsTo(models.User, {
            as: 'customer', 
            foreignKey: {
                name: 'customer_id',
                allowNull: true 
            }
        });
        // Não é permitido um produto sem um vendedor
        Product.belongsTo(models.User, { 
            as: 'seller',
            foreignKey: {
                name: 'seller_id',
                allowNull: false
            } 
        });

        // Associando um produto para vários "itens do carrinhos"
        Product.hasMany(models.CartItem, { foreignKey: 'product_id' });

        // Ligação de favorito entre produto e usuário
        Product.belongsToMany(models.User, {
            through: 'user_favorites',
            as: 'favoritedBy',
            foreignKey: 'product_id'
        });

        // Ligação de histórico de pedido entre produto e pedido
        Product.belongsToMany(models.Order, { 
            through: 'order_items', 
            as: 'order',
            foreignKey: 'product_id',
        });
    };

    return Product;
};