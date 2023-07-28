import { jest } from '@jest/globals';
import BinanceWebSocketSupervisor from '#root/src/integrations/binance/websocket/BinanceWebSocketSupervisor.js';
import { WebSocketMock } from '#root/src/__mocks__/WebSocketMock.js';

describe('BinanceWebSocketSupervisor', () => {
    let binanceWebSocketSupervisor;

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

    beforeEach(() => {
        binanceWebSocketSupervisor = new BinanceWebSocketSupervisor(
            WebSocketMock,
            'test-api-key',
            'unit-test-prv-key.pem',
        );
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
            price: 23416.10000000,
            quantity: 0.00847000,
        };
        const spy = jest.spyOn(binanceWebSocketSupervisor.webSocket, 'send');
        const requestId = binanceWebSocketSupervisor.send(method, params, true);
        expect(binanceWebSocketSupervisor.requests.get(requestId)).toBeTruthy();
        expect(spy).toHaveBeenCalled();
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