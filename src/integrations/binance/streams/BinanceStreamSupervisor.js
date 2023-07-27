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

    connectStreams() {
        if (this.stream?.readyState === this.WebSocketClass.OPEN) {
            return new Promise(() => 'Already connected');
        }
        const streamParams = this.streamNames.join('/');
        this.stream = this.setupWebSocket(`${BINANCE_WEBSOCKET_STREAM_URL}?streams=${streamParams}`);
        return this.connectionPromise();
    }

    connectWebSocket() {
        if (this.binanceWebSocket?.readyState === this.WebSocketClass.OPEN) {
            return new Promise(() => 'Already connected');
        }
        this.binanceWebSocket = new BinanceWebSocket(
            this.WebSocketClass,
            this.apiKey,
            this.privateKeyPath,
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

    close() {
        this.stream?.close();
        this.userDataStream?.close();
        this.binanceWebSocket?.close();
    }
}

export default BinanceStreamSupervisor;