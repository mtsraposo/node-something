import WebSocketSupervisor from '#root/src/clients/WebSocketSupervisor.js';

import { BINANCE_WEBSOCKET_STREAM_URL } from './constants.js';
import { BINANCE_WEBSOCKET_API_URL } from '#root/src/integrations/binance/websocket/constants.js';
import BinanceWebSocketSupervisor from '#root/src/integrations/binance/websocket/BinanceWebSocketSupervisor.js';
import BinanceWebSocket from '#root/src/integrations/binance/websocket/BinanceWebSocket.js';
import logger from '#root/src/logger.js';

class BinanceStreamSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, apiKey, privateKeyPath, streamNames, keepAlive) {
        super(WebSocketClass);
        this.apiKey = apiKey;
        this.privateKeyPath = privateKeyPath;
        this.streamNames = streamNames;
        this.keepAlive = keepAlive;

        this.initializeStreams();
    }

    initializeStreams() {
        this.binanceWebSocket = new BinanceWebSocket(
            BINANCE_WEBSOCKET_API_URL,
            this.WebSocketClass,
            this.apiKey,
            this.privateKeyPath,
            this.keepAlive,
        );
        this.stream = new BinanceWebSocketSupervisor(
            `${BINANCE_WEBSOCKET_STREAM_URL}?streams=${this.streamNames.join('/')}`,
            this.WebSocketClass,
            this.apiKey,
            this.privateKeyPath,
            this.keepAlive,
        );
        this.userDataStream = new BinanceWebSocketSupervisor(
            `${BINANCE_WEBSOCKET_STREAM_URL}?streams=${this.listenKey}`,
            this.WebSocketClass,
            this.apiKey,
            this.privateKeyPath,
            this.keepAlive,
        );
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
            { apiKey: this.apiKey },
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
            return this.userDataStream.connect();
        }
        return Promise.reject(new Error('missing listen key'));
    }
}

export default BinanceStreamSupervisor;
