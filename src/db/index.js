'use strict';

const process = require('process');
const Sequelize = require('sequelize');

const models = require('./models');
const node_env = process.env.NODE_ENV || 'dev';
const config = require('./config.js')[node_env];

const initModels = (sequelize) => {
    const db = {};
    Object.entries(models).forEach(([name, model]) => {
        db[name] = model(sequelize, Sequelize.DataTypes);
    });
    return db;
};

const associateModels = (db) => {
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    return db;
};

const sequelize = new Sequelize('postgres', config.username, config.password, config);
const db = initModels(sequelize);

associateModels(db);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = {
    db,
    async authenticateDb() {
        try {
            await db.sequelize.authenticate();
            console.info('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    },
};
