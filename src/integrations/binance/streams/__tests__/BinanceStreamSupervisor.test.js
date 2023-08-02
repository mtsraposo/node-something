import { jest } from '@jest/globals';
import { WebSocketMock } from 'src/__mocks__/WebSocketMock.js';
import BinanceStreamSupervisor from '#root/src/integrations/binance/streams/BinanceStreamSupervisor.js';
import logger from '#root/src/logger.js';

describe('BinanceStreamSupervisor', () => {
    let binanceStreamSupervisor;
    const streamNames = ['testStream-1', 'testStream-2'];
    const auth = {
        type: 'ed25519',
        apiKey: 'test-api-key',
        privateKeyPath: 'test-prv-key.pem',
    };

    beforeEach(async () => {
        binanceStreamSupervisor = new BinanceStreamSupervisor({
            WebSocketClass: WebSocketMock,
            auth,
            streamNames,
            keepAlive: false,
        });
    });

    afterEach(async () => {
        logger.warn = jest.fn();
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
