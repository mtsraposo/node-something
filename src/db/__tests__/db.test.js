import { jest } from '@jest/globals';
import { umzug } from 'src/db/tasks/migrator';
import { db } from 'src/db';

describe('migrator', () => {
    afterAll((done) => {
        db.sequelize.close().then(done);
        jest.resetAllMocks();
    });

    it('migrates and rolls back', async () => {
        console.error = jest.fn();
        await umzug.up();
        await umzug.down();
        expect(console.error).toHaveBeenCalledTimes(0);
    });
});
