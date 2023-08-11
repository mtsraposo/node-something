const DATABASE_CONFIG_BY_ENV = new Map([
    [
        'development',
        {
            createQuery: 'CREATE DATABASE node_something_dev;',
            dbName: 'node_something_dev',
            existsQuery:
                "SELECT exists (SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('node_something_dev'));",
        },
    ],
    [
        'test',
        {
            createQuery: 'CREATE DATABASE node_something_test;',
            dbName: 'node_something_test',
            existsQuery:
                "SELECT exists (SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('node_something_test'));",
        },
    ],
]);

const OK = 201;
const SKIP = 204;
const ERROR = 500;

module.exports = { DATABASE_CONFIG_BY_ENV, ERROR, OK, SKIP };
