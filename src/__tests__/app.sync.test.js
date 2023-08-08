import HttpClientMock from 'src/__mocks__/HttpClientMock';
import { main } from 'src/app';
import { WebSocketMock } from 'src/__mocks__/WebSocketMock';
import { db, disconnect } from 'src/db';
import { cache, disconnect as disconnectCache } from 'src/cache';

describe('app', () => {
    const auth = {
        type: 'ed25519',
        apiKey: 'test-api-key',
        privateKeyPath: 'unit-test-prv-key.pem',
    };

    const urls = {
        webSocket: 'wss://test-websocket-url',
        stream: 'wss://test-stream-url',
    };

    afterEach(async () => {
        await disconnect(db);
        await disconnectCache(cache);
    });

    it('starts up', async () => {
        const { webSocket, streams } = await main({
            binanceEnv: 'test',
            spotApiProps: {
                auth,
                httpClient: HttpClientMock,
                url: 'https://test-spot-url',
            },
            streamProps: {
                auth,
                keepAlive: false,
                streamNames: ['testStream-1', 'testStream-2'],
                urls,
                WebSocketClass: WebSocketMock,
            },
            webSocketProps: {
                auth,
                keepAlive: false,
                url: urls.webSocket,
                WebSocketClass: WebSocketMock,
            },
        });
        await streams.close();
        await webSocket.close();
    });
});
