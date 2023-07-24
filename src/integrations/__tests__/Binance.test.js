import { jest } from '@jest/globals';
import { WebSocketMock } from 'src/__mocks__/WebSocketMock.js';
import BinanceWebSocket from 'src/integrations/binance.js';

class BinanceWebSocketMock extends WebSocketMock {
    constructor(props) {
        super(props);
        this.pongResponse = {
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
    }
}

describe('BinanceIntegration', () => {
    let binance;
    const streamNames = ['testStream-1', 'testStream-2'];
    const mockData = { e: '1hTicker', s: 'BTCUSDT', c: 12345.6, w: 12100.0 };

    beforeEach(async () => {
        binance = new BinanceWebSocket(BinanceWebSocketMock, streamNames, false);
        expect(binance.streamNames).toBe(streamNames);
    });

    afterEach(() => {
        binance.stayUp = false;
        binance.closeWebSocketConnection();
        binance.closeWebSocketStreamConnection();
        jest.resetAllMocks();
    });

    const connectWebSocketStreams = async () => {
        const connectionPromise = binance.connectWebSocketStreams();
        binance.webSocketStreams.mockTriggerEvent('open', []);
        await expect(connectionPromise).resolves.toBe('connected');
    };

    const connectWebSocket = async () => {
        const connectionPromise = binance.connectWebSocket();
        binance.webSocket.mockTriggerEvent('open', []);
        await connectionPromise;
    };

    it('connects to the websocket', async () => {
        await connectWebSocket();
    });

    it('receives messages on the websocket', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        binance.webSocket.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
        expect(spy).toHaveBeenCalledWith(mockData);
    });

    it('connects to websocket streams', async () => {
        await connectWebSocketStreams();
    });

    it('receives messages on websocket streams', async () => {
        await connectWebSocketStreams();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        binance.webSocketStreams.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
        expect(spy).toHaveBeenCalledWith(mockData);
    });

    it('checks websocket connectivity', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binance, 'handleMessage');
        binance.checkConnectivity();
        expect(spy).toHaveBeenCalledWith(binance.webSocket.pongResponse);
    });

    it('keeps connections open when stayUp is true', async () => {
        binance = new BinanceWebSocket(BinanceWebSocketMock, streamNames, true);
        console.warn = jest.fn();
        const connectWebSocketSpy = jest.spyOn(binance, 'connectWebSocket');
        await connectWebSocket();
        await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
        binance.webSocket.mockTriggerEvent('close', [1000, 'Normal closure']);
        await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
        expect(console.warn.mock.calls).toHaveLength(1);
    });
});