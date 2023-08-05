/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('quotes', {
            time: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.DATE,
            },
            symbol: {
                type: Sequelize.STRING,
            },
            price: {
                type: Sequelize.DECIMAL,
            },
        });

        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.sequelize.query("SELECT create_hypertable('quotes', 'time');", {
                    transaction: t,
                }),
                queryInterface.addIndex('quotes', ['symbol', 'time'], {
                    name: 'ix_symbol_time',
                    order: [
                        ['symbol', 'ASC'],
                        ['time', 'DESC'],
                    ],
                    transaction: t,
                }),
            ]);
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('quotes', 'ix_symbol_time');
        await queryInterface.dropTable('quotes');
    },
};
