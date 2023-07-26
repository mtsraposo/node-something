import { jest } from '@jest/globals';

import Binance from '../Binance.js';
import { WebSocketMock } from '../../__mocks__/WebSocketMock.js';
import BinanceTrader from '../BinanceTrader.js';

describe('BinanceTrader', () => {
    let binance;
    let binanceTrader;
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
});