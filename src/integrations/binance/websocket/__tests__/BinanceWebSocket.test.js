import { jest } from '@jest/globals';

import Binance from '../Binance.js';
import { WebSocketMock } from '../../../../__mocks__/WebSocketMock.js';
import BinanceTrader from '../BinanceTrader.js';

describe('BinanceWebSocket', () => {
    let binance;
    let binanceTrader;

    const pongResponse = {
        status: 200,
        result: {},
        rateLimits: [
            {
                'rateLimitType': 'REQUEST_WEIGHT',
                'interval': 'MINUTE',
                'intervalNum': 1,
                'limit': 1200,
                'count': 1,
            },
        ],
    };

    const fakeApiKey = 'fake-api-key';

    beforeEach(() => {
        binance = new Binance(WebSocketMock, [], false);
        binanceTrader = new BinanceTrader(binance, fakeApiKey, 'unit-test-prv-key.pem');
    });

    afterEach(() => {
        binance.keepAlive = false;
        binance.closeWebSocketConnection();
        jest.restoreAllMocks();
    });

    const connectWebSocket = async () => {
        const connectionPromise = binance.connectWebSocket();
        binance.webSocket.mockTriggerEvent('open', []);
        await connectionPromise;
    };

    it('places a valid order', async () => {
        await connectWebSocket();
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'LIMIT',
            timeInForce: 'GTC',
            price: 23416.10000000,
            quantity: 0.00847000,
            recvWindow: 5000,
            timestamp: new Date().getTime(),
        };
        const spy = jest.spyOn(WebSocketMock.prototype, 'send');
        binanceTrader.placeOrder(params);
        expect(spy).toHaveBeenCalled();
    });

    it('handles errors for invalid orders', async () => {
        await connectWebSocket();
        console.error = jest.fn();
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            recvWindow: 5000,
            timestamp: new Date().getTime(),
        };
        const spy = jest.spyOn(WebSocketMock.prototype, 'send');
        binanceTrader.placeOrder(params);
        expect(spy).toHaveBeenCalledTimes(0);
        expect(console.error.mock.calls).toHaveLength(2);
    });

    // it('checks websocket connectivity', async () => {
    //     await connectWebSocket();
    //     const spy = jest.spyOn(binance, 'handleMessage');
    //     binance.checkConnectivity();
    //     expect(spy).toHaveBeenCalledWith(binance.webSocket.pongResponse);
    // });
    //
    // it('keeps connections open when keepAlive is true', async () => {
    //     binance = new BinanceWebSocket(BinanceWebSocketMock, streamNames, true);
    //     console.warn = jest.fn();
    //     const connectWebSocketSpy = jest.spyOn(binance, 'connectWebSocket');
    //     await connectWebSocket();
    //     await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
    //     binance.webSocket.mockTriggerEvent('close', [1000, 'Normal closure']);
    //     await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
    //     expect(console.warn.mock.calls).toHaveLength(1);
    // });
});