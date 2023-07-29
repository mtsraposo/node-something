import { jest } from '@jest/globals';
import BinanceWebSocketSupervisor from '#root/src/integrations/binance/websocket/BinanceWebSocketSupervisor.js';
import { WebSocketMock } from '#root/src/__mocks__/WebSocketMock.js';

describe('BinanceWebSocketSupervisor', () => {
    let binanceWebSocketSupervisor;

    beforeEach(() => {
        binanceWebSocketSupervisor = new BinanceWebSocketSupervisor(
            WebSocketMock,
            'test-api-key',
            'unit-test-prv-key.pem',
        );
    });

    afterEach(async () => {
        console.warn = jest.fn();
        await binanceWebSocketSupervisor.close();
        jest.resetAllMocks();
    });

    const connectWebSocket = async () => {
        const connectionPromise = binanceWebSocketSupervisor.connect();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    it('connects to a websocket', async () => {
        await connectWebSocket();
    });

    it('sends valid requests to the websocket server', async () => {
        await connectWebSocket();
        const method = 'order.place';
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'LIMIT',
            timeInForce: 'GTC',
            price: 23416.1,
            quantity: 0.00847,
        };
        const spy = jest.spyOn(binanceWebSocketSupervisor.webSocket, 'send');
        const requestId = binanceWebSocketSupervisor.send(method, params, true);
        expect(binanceWebSocketSupervisor.requests.get(requestId)).toBeTruthy();
        expect(spy).toHaveBeenCalled();
    });

    it('handles invalid requests to the websocket server', async () => {
        await connectWebSocket();
        const method = 'order.place';
        const params = {
            symbol: 'BTCUSDT',
            side: 'SELL',
        };
        console.error = jest.fn();
        const spy = jest.spyOn(binanceWebSocketSupervisor.webSocket, 'send');
        const requestId = binanceWebSocketSupervisor.send(method, params, true);
        expect(
            binanceWebSocketSupervisor.requests.get(requestId),
        ).toBeUndefined();
        expect(spy).toHaveBeenCalledTimes(0);
        expect(console.error).toHaveBeenCalled();
    });
});
