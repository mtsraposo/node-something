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
        binance.stayUp = false;
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
        };
        const spy = jest.spyOn(WebSocketMock.prototype, 'send');
        binanceTrader.placeOrder(params);
        expect(spy).toHaveBeenCalled();
    });

    it('handles errors for invalid orders', async () => {
        await connectWebSocket();
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
        };
        const spy = jest.spyOn(WebSocketMock.prototype, 'send');
        binanceTrader.placeOrder(params);
        expect(spy).toHaveBeenCalledTimes(0);
    });
});