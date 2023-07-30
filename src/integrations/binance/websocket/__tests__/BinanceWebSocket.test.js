import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketMock } from '#root/src/__mocks__/WebSocketMock.js';
import BinanceWebSocket from '#root/src/integrations/binance/websocket/BinanceWebSocket.js';
import logger from '#root/src/logger.js';

describe('BinanceWebSocket', () => {
    let binanceWebSocket;

    const validOrder = {
        symbol: 'BTCUSDT',
        side: 'SELL',
        type: 'LIMIT',
        timeInForce: 'GTC',
        price: 23416.1,
        quantity: 0.00847,
    };

    beforeEach(() => {
        binanceWebSocket = new BinanceWebSocket({
            url: 'wss://test-websocket',
            WebSocketClass: WebSocketMock,
            apiKey: 'test-api-key',
            privateKeyPath: 'unit-test-prv-key.pem',
            keepAlive: false,
        });
    });

    afterEach(async () => {
        binanceWebSocket.keepAlive = false;
        logger.warn = jest.fn();
        await binanceWebSocket.close();
        jest.restoreAllMocks();
    });

    const connectWebSocket = async () => {
        const connectionPromise = binanceWebSocket.connect();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    it('pings websocket', async () => {
        await connectWebSocket();
        const handleMessageSpy = jest.spyOn(binanceWebSocket, 'handleMessage');
        const handleResponseSpy = jest.spyOn(binanceWebSocket, 'handleResponse');
        binanceWebSocket.ping();
        expect(handleMessageSpy).toHaveBeenCalled();
        expect(handleResponseSpy).toHaveBeenCalled();
    });

    it('gets account status', async () => {
        await connectWebSocket();
        const handleMessageSpy = jest.spyOn(binanceWebSocket, 'handleMessage');
        const handleResponseSpy = jest.spyOn(binanceWebSocket, 'handleResponse');
        binanceWebSocket.getAccountStatus();
        expect(handleMessageSpy).toHaveBeenCalled();
        expect(handleResponseSpy).toHaveBeenCalled();
    });

    it('places orders', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binanceWebSocket.webSocket, 'send');
        const requestId = binanceWebSocket.placeOrder(validOrder);
        expect(spy).toHaveBeenCalled();
        expect(binanceWebSocket.requests.get(requestId)).toBeTruthy();
    });

    it("errors on server responses that don't match requests", async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binanceWebSocket, 'handleMessage');
        const message = JSON.stringify({ id: uuidv4() });
        logger.error = jest.fn();
        binanceWebSocket.webSocket.mockTriggerEvent('message', [message]);
        expect(spy).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalled();
    });

    it('retries connections when keepAlive is true', async () => {
        binanceWebSocket.keepAlive = true;
        logger.warn = jest.fn();
        const connectWebSocketSpy = jest.spyOn(binanceWebSocket, 'connect');
        await connectWebSocket();
        await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
        binanceWebSocket.webSocket.mockTriggerEvent('close', [1000, 'Normal closure']);
        await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalled();
    });
});
