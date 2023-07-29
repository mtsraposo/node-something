import { jest } from '@jest/globals';

import { WebSocketMock } from '#root/src/__mocks__/WebSocketMock.js';
import BinanceStream from '#root/src/integrations/binance/streams/BinanceStream.js';

describe('BinanceStream', () => {
    let binanceStream;

    const streamNames = ['testStream-1', 'testStream-2'];

    beforeEach(async () => {
        binanceStream = new BinanceStream(
            WebSocketMock,
            'test-api-key',
            'test-prv-key.pem',
            streamNames,
            false,
        );
    });

    afterEach(async () => {
        binanceStream.keepAlive = false;
        console.warn = jest.fn();
        await binanceStream.close();
        jest.resetAllMocks();
    });

    const connectStreams = async () => {
        const connectionPromise = binanceStream.connectStreams();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    const expectMessageHandled = async (message) => {
        const spy = jest.spyOn(binanceStream, 'handleMessage');
        binanceStream.stream.mockTriggerEvent('message', [JSON.stringify(message)]);
        expect(spy).toHaveBeenCalledWith(message);
    };

    it('handles stream messages', async () => {
        await connectStreams();
        const mockData = { e: '1hTicker', s: 'BTCUSDT', c: 12345.6, w: 12100.0 };
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        await expectMessageHandled(mockMessage);
    });

    it('handles bare stream messages', async () => {
        await connectStreams();
        const mockData = { e: '1hTicker', s: 'BTCUSDT', c: 12345.6, w: 12100.0 };
        await expectMessageHandled(mockData);
    });

    it('handles stream messages with bad formats', async () => {
        await connectStreams();
        console.error = jest.fn();
        await expectMessageHandled({});
        expect(console.error.mock.calls).toHaveLength(1);
    });

    it('handles invalid stream messages', async () => {
        await connectStreams();
        console.error = jest.fn();
        const handlePayloadSpy = jest.spyOn(binanceStream, 'handlePayload');
        const message = { e: 'otherEventType' };
        await expectMessageHandled(message);
        expect(handlePayloadSpy).toHaveBeenCalledWith(message);
        expect(console.error.mock.calls).toHaveLength(1);
    });

    it('handles ticker updates', async () => {
        await connectStreams();
        const spy = jest.spyOn(binanceStream, 'handleTickerUpdate');
        const mockData = { e: '1hTicker', s: 'BTCUSDT', c: 12345.6, w: 12100.0 };
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        await expectMessageHandled(mockMessage);
        expect(spy).toHaveBeenCalledWith(mockData);
    });

    it('retries streams connections when keepAlive is true', async () => {
        binanceStream.keepAlive = true;
        console.warn = jest.fn();
        const connectionPromise = binanceStream.connectStreams();
        await expect(connectionPromise).resolves.toBe('connected');
        await binanceStream.stream.close();
        expect(console.warn).toHaveBeenCalled();
    });
});