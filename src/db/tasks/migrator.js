'use strict';

const { SequelizeStorage, Umzug } = require('umzug');
const Sequelize = require('sequelize');
const pg = require('pg');

const { db } = require('../index.js');
const { DATABASE_CONFIG_BY_ENV } = require('./constants.js');

const createDbIfNotExists = async ({ createQuery, dbName, existsQuery }) => {
    const [[{ exists }]] = await dbExists({ existsQuery, sequelize });
    if (exists) {
        db.sequelize.options.database = dbName;
        console.info('Database already exists...');
    } else {
        console.info(`Creating database ${dbName}`);
        await createDatabase({ createQuery, sequelize });
        await createTimescaleDb({ sequelize });
        db.sequelize.options.database = dbName;
    }
};

const openConnection = () => {
    return new Sequelize('postgres', process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASSWORD, {
        dialect: 'postgres',
        dialectModule: pg,
        port: process.env.POSTGRES_PORT,
    });
};

const dbExists = ({ existsQuery, sequelize }) => {
    return sequelize.query(existsQuery, {
        type: Sequelize.QueryTypes.RAW,
    });
};

const createDatabase = async ({ createQuery, sequelize }) => {
    try {
        await sequelize.query(createQuery, {
            type: Sequelize.QueryTypes.RAW,
        });
        console.info('Database created successfully');
    } catch (error) {
        console.error('Error creating database : ', error);
    }
};

const createTimescaleDb = async ({ sequelize }) => {
    try {
        console.info('Creating TimescaleDB extension');
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE', {
            type: Sequelize.QueryTypes.RAW,
        });
    } catch (error) {
        console.error('Error creating TimescaleDB extension');
    }
};

const sequelize = openConnection();

const umzug = new Umzug({
    migrations: { glob: 'src/db/migrations/*.js' },
    context: { queryInterface: db.sequelize.getQueryInterface(), Sequelize: db.Sequelize },
    storage: new SequelizeStorage({ sequelize: db.sequelize }),
    logger: console,
});

umzug.on('beforeCommand', async () => {
    const nodeEnv = process.env.NODE_ENV || 'dev';
    if (nodeEnv === 'prod') return;
    const { createQuery, dbName, existsQuery } = DATABASE_CONFIG_BY_ENV.get(nodeEnv);
    await createDbIfNotExists({ createQuery, dbName, existsQuery });
});

exports.umzug = umzug;

if (require.main === module) {
    umzug.runAsCLI();
}
