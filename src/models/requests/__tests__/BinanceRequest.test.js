import { jest } from '@jest/globals';

import BinanceRequest from '../BinanceRequest.js';
import { serializePrivateKey } from '#root/src/models/requests/auth.js';
import logger from '#root/src/logger.js';

const expectInvalidRequest = (request) => {
    expect(request.isValid).toBeFalsy();
    expect(request.id).toBeNull();
    expect(request.body).toEqual({});
    expect(logger.error.mock.calls).toHaveLength(1);
};
describe('BinanceRequest', () => {
    const apiKey = 'fake-api-key';
    const privateKey = serializePrivateKey('unit-test-prv-key.pem');
    const method = 'order.place';

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('creates a signed binance request', () => {
        const params = {
            recvWindow: 5000,
            timestamp: new Date().getTime(),
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'LIMIT',
            timeInForce: 'GTC',
            price: 23416.1,
            quantity: 0.00847,
        };
        const request = new BinanceRequest(method, params, { apiKey, privateKey, signed: true });
        expect(request.isValid).toBeTruthy();
        expect(request.errors).toEqual([]);
        expect(request.body).toMatchObject({
            id: request.id,
            method,
            params: {
                apiKey: apiKey,
                signature: expect.any(String),
                recvWindow: 5000,
                timestamp: expect.any(Number),
                price: expect.any(Number),
                quantity: expect.any(Number),
                side: expect.any(String),
                symbol: expect.any(String),
                timeInForce: expect.any(String),
                type: expect.any(String),
            },
        });
    });

    it('creates an unsigned binance request', () => {
        const request = new BinanceRequest('ping', {}, { apiKey, privateKey, signed: false });
        expect(request.isValid).toBeTruthy();
        expect(request.errors).toEqual([]);
        expect(request.body).toMatchObject({
            id: request.id,
            method: request.method,
        });
    });

    it('requires certain fields to be in the params', () => {
        logger.error = jest.fn();
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
        };
        const request = new BinanceRequest(method, params, { apiKey, privateKey, signed: true });
        expect(request.errors).toEqual([['type', 'required', undefined]]);
        expectInvalidRequest(request);
    });

    it('checks for field enum inclusions', () => {
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'MARGIN',
        };
        const request = new BinanceRequest(method, params, { apiKey, privateKey, signed: true });
        expect(request.errors).toEqual([['type', 'enum', 'MARGIN']]);
        expectInvalidRequest(request);
    });

    it('checks for conditional required fields', () => {
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'MARKET',
        };
        const request = new BinanceRequest(method, params, { apiKey, privateKey, signed: true });
        expect(request.errors).toEqual([['quantity', 'required', undefined]]);
        expectInvalidRequest(request);
    });
});
