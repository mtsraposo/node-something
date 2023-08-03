import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import process from 'node:process';
import configJson from '../config/config.json';
import logger from '#root/src/logger.js';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configJson[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: (message) => logger.info(message),
});

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach((file) => {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export const authenticateDb = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default db;
