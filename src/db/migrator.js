'use strict';

const { db } = require('./index');
const { initMigration } = require('./tasks/migrator');

const umzug = initMigration(db);

exports.umzug = umzug;

if (require.main === module) {
    umzug.runAsCLI();
}
