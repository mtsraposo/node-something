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

        await queryInterface.sequelize.query("SELECT create_hypertable('quotes', 'time');");

        await queryInterface.addIndex('quotes', ['symbol', 'time'], {
            name: 'ix_symbol_time',
            order: [
                ['symbol', 'ASC'],
                ['time', 'DESC'],
            ],
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('quotes', 'ix_symbol_time');
        await queryInterface.dropTable('quotes');
    },
};
