import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketMock } from '#root/src/__mocks__/WebSocketMock.js';
import BinanceWebSocket from '#root/src/integrations/binance/websocket/BinanceWebSocket.js';

describe('BinanceWebSocket', () => {
    let binanceWebSocket;

    const validOrder = {
        symbol: 'BTCUSDT',
        side: 'SELL',
        type: 'LIMIT',
        timeInForce: 'GTC',
        price: 23416.10000000,
        quantity: 0.00847000,
    };

    beforeEach(() => {
        binanceWebSocket = new BinanceWebSocket(
            WebSocketMock,
            'test-api-key',
            'unit-test-prv-key.pem',
            false,
        );
    });

    afterEach(async () => {
        binanceWebSocket.keepAlive = false;
        console.warn = jest.fn();
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

    it('errors on server responses that don\'t match requests', async () => {
        await connectWebSocket();
        const spy = jest.spyOn(binanceWebSocket, 'handleMessage');
        const message = JSON.stringify({ id: uuidv4() });
        console.error = jest.fn();
        binanceWebSocket.webSocket.mockTriggerEvent('message', [message]);
        expect(spy).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
    });

    it('retries connections when keepAlive is true', async () => {
        binanceWebSocket.keepAlive = true;
        console.warn = jest.fn();
        const connectWebSocketSpy = jest.spyOn(binanceWebSocket, 'connect');
        await connectWebSocket();
        await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
        binanceWebSocket.webSocket.mockTriggerEvent('close', [1000, 'Normal closure']);
        await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalled();
    });
});