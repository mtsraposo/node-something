'use strict';

const Sequelize = require('sequelize');
const pg = require('pg');

const { SKIP, OK, ERROR } = require('./constants.js');

const createDbIfNotExists = async ({
    createQuery,
    dbName,
    existsQuery,
    sequelizeDbInstance,
    sequelizeInitInstance,
}) => {
    const exists = await dbExists({ existsQuery, sequelizeInitInstance });
    if (exists) {
        sequelizeDbInstance.options.database = dbName;
        console.info('Database already exists...');
        return SKIP;
    } else {
        console.info(`Creating database ${dbName}`);
        await createDatabase({ createQuery, sequelizeInitInstance });
        sequelizeDbInstance.options.database = dbName;
        await createTimescaleDb({ sequelizeDbInstance });
        return OK;
    }
};

const dbExists = async ({ existsQuery, sequelizeInitInstance }) => {
    const [[{ exists }]] = await sequelizeInitInstance.query(existsQuery, {
        type: Sequelize.QueryTypes.RAW,
    });
    return exists;
};

const createDatabase = async ({ createQuery, sequelizeInitInstance }) => {
    try {
        await sequelizeInitInstance.query(createQuery, {
            type: Sequelize.QueryTypes.RAW,
        });
        console.info('Database created successfully');
        return OK;
    } catch (error) {
        console.error('Error creating database : ', error);
        return ERROR;
    }
};

const dropDatabase = async ({ dropQuery, sequelizeInitInstance }) => {
    try {
        await sequelizeInitInstance.query(dropQuery, {
            type: Sequelize.QueryTypes.RAW,
        });
        console.info('Database dropped successfully');
        return OK;
    } catch (error) {
        console.error('Error dropping database : ', error);
        return ERROR;
    }
};

const createTimescaleDb = async ({ sequelizeDbInstance }) => {
    try {
        console.info('Creating TimescaleDB extension');
        await sequelizeDbInstance.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE', {
            type: Sequelize.QueryTypes.RAW,
        });
        return OK;
    } catch (error) {
        console.error('Error creating TimescaleDB extension');
        return ERROR;
    }
};

const isTimescaleDBInstalled = async ({ sequelizeDbInstance }) => {
    const result = await sequelizeDbInstance.query(
        "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb')",
        { type: Sequelize.QueryTypes.SELECT },
    );

    return result[0].exists;
};

const initPostgresConnection = ({ dbName = 'postgres' }) => {
    return new Sequelize(dbName, process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASSWORD, {
        dialect: 'postgres',
        dialectModule: pg,
        port: process.env.POSTGRES_PORT,
    });
};

module.exports = {
    createDatabase,
    createDbIfNotExists,
    createTimescaleDb,
    dbExists,
    dropDatabase,
    initPostgresConnection,
    isTimescaleDBInstalled,
};
