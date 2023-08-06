const { initMigration } = require('../src/db/tasks/migrator');
const { db } = require('../src/db');
const { config } = require('dotenv');
module.exports = async function (globalConfig, _projectConfig) {
    config();

    if (globalConfig.testPathPattern === './*_sync.test.js') {
        const { sequelizeInitInstance, umzug } = initMigration(db);
        await umzug.up();

        globalThis.__SEQUELIZE_INIT_INSTANCE = sequelizeInitInstance;
    }
};
