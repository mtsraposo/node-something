const { db, destroy, disconnect, modelsByName } = require('../src/db');
const { cache, disconnect: disconnectCache } = require('../src/cache');
const { logger } = require('../src/logger');

module.exports = async function (globalConfig, _projectConfig) {
    if (/\.*?\/*\.sync\.test\.js/.test(globalConfig.testPathPattern)) {
        logger.info('Cleaning up the database...');
        await destroy(db, modelsByName);
        await disconnect(db);
        await disconnectCache(cache);
        await globalThis.sequelizeInitInstance.close();
    }
};
