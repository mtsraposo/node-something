const { config } = require('dotenv');

const { initMigration } = require('../src/db/tasks/migrator');
const { db } = require('../src/db');
const { logger } = require('../src/logger');

module.exports = async function (globalConfig, _projectConfig) {
    config();

    if (/\.*?\/*\.sync\.test\.js/.test(globalConfig.testPathPattern)) {
        logger.info('Setting up the database...');
        const { sequelizeInitInstance, umzug } = initMigration(db);
        await umzug.up();

        globalThis.sequelizeInitInstance = sequelizeInitInstance;
    }
};
