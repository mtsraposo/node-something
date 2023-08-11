const { env } = require('../env');
const pg = require('pg');

module.exports = {
    connection: {
        name: env.postgres.name,
        host: env.postgres.host,
        port: env.postgres.port,
        dialect: 'postgres',
        dialectModule: pg,
    },
    development: {
        database: 'node_something_dev',
    },
    test: {
        database: 'node_something_test',
    },
    production: {
        database: 'node_something_prod',
    },
};
