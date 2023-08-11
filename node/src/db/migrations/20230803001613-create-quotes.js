/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up({ context: { queryInterface, Sequelize } }) {
        await queryInterface.createTable('quotes', {
            time: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.DATE,
            },
            symbol: {
                type: Sequelize.TEXT,
            },
            price: {
                type: Sequelize.DECIMAL,
            },
            updatedAt: Sequelize.DATE,
            createdAt: Sequelize.DATE,
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

    async down({ context: { queryInterface } }) {
        await queryInterface.removeIndex('quotes', 'ix_symbol_time');
        await queryInterface.dropTable('quotes');
    },
};
