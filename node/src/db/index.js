'use strict';

const { config } = require('dotenv');
const Sequelize = require('sequelize');

const modelsModules = require('./models');
const { env } = require('../env');

const initModels = (dbInstance) => {
    const modelsByName = {};
    Object.entries(modelsModules).forEach(([name, model]) => {
        modelsByName[name] = model(dbInstance, Sequelize.DataTypes);
    });
    return modelsByName;
};

const associateModels = (modelsByName) => {
    Object.values(modelsByName)
        .filter((model) => model.associate)
        .forEach((model) => model.associate(modelsByName));
};

const authenticateDb = async (dbInstance) => {
    try {
        await dbInstance.authenticate();
        console.info('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error(error);
    }
};

const destroy = async (dbInstance, modelsByName) => {
    if (nodeEnv !== 'test') {
        throw new Error('Attempting to destroy database outside test environment. Aborting...');
    }
    try {
        return await dbInstance.transaction(async (transaction) => {
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

const disconnect = async (dbInstance) => {
    await dbInstance.close();
};

config();
const nodeEnv = env.nodeEnv || 'development';
const dbConfig = require('./config');
const db = new Sequelize(
    dbConfig[nodeEnv].database,
    env.postgres.username,
    env.postgres.password,
    dbConfig.connection,
);
const modelsByName = initModels(db);
associateModels(modelsByName);

module.exports = {
    authenticateDb,
    db,
    destroy,
    disconnect,
    modelsByName,
};
