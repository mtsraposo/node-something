import WebSocketSupervisor from '#root/src/clients/WebSocketSupervisor.js';
import BinanceWebSocket from '#root/src/integrations/binance/websocket/BinanceWebSocket.js';
import { serializePrivateKey } from '#root/src/models/requests/auth.js';

import { BINANCE_WEBSOCKET_STREAM_URL } from './constants.js';

class BinanceStreamSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, apiKey, privateKeyPath, streamNames) {
        super(WebSocketClass);
        this.apiKey = apiKey;
        this.privateKeyPath = privateKeyPath;
        this.streamNames = streamNames;

        this.privateKey = serializePrivateKey(privateKeyPath);
        this.binanceWebSocket = null;
        this.stream = null;
        this.userDataStream = null;
    }

    async connect() {
        await this.connectWebSocket();
        const { connectionPromise } = this.startUserDataStream();
        await connectionPromise;
        await this.connectStreams();
    }

    async connectByUid(uid) {
        switch (uid) {
            case (this.stream?.uid):
                await this.connectStreams();
                break;
            case (this.userDataStream?.uid):
                const { connectionPromise } = this.startUserDataStream();
                await connectionPromise;
                break;
            case (this.binanceWebSocket?.uid):
                await this.connectWebSocket();
                break;
            default:
                console.warn(`WebSocket with UID: ${uid} not found for connection.`);
                break;
        }
    }

    async close() {
        await this.stream?.close();
        await this.userDataStream?.close();
        await this.binanceWebSocket?.close();
    }

    connectStreams() {
        if (this.stream?.readyState === this.WebSocketClass.OPEN) {
            return Promise.resolve('Already connected');
        }
        const streamParams = this.streamNames.join('/');
        this.stream = this.setupWebSocket(`${BINANCE_WEBSOCKET_STREAM_URL}?streams=${streamParams}`);
        return this.connectionPromise();
    }

    connectWebSocket() {
        if (this.binanceWebSocket?.readyState === this.WebSocketClass.OPEN) {
            return Promise.resolve('Already connected');
        }
        this.binanceWebSocket = new BinanceWebSocket(
            this.WebSocketClass,
            this.apiKey,
            this.privateKeyPath,
            false,
        );
        return this.binanceWebSocket.connect();
    }

    startUserDataStream() {
        const requestId = this.binanceWebSocket.send('userDataStream.start', { apiKey: this.apiKey }, false);
        return {
            requestId: requestId,
            connectionPromise: this.userDataStreamPromise(),
        };
    }

    userDataStreamPromise() {
        return new Promise((resolve) => {
            this.binanceWebSocket.on('listen-key-ready', listenKey => {
                resolve(listenKey);
            });
        }).then((listenKey) => {
            return this.connectUserDataStream(listenKey);
        }).then(() => {
            return 'connected';
        });
    }

    connectUserDataStream(listenKey) {
        this.listenKey = listenKey;
        this.userDataStream = this.setupWebSocket(`${BINANCE_WEBSOCKET_STREAM_URL}?streams=${this.listenKey}`);
        return this.connectionPromise();
    }
}

export default BinanceStreamSupervisor;