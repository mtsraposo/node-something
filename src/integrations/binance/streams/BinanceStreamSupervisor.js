import WebSocketSupervisor from '../../../clients/WebSocketSupervisor.js';
import { BINANCE_WEBSOCKET_STREAM_URL } from './constants.js';
import { serializePrivateKey } from '../../utils.js';
import BinanceWebSocket from '../websocket/BinanceWebSocket.js';

class BinanceStreamSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, apiKey, privateKeyPath, streamNames) {
        super(WebSocketClass);
        this.apiKey = apiKey;
        this.privateKeyPath = privateKeyPath;
        this.streamNames = streamNames;

        this.privateKey = serializePrivateKey(privateKeyPath);
        this.webSocket = null;
        this.stream = null;
        this.userDataStream = null;
    }

    async connect() {
        await this.connectWebSocket();
        this.startUserDataStream();
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
        if (this.webSocket?.readyState === this.WebSocketClass.OPEN) {
            return new Promise(() => 'Already connected');
        }
        this.webSocket = new BinanceWebSocket(
            this.WebSocketClass,
            this.apiKey,
            this.privateKeyPath,
            async listenKey => {
                await this.connectUserDataStream(listenKey);
            },
        );
        return this.webSocket.connect();
    }

    startUserDataStream() {
        this.webSocket.send('userDataStream.start', { apiKey: this.apiKey }, false);
    }

    connectUserDataStream(listenKey) {
        this.listenKey = listenKey;
        this.userDataStream = this.setupWebSocket(`${BINANCE_WEBSOCKET_STREAM_URL}?streams=${this.listenKey}`);
        return this.connectionPromise();
    }

    close() {
        this.stream.close();
        this.userDataStream.close();
        this.webSocket.close();
    }
}

export default BinanceStreamSupervisor;