import { jest } from '@jest/globals';
import { WebSocketMock } from '__mocks__/WebSocketMock.js';
import BinanceIntegration, { BINANCE_STREAMS, BINANCE_WEBSOCKET_STREAM_URL } from 'src/integrations/binance.js';
import * as stream from 'stream';

describe('BinanceIntegration', () => {
    let binance;
    const streamNames = ['testStream-1', 'testStream-2'];

    beforeEach(async () => {
        binance = new BinanceIntegration(WebSocketMock, streamNames);
        expect(binance.streamNames).toBe(streamNames);
    });

    afterEach(() => {
        binance.closeWebsocketStreamConnections();
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

    it('connects to the websocket', async () => {
        await connectWebSocketStreams();
    });

    it('receives a message', async () => {
        await connectWebSocketStreams();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockMessage = { s: 'BTCUSDT', c: 12345.6 };
        Object.keys(binance.websocketStreams).forEach(url => {
            binance.websocketStreams[url].mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
            expect(spy).toHaveBeenCalledWith(mockMessage);
        });
    });
});