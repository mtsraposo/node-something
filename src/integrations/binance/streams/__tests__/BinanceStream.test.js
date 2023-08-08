import { jest } from '@jest/globals';

import { WebSocketMock } from 'src/__mocks__/WebSocketMock';
import BinanceStream from 'src/integrations/binance/streams/BinanceStream';
import logger from 'src/logger';
import { serializePrivateKey } from 'src/clients/requests/auth';

describe('BinanceStream', () => {
    let binanceStream;

    const auth = {
        type: 'ed25519',
        apiKey: 'fake-api-key',
        privateKey: serializePrivateKey('unit-test-prv-key.pem'),
    };

    const streamNames = ['testStream-1', 'testStream-2'];

    const urls = {
        webSocket: 'wss://test-websocket-url',
        stream: 'wss://test-stream-url',
    };

    beforeEach(async () => {
        binanceStream = new BinanceStream({
            WebSocketClass: WebSocketMock,
            auth: auth,
            streamNames,
            urls,
            keepAlive: false,
        });
    });

    afterEach(async () => {
        binanceStream.keepAlive = false;
        logger.warn = jest.fn();
        await binanceStream.close();
        jest.resetAllMocks();
    });

    const connectStreams = async () => {
        const connectionPromise = binanceStream.stream.connect();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    const expectMessageHandled = async (message) => {
        const spy = jest.spyOn(binanceStream, 'handleMessage');
        binanceStream.stream.webSocket.mockTriggerEvent('message', [JSON.stringify(message)]);
        expect(spy).toHaveBeenCalledWith(message);
    };

    it('handles stream messages', async () => {
        await connectStreams();
        const mockData = {
            e: '1hTicker',
            s: 'BTCUSDT',
            c: 12345.6,
            w: 12100.0,
        };
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        await expectMessageHandled(mockMessage);
    });

    it('handles bare stream messages', async () => {
        await connectStreams();
        const mockData = {
            e: '1hTicker',
            s: 'BTCUSDT',
            c: 12345.6,
            w: 12100.0,
        };
        await expectMessageHandled(mockData);
    });

    it('handles stream messages with bad formats', async () => {
        await connectStreams();
        logger.error = jest.fn();
        await expectMessageHandled({});
        expect(logger.error).toHaveBeenCalled();
    });

    it('handles invalid stream messages', async () => {
        await connectStreams();
        logger.error = jest.fn();
        const handlePayloadSpy = jest.spyOn(binanceStream, 'handlePayload');
        const message = { e: 'otherEventType' };
        await expectMessageHandled(message);
        expect(handlePayloadSpy).toHaveBeenCalledWith(message);
        expect(logger.error).toHaveBeenCalled();
    });

    it('handles ticker updates', async () => {
        await connectStreams();
        const spy = jest.spyOn(binanceStream, 'handleTickerUpdate');
        const mockData = {
            e: '1hTicker',
            s: 'BTCUSDT',
            c: 12345.6,
            w: 12100.0,
        };
        const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
        await expectMessageHandled(mockMessage);
        expect(spy).toHaveBeenCalledWith(mockData);
    });

    it('retries streams connections when keepAlive is true', async () => {
        binanceStream.keepAlive = true;
        logger.warn = jest.fn();
        const connectionPromise = binanceStream.stream.connect();
        await expect(connectionPromise).resolves.toBe('connected');
        await binanceStream.stream.close();
        expect(logger.warn).toHaveBeenCalled();
    });
});
