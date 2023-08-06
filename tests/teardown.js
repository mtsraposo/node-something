const { db, destroy, disconnect, modelsByName } = require('../src/db');
module.exports = async function (globalConfig, _projectConfig) {
    if (/\.*?\/*_sync\.test\.js/.test(globalConfig.testPathPattern)) {
        console.log('Cleaning up the database...');
        await destroy(db, modelsByName);
        await disconnect(db);
        await globalThis.sequelizeInitInstance.close();
    }
};
