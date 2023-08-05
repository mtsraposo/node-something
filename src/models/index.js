'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const node_env = process.env.NODE_ENV || 'dev';
const config = require('config/sequelize.js')[node_env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const modelContext = require.context('src/models', false, /\.js$/);
modelContext.keys().forEach((file) => {
    if (file === './index.js' || file.endsWith('.test.js')) return;
    const model = modelContext(file)(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = { db };
