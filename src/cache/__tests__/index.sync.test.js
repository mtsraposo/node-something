import { cache, connect, disconnect } from 'src/cache';

describe('cache', () => {
    beforeEach(async () => {
        await connect(cache);
    });

    afterEach(async () => {
        await disconnect(cache);
    });

    it('sets and gets', async () => {
        await cache.set('key', 'value');
        const value = await cache.get('key');
        expect(value).toBe('value');
    });
});
