/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('Quotes', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        time: {
            type: Sequelize.DATE,
        },
        symbol: {
            type: Sequelize.STRING,
        },
        price: {
            type: Sequelize.DECIMAL,
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
        },
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Quotes');
}
