import { jest } from '@jest/globals';
import BinanceSpotApi from '#root/src/integrations/binance/spot/BinanceSpotApi.js';
import HttpClientMock from '#root/src/__mocks__/HttpClientMock.js';

describe('BinanceSpotApi', () => {
    let binanceSpotApi;
    let httpClient;
    let url = 'https://test-url';
    let apiKey = 'test-api-key';
    let privateKeyPath = 'unit-test-prv-key.pem';

    beforeAll(() => {
        httpClient = new HttpClientMock();
        binanceSpotApi = new BinanceSpotApi(url, httpClient.request, apiKey, privateKeyPath);
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
