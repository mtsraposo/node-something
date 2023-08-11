import { jest } from '@jest/globals';
import {
    createDatabase,
    createDbIfNotExists,
    createTimescaleDb,
    dbExists,
    dropDatabase,
    initPostgresConnection,
    isTimescaleDBInstalled,
} from 'src/db/tasks/migrator/utils';
import { SKIP } from 'src/db/tasks/migrator/constants';

describe('utils', () => {
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

    afterAll(async () => {
        jest.resetAllMocks();
        await dropDatabase({ dropQuery, sequelizeInitInstance });
        await sequelizeInitInstance.close();
        await sequelizeDbInstance.close();
    });

    it('checks whether the database exists', async () => {
        const exists = await dbExists({ existsQuery, sequelizeInitInstance });
        expect(exists).toBe(false);
    });

    it('creates a new database', async () => {
        await createDatabase({ createQuery, sequelizeInitInstance });
        const created = await dbExists({ existsQuery, sequelizeInitInstance });
        expect(created).toBe(true);
    });

    it('installs the TimescaleDB extension', async () => {
        await createDatabase({ createQuery, sequelizeInitInstance });
        sequelizeDbInstance.options.database = dbName;
        await createTimescaleDb({ sequelizeDbInstance });
        const installed = await isTimescaleDBInstalled({ sequelizeDbInstance });
        expect(installed).toBe(true);
    });

    it("creates a database if it doesn't yet exist", async () => {
        await createDbIfNotExists({
            createQuery,
            dbName,
            existsQuery,
            sequelizeDbInstance,
            sequelizeInitInstance,
        });
        const created = await dbExists({ existsQuery, sequelizeInitInstance });
        expect(created).toBe(true);
        const installed = await isTimescaleDBInstalled({ sequelizeDbInstance });
        expect(installed).toBe(true);
    });

    it('skips creating a database if it already exists', async () => {
        await createDatabase({ createQuery, sequelizeInitInstance });
        await createTimescaleDb({ sequelizeInitInstance });
        const result = await createDbIfNotExists({
            createQuery,
            dbName,
            existsQuery,
            sequelizeDbInstance,
            sequelizeInitInstance,
        });
        expect(result).toBe(SKIP);
    });
});
