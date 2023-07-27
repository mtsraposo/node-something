import { jest } from '@jest/globals';
import { WebSocketMock } from 'src/__mocks__/WebSocketMock.js';
import BinanceStreamSupervisor from '#root/src/integrations/binance/streams/BinanceStreamSupervisor.js';

describe('BinanceStreamSupervisor', () => {
    let binanceStreamSupervisor;
    const streamNames = ['testStream-1', 'testStream-2'];
    const mockData = { e: '1hTicker', s: 'BTCUSDT', c: 12345.6, w: 12100.0 };
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

    beforeEach(async () => {
        binanceStreamSupervisor = new BinanceStreamSupervisor(
            WebSocketMock,
            'test-api-key',
            'test-prv-key.pem',
            streamNames,
        );
    });

    afterEach(() => {
        binanceStreamSupervisor.close();
        binanceStreamSupervisor.stream?.destroy();
        binanceStreamSupervisor.binanceWebSocket?.webSocket?.destroy();
        jest.resetAllMocks();
    });

    const connectStreams = async () => {
        const connectionPromise = binanceStreamSupervisor.connectStreams();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    const connectWebSocket = async () => {
        const connectionPromise = binanceStreamSupervisor.connectWebSocket();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    it('connects streams', async () => {
        await connectStreams();
    });

    it('connects to the websocket', async () => {
        await connectWebSocket();
    });

    it('starts a user data stream', async () => {
        await connectWebSocket();
        const { requestId, connectionPromise } = binanceStreamSupervisor.startUserDataStream();
        binanceStreamSupervisor.binanceWebSocket.webSocket.mockTriggerEvent('message',
            [JSON.stringify({ id: requestId, result: { listenKey: 'test-listen-key' } })],
        );
        await expect(connectionPromise).resolves.toBe('connected');
    });

    // it('receives messages on the websocket', async () => {
    //     await connectWebSocket();
    //     const spy = jest.spyOn(binance, 'handleTickerUpdate');
    //     const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
    //     binance.webSocket.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
    //     expect(spy).toHaveBeenCalledWith(mockData);
    // });
    //
    // it('connects to websocket streams', async () => {
    //     await connectWebSocketStreams();
    // });
    //
    // it('receives messages on websocket streams', async () => {
    //     await connectWebSocketStreams();
    //     const spy = jest.spyOn(binance, 'handleTickerUpdate');
    //     const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
    //     binance.webSocketStreams.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
    //     expect(spy).toHaveBeenCalledWith(mockData);
    // });
    //
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