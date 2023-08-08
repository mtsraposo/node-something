const { db, destroy, disconnect, modelsByName } = require('../src/db');
const { cache, disconnect: disconnectCache } = require('../src/cache');

module.exports = async function (globalConfig, _projectConfig) {
    if (/\.*?\/*\.sync\.test\.js/.test(globalConfig.testPathPattern)) {
        console.log('Cleaning up the database...');
        await destroy(db, modelsByName);
        await disconnect(db);
        await disconnectCache(cache);
        await globalThis.sequelizeInitInstance.close();
    }
};
