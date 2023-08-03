import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Quotes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Quotes.init(
        {
            time: DataTypes.DATE,
            symbol: DataTypes.STRING,
            price: DataTypes.DECIMAL,
        },
        {
            sequelize,
            modelName: 'Quotes',
        },
    );
    return Quotes;
};
