const { db } = require('../src/db');
module.exports = async function (globalConfig, _projectConfig) {
    if (globalConfig.testPathPattern === './*_sync.test.js') {
        await db.sequelize.close();
        await globalThis.__SEQUELIZE_INIT_INSTANCE.close();
    }
};
