'use strict';

const { SequelizeStorage, Umzug } = require('umzug');
const { Sequelize } = require('sequelize');

const { DATABASE_CONFIG_BY_ENV } = require('./constants.js');
const { createDbIfNotExists, initPostgresConnection } = require('./utils.js');

const initMigration = (db) => {
    const sequelizeInitInstance = initPostgresConnection({});
    const nodeEnv = process.env.NODE_ENV || 'development';
    const { createQuery, dbName, existsQuery } = DATABASE_CONFIG_BY_ENV.get(nodeEnv);

    const umzug = createUmzugInstance({
        context: {
            queryInterface: db.getQueryInterface(),
            Sequelize: Sequelize,
        },
        storage: new SequelizeStorage({ sequelize: db }),
    });

    addUmzugEventListeners({
        dbProps: {
            createQuery,
            dbName,
            existsQuery,
            sequelizeDbInstance: db,
            sequelizeInitInstance,
        },
        nodeEnv,
        umzugInstance: umzug,
    });

    return { sequelizeInitInstance, umzug };
};

const createUmzugInstance = ({ context, storage }) => {
    return new Umzug({
        migrations: { glob: 'src/db/migrations/*.js' },
        context: context,
        storage: storage,
        logger: console,
    });
};

const addUmzugEventListeners = ({ dbProps, nodeEnv, umzugInstance }) => {
    umzugInstance.on('beforeCommand', async () => {
        if (nodeEnv === 'production') return;
        await createDbIfNotExists(dbProps);
    });
};

module.exports = {
    initMigration,
    createUmzugInstance,
    addUmzugEventListeners,
};
