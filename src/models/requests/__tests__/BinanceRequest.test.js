import { jest } from '@jest/globals';

import BinanceRequest from '../BinanceRequest.js';
import { serializePrivateKey } from '../../../integrations/utils.js';

const expectInvalidRequest = (request) => {
    expect(request.isValid).toBeFalsy();
    expect(request.id).toBeNull();
    expect(request.body).toEqual({});
    expect(console.error.mock.calls).toHaveLength(1);
};
describe('BinanceRequest', () => {
    const fakeApiKey = 'fake-api-key';
    const privateKey = serializePrivateKey('unit-test-prv-key.pem');
    const method = 'order.place';

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('creates a binance request', () => {
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'LIMIT',
            timeInForce: 'GTC',
            price: 23416.10000000,
            quantity: 0.00847000,
        };
        const request = new BinanceRequest(fakeApiKey, privateKey, method, params);
        expect(request.isValid).toBeTruthy();
        expect(request.errors).toEqual([]);
        expect(request.body).toMatchObject({
            id: request.id,
            method: method,
            params: {
                apiKey: fakeApiKey,
                signature: expect.any(String),
                recvWindow: 5000,
                timestamp: expect.any(Number),
            },
        });
    });

    it('requires certain fields to be in the params', () => {
        console.error = jest.fn();
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
        };
        const request = new BinanceRequest(fakeApiKey, privateKey, method, params);
        expect(request.errors).toEqual([['type', 'required', undefined]]);
        expectInvalidRequest(request);
    });

    it('checks for field enum inclusions', () => {
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'MARGIN',
        };
        const request = new BinanceRequest(fakeApiKey, privateKey, method, params);
        expect(request.errors).toEqual([['type', 'enum', 'MARGIN']]);
        expectInvalidRequest(request);
    });

    it('checks for conditional required fields', () => {
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'MARKET',
        };
        const request = new BinanceRequest(fakeApiKey, privateKey, method, params);
        expect(request.errors).toEqual([['quantity', 'required', undefined]]);
        expectInvalidRequest(request);
    });
});