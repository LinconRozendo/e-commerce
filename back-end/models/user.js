import bcrypt from "bcryptjs";



export default (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:  true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        role: {
            type: DataTypes.ENUM("customer", "seller"),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        underscored: true,
        paranoid: true, 
        hooks: {
            beforeCreate: (user) => {
                const salt = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(user.password, salt);
            },
        },
    });

    User.associate = (models) => {

        // Associando um "vendedor" a vários produtos
        User.hasMany(models.Product, { foreignKey: 'seller_id' });

        // Associando um "cliente" a um carrinho
        User.hasOne(models.Cart, { foreignKey: 'customer_id'});

        // Associando um produto para vários "itens do carrinhos"
        User.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });

        // Ligação de favorito entre usuário e produto
        User.belongsToMany(models.Product, { 
            through: 'user_favorites', 
            as: 'favorites',          
            foreignKey: 'user_id'
        });
    };

    User.prototype.isPassword = function (encodedPassword, password) {
        return bcrypt.compareSync(password, encodedPassword);
    }

    return User;
};