import { jest } from '@jest/globals';
import BinanceSpotApi from 'src/integrations/binance/spot/BinanceSpotApi';
import HttpClientMock from 'src/__mocks__/HttpClientMock';

describe('BinanceSpotApi', () => {
    let binanceSpotApi;
    let httpClient;
    const url = 'https://test-url';
    const auth = {
        type: 'ed25519',
        apiKey: 'test-api-key',
        privateKeyPath: 'unit-test-prv-key.pem',
    };

    beforeAll(() => {
        httpClient = new HttpClientMock();
        binanceSpotApi = new BinanceSpotApi({
            url,
            httpClient: httpClient.request,
            auth,
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('makes valid requests', async () => {
        const response = await binanceSpotApi.request('post', 'userDataStream', {}, false);
        expect(response).toMatchObject({ listenKey: expect.any(String) });
    });

    it('handles invalid requests without making an http request', async () => {
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
        };
        const response = await binanceSpotApi.request('post', 'order', params, true);
        const spy = jest.spyOn(httpClient, 'request');
        expect(response).toMatchObject({ msg: expect.any(String), code: expect.any(Number) });
        expect(spy).toHaveBeenCalledTimes(0);
    });
});
