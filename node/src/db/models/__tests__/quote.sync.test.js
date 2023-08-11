import Factory from 'tests/factory';
import { QUOTE } from 'src/db/models/constants';
import { destroy, db, modelsByName, disconnect } from 'src/db/index';

describe('quote', () => {
    let factory;

    beforeAll(async () => {
        factory = new Factory({ modelsByName });
    });

    afterEach(async () => {
        await destroy(db, modelsByName);
    });

    afterAll(async () => {
        await disconnect(db);
    });

    it('inserts a quote', async () => {
        const Quote = await factory.insert(QUOTE);
        await expect(Quote.findOne()).resolves.toMatchObject({
            time: expect.any(Date),
        });
    });
});
