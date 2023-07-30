import { jest } from '@jest/globals';
import { WebSocketMock } from 'src/__mocks__/WebSocketMock.js';
import BinanceStreamSupervisor from '#root/src/integrations/binance/streams/BinanceStreamSupervisor.js';

describe('BinanceStreamSupervisor', () => {
    let binanceStreamSupervisor;
    const streamNames = ['testStream-1', 'testStream-2'];

    beforeEach(async () => {
        binanceStreamSupervisor = new BinanceStreamSupervisor(
            WebSocketMock,
            'test-api-key',
            'test-prv-key.pem',
            streamNames,
        );
    });

    afterEach(async () => {
        console.warn = jest.fn();
        await binanceStreamSupervisor.close();
        jest.resetAllMocks();
    });

    const connectStreams = async () => {
        const connectionPromise = binanceStreamSupervisor.stream.connect();
        await expect(connectionPromise).resolves.toBe('connected');
    };

    const connectWebSocket = async () => {
        const connectionPromise = binanceStreamSupervisor.binanceWebSocket.connect();
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
        binanceStreamSupervisor.binanceWebSocket.webSocket.mockTriggerEvent('message', [
            JSON.stringify({
                id: requestId,
                result: { listenKey: 'test-listen-key' },
            }),
        ]);
        await expect(connectionPromise).resolves.toBe('connected');
    });
});
