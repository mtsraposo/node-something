import { jest } from '@jest/globals';
import { WebSocketMock } from '__mocks__/WebSocketMock.js';
import BinanceWebSocket from 'src/integrations/binance.js';

describe('BinanceIntegration', () => {
    let binance;
    const streamNames = ['testStream-1', 'testStream-2'];

    beforeEach(async () => {
        binance = new BinanceWebSocket(WebSocketMock, streamNames);
        expect(binance.streamNames).toBe(streamNames);
    });

    const connectWebSocketStreams = async () => {
        const connectionPromise = binance.connectWebSocketStreams();
        binance.webSocketStreams.mockTriggerEvent('open', []);
        await expect(connectionPromise).resolves.toBe('connected');
    };

    const connectWebSocket = async () => {
        const connectionPromise = binance.connectWebSocket();
        binance.websocket.mockTriggerEvent('open', []);
        await connectionPromise;
    };

    it('connects to the websocket', async () => {
        await connectWebSocket();
        binance.closeWebSocketConnection();
    });

    it('receives messages on the websocket', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockData = { s: 'BTCUSDT', c: 12345.6 };
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        binance.websocket.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
        expect(spy).toHaveBeenCalledWith(mockData);
        binance.closeWebSocketConnection();
    });

    it('connects to websocket streams', async () => {
        await connectWebSocketStreams();
        binance.closeWebSocketStreamConnection();
    });

    it('receives messages on websocket streams', async () => {
        await connectWebSocketStreams();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockData = { s: 'BTCUSDT', c: 12345.6 };
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        binance.webSocketStreams.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
        expect(spy).toHaveBeenCalledWith(mockData);
        binance.closeWebSocketStreamConnection();
    });

    it('checks websocket connectivity', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binance, 'handleMessage');
        binance.checkConnectivity();
        expect(spy).toHaveBeenCalledWith(binance.websocket.pongResponse);
        binance.closeWebSocketConnection();
    });
});