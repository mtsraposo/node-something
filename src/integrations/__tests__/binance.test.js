import { jest } from '@jest/globals';
import { WebSocketMock } from '__mocks__/WebSocketMock.js';
import BinanceIntegration from 'src/integrations/binance.js';

describe('BinanceIntegration', () => {
    let binance;

    beforeEach(async () => {
        binance = new BinanceIntegration(WebSocketMock);
    });

    afterEach(() => {
        binance.closeWebsocket();
    });

    const connectWebSocket = async () => {
        const connectionPromise = binance.connectWebSocket();
        binance.websocket.mockTriggerEvent('open', []);
        await expect(connectionPromise).resolves.toBe('connected');
    };

    it('connects to the websocket', async () => {
        await connectWebSocket();
    });

    it('receives a message', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binance, 'handleTickerUpdate');
        const mockMessage = { s: 'BTCUSDT', c: 12345.6 };
        binance.websocket.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
        expect(spy).toHaveBeenCalledWith(mockMessage);
    });
});