'use strict';

const { config } = require('dotenv');
const Sequelize = require('sequelize');

const modelsModules = require('./models');
const { env } = require('../env');

const initModels = (db) => {
    const modelsByName = {};
    Object.entries(modelsModules).forEach(([name, model]) => {
        modelsByName[name] = model(db, Sequelize.DataTypes);
    });
    return modelsByName;
};

const associateModels = (modelsByName) => {
    Object.values(modelsByName)
        .filter((model) => model.associate)
        .forEach((model) => model.associate(modelsByName));
};

const authenticate = async (db) => {
    try {
        await db.authenticate();
        console.info('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error(error);
    }
};

const destroy = async (db, modelsByName) => {
    if (nodeEnv !== 'test') {
        throw new Error('Attempting to destroy database outside test environment. Aborting...');
    }
    try {
        return await db.transaction(async (transaction) => {
            for (const [name, _model] of Object.entries(modelsModules)) {
                await modelsByName[name].destroy(
                    {
                        cascade: true,
                        truncate: true,
                    },
                    { transaction },
                );
            }
        });
    } catch (error) {
        console.error(`Failed to destroy database: ${error}`);
        throw new Error(error);
    }
};

const disconnect = async (db) => {
    await db.close();
};

config();
const nodeEnv = env.nodeEnv || 'dev';
const { database, username, password, ...dbConfig } = require('./config.js')[nodeEnv];
const db = new Sequelize(database, username, password, dbConfig);
const modelsByName = initModels(db);
associateModels(modelsByName);

module.exports = {
    authenticate,
    db,
    destroy,
    disconnect,
    modelsByName,
};
