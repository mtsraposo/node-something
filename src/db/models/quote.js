'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Quote extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Quote.init(
        {
            time: { type: DataTypes.DATE, primaryKey: true },
            symbol: DataTypes.STRING,
            price: DataTypes.DECIMAL,
        },
        {
            sequelize,
            modelName: 'quotes',
            indexes: [{ unique: true, fields: ['symbol', 'time'] }],
        },
    );
    return Quote;
};
