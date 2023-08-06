import { jest } from '@jest/globals';
import { SequelizeStorage } from 'umzug';
import { Sequelize } from 'sequelize';

import {
    dbExists,
    dropDatabase,
    initPostgresConnection,
    isTimescaleDBInstalled,
} from 'src/db/tasks/migrator/utils';
import { addUmzugEventListeners, createUmzugInstance } from 'src/db/tasks/migrator';

describe('migrator', () => {
    const createQuery = 'CREATE DATABASE unit_test_db;';
    const dbName = 'unit_test_db';
    const dropQuery = 'DROP DATABASE IF EXISTS unit_test_db WITH(FORCE);';
    const existsQuery =
        "SELECT exists (SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('unit_test_db'));";

    let sequelizeDbInstance;
    let sequelizeInitInstance;

    beforeEach(async () => {
        sequelizeInitInstance = initPostgresConnection({});
        sequelizeDbInstance = initPostgresConnection({ dbName });
        await dropDatabase({ dropQuery, sequelizeInitInstance });
    });

    afterEach(async () => {
        jest.resetAllMocks();
        await dropDatabase({ dropQuery, sequelizeInitInstance });
        await sequelizeInitInstance.close();
        await sequelizeDbInstance.close();
    });

    const createInstance = ({ sequelizeInstance }) => {
        return createUmzugInstance({
            context: {
                queryInterface: sequelizeInstance.getQueryInterface(),
                Sequelize: Sequelize,
            },
            storage: new SequelizeStorage({ sequelize: sequelizeInstance }),
        });
    };

    const addEventListeners = ({ nodeEnv, umzug }) => {
        addUmzugEventListeners({
            dbProps: {
                createQuery,
                dbName,
                existsQuery,
                sequelizeDbInstance,
                sequelizeInitInstance,
            },
            nodeEnv,
            umzugInstance: umzug,
        });
    };

    it("in test and dev, creates a database if it doesn't exist before migrating and rolling back", async () => {
        console.error = jest.fn();
        const umzug = createInstance({ sequelizeInstance: sequelizeDbInstance });
        addEventListeners({ nodeEnv: 'test', umzug });

        await umzug.up();
        await umzug.down();
        const created = await dbExists({ existsQuery, sequelizeInitInstance });
        const installed = await isTimescaleDBInstalled({ sequelizeDbInstance });

        expect(created).toBe(true);
        expect(installed).toBe(true);
        expect(console.error).toHaveBeenCalledTimes(0);
    });

    it('in prod, it does not try to create a database before migrating and rolling back', async () => {
        console.error = jest.fn();
        const umzug = createInstance({ sequelizeInstance: sequelizeDbInstance });
        addEventListeners({ nodeEnv: 'prod', umzug });

        await expect(umzug.up()).rejects.toThrow();
    });
});
