import { cache, connectCache, disconnect } from 'src/cache/index';

describe('cache', () => {
    beforeEach(async () => {
        await connectCache(cache);
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
