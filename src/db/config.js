const pg = require('pg');

module.exports = {
    dev: {
        username: 'postgres',
        password: 'postgres',
        database: 'node_something_dev',
        host: 'localhost',
        dialect: 'postgres',
        dialectModule: pg,
        port: 5432,
    },
    test: {
        username: 'postgres',
        password: 'postgres',
        database: 'node_something_test',
        host: 'localhost',
        dialect: 'postgres',
        dialectModule: pg,
        port: 5432,
    },
    prod: {
        name: process.env.POSTGRES_NAME,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: 'node_something_prod',
        dialect: 'postgres',
        dialectModule: pg,
    },
};
