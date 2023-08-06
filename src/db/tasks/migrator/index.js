'use strict';

const { SequelizeStorage, Umzug } = require('umzug');

const { DATABASE_CONFIG_BY_ENV, ERROR, OK, SKIP } = require('./constants.js');
const { createDbIfNotExists, initPostgresConnection } = require('./utils.js');

const initMigration = (dbInstance) => {
    const sequelizeInitInstance = initPostgresConnection({});
    const nodeEnv = process.env.NODE_ENV || 'dev';
    const { createQuery, dbName, existsQuery } = DATABASE_CONFIG_BY_ENV.get(nodeEnv);

    const umzug = createUmzugInstance({
        context: {
            queryInterface: dbInstance.sequelize.getQueryInterface(),
            Sequelize: dbInstance.Sequelize,
        },
        storage: new SequelizeStorage({ sequelize: dbInstance.sequelize }),
    });

    addUmzugEventListeners({
        dbProps: {
            createQuery,
            dbName,
            existsQuery,
            sequelizeDbInstance: dbInstance.sequelize,
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
        if (nodeEnv === 'prod') return;
        await createDbIfNotExists(dbProps);
    });
};

module.exports = {
    initMigration,
    createUmzugInstance,
    addUmzugEventListeners,
};
