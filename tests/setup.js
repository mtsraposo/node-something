const { initMigration } = require('../src/db/tasks/migrator');
const { db } = require('../src/db');
const { config } = require('dotenv');
module.exports = async function (globalConfig, _projectConfig) {
    config();

    if (/\.*?\/*_sync\.test\.js/.test(globalConfig.testPathPattern)) {
        console.log('Setting up the database...');
        const { sequelizeInitInstance, umzug } = initMigration(db);
        await umzug.up();

        globalThis.sequelizeInitInstance = sequelizeInitInstance;
    }
};
