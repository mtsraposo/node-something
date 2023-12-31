import WebSocketSupervisor from 'src/clients/WebSocketSupervisor';
import BinanceWebSocketSupervisor from 'src/integrations/binance/websocket/BinanceWebSocketSupervisor';
import BinanceWebSocket from 'src/integrations/binance/websocket/BinanceWebSocket';
import { logger } from 'src/logger';

class BinanceStreamSupervisor extends WebSocketSupervisor {
    constructor({
        WebSocketClass,
        auth,
        streamNames,
        urls: { webSocket: webSocketUrl, stream: streamUrl },
        keepAlive,
    }) {
        super(WebSocketClass);
        this.auth = auth;
        this.streamNames = streamNames;
        this.webSocketUrl = webSocketUrl;
        this.streamUrl = streamUrl;
        this.keepAlive = keepAlive;

        this.binanceWebSocket = null;
        this.stream = null;
        this.userDataStream = null;
        this.initializeStreams();
    }

    initializeStreams() {
        [
            ['binanceWebSocket', BinanceWebSocket, this.webSocketUrl],
            [
                'stream',
                BinanceWebSocketSupervisor,
                `${this.streamUrl}?streams=${this.streamNames.join('/')}`,
            ],
            [
                'userDataStream',
                BinanceWebSocketSupervisor,
                `${this.streamUrl}?streams=${this.listenKey}`,
            ],
        ].forEach(([property, BinanceWebSocketClass, url]) => {
            this[property] = new BinanceWebSocketClass({
                url,
                WebSocketClass: this.WebSocketClass,
                auth: this.auth,
                keepAlive: this.keepAlive,
            });
        });
    }

    async connect() {
        await this.binanceWebSocket.connect();
        await this.startUserDataStream().connectionPromise;
        await this.stream.connect();
    }

    async connectByUid(uid) {
        switch (uid) {
            case this.stream.uid:
                await this.stream.connect();
                break;
            case this.userDataStream.uid:
                await this.startUserDataStream()?.connectionPromise;
                break;
            case this.binanceWebSocket.uid:
                await this.binanceWebSocket.connect();
                break;
            default:
                logger.warn(`WebSocket with UID: ${uid} not found for connection.`);
                break;
        }
    }

    async close() {
        await this.stream.close();
        await this.userDataStream.close();
        await this.binanceWebSocket.close();
    }

    startUserDataStream() {
        const requestId = this.binanceWebSocket.send(
            'userDataStream.start',
            { apiKey: this.auth.apiKey },
            false,
        );
        return {
            requestId,
            connectionPromise: this.userDataStreamPromise(),
        };
    }

    userDataStreamPromise() {
        return new Promise((resolve) => {
            this.binanceWebSocket.on('listen-key-ready', (listenKey) => {
                resolve(listenKey);
            });
        })
            .then((listenKey) => {
                return this.connectUserDataStream(listenKey);
            })
            .then(() => {
                return 'connected';
            })
            .catch((error) => {
                logger.error(`Failed to start user data stream with error ${error}`);
                return error;
            });
    }

    connectUserDataStream(listenKey) {
        if (listenKey) {
            this.listenKey = listenKey;
            this.userDataStream.url = `${this.streamUrl}?streams=${this.listenKey}`;
            return this.userDataStream.connect();
        }
        return Promise.reject(new Error('missing listen key'));
    }
}

export default BinanceStreamSupervisor;
