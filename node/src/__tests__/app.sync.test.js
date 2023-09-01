import { HttpClientMock, ProducerMock, SchemaRegistryMock, WebSocketMock } from 'src/__mocks__';
import { main } from 'src/app';
import { db, disconnect } from 'src/db';
import { cache, disconnect as disconnectCache } from 'src/cache';

describe('app', () => {
    const auth = {
        type: 'ed25519',
        apiKey: 'test-api-key',
        privateKeyPath: 'unit-test-prv-key.pem',
    };

    const producerInstance = new ProducerMock();
    const quoteReceivedTopic = 'test.quote.received.v1.avro';
    const spotApiProps = {
        auth,
        httpClient: HttpClientMock,
        url: 'https://test-spot-url',
    };
    const urls = {
        webSocket: 'wss://test-websocket-url',
        stream: 'wss://test-stream-url',
    };
    const streamProps = {
        auth,
        keepAlive: false,
        streamNames: ['testStream-1', 'testStream-2'],
        urls,
        WebSocketClass: WebSocketMock,
    };
    const webSocketProps = {
        auth,
        keepAlive: false,
        url: urls.webSocket,
        WebSocketClass: WebSocketMock,
    };

    afterEach(async () => {
        await disconnect(db);
        await disconnectCache(cache);
    });

    it('starts up', async () => {
        const { webSocket, streams } = await main({
            binanceEnv: 'test',
            cacheInstance: cache,
            dbInstance: db,
            producerInstance,
            quoteReceivedTopic,
            SchemaRegistryClass: SchemaRegistryMock,
            spotApiProps,
            streamProps,
            webSocketProps,
        });
        await streams.close();
        await webSocket.close();
    });
});
