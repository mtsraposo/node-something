import { jest } from '@jest/globals';
import { WebSocketMock } from '__mocks__/WebSocketMock.js';
import BinanceWebSocket from 'src/integrations/binance.js';
import WebSocketSupervisor from 'src/clients/WebSocketSupervisor.js';
import BinanceWebSocketSupervisor from '../BinanceWebSocketSupervisor.js';
import { BINANCE_WEBSOCKET_STREAM_URL } from '../constants.js';

describe('BinanceIntegration', () => {
    let binance;
    const streamNames = ['testStream-1', 'testStream-2'];

    beforeEach(async () => {
        binance = new BinanceWebSocket(WebSocketMock, streamNames);
        expect(binance.streamNames).toBe(streamNames);
    });

    const connectWebSocketStreams = async () => {
        const connectionPromises = binance.connectWebSocketStreams();
        binance.streamNames.forEach(stream => {
            const url = `${BINANCE_WEBSOCKET_STREAM_URL}/${stream}`;
            binance.websocketStreams[url].mockTriggerEvent('open', []);
        });
        await Promise.all(connectionPromises.map(promise => {
            return expect(promise).resolves.toBe('connected');
        }));
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
        const mockMessage = { s: 'BTCUSDT', c: 12345.6 };
        binance.websocket.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
        expect(spy).toHaveBeenCalledWith(mockMessage);
        binance.closeWebSocketConnection();
    });

    it('connects to websocket streams', async () => {
        await connectWebSocketStreams();
        binance.closeWebSocketStreamConnections();
    });

    it('receives messages on websocket streams', async () => {
        await connectWebSocketStreams();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockMessage = { s: 'BTCUSDT', c: 12345.6 };
        Object.keys(binance.websocketStreams).forEach(url => {
            binance.websocketStreams[url].mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
            expect(spy).toHaveBeenCalledWith(mockMessage);
        });
        binance.closeWebSocketStreamConnections();
    });

    it('checks websocket connectivity', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binance, 'handleMessage');
        binance.checkConnectivity();
        expect(spy).toHaveBeenCalledWith(binance.websocket.pongResponse);
        binance.closeWebSocketConnection();
    });
});