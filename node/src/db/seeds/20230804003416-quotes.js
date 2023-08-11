'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'quotes',
            [
                {
                    time: '2023-08-03 14:30:02-07',
                    symbol: 'BTCUSDT',
                    price: 23000.0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    time: '2023-08-03 14:30:01-07',
                    symbol: 'BTCUSDT',
                    price: 22000.0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    time: '2023-08-03 14:30:00-07',
                    symbol: 'BTCUSDT',
                    price: 21000.0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('quotes', null, {});
    },
};
