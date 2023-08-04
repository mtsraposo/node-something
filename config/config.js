const { config } = require('dotenv');
const { env } = require('../src/env.js');
const { path } = require('path');

config({ path: path.join(__dirname, 'env.js') });

module.exports = {
    dev: {
        username: 'postgres',
        password: 'postgres',
        database: 'node_something_dev',
        host: 'localhost',
        dialect: 'postgres',
        port: 5432,
    },
    test: {
        username: 'postgres',
        password: 'postgres',
        database: 'node_something_test',
        host: 'localhost',
        dialect: 'postgres',
        port: 5432,
    },
    prod: {
        username: env.postgres.username,
        password: env.postgres.password,
        database: 'node_something',
        host: env.postgres.host,
        dialect: 'postgres',
        port: env.postgres.port,
    },
};
