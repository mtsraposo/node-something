import WebSocketSupervisor from '../clients/WebSocketSupervisor.js';
import { BINANCE_WEBSOCKET_API_URL, BINANCE_WEBSOCKET_STREAM_URL } from './constants.js';
import { v4 as uuidv4 } from 'uuid';

class BinanceWebSocketSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, streamNames) {
        super(WebSocketClass);
        // TODO: move to a database?
        this.requests = new Map();
        this.webSocket = null;
        this.webSocketStreams = null;
        this.streamNames = streamNames;
    }

    // TODO: send unsolicited pong frames to avoid disconnection
    connectWebSocket() {
        this.webSocket = this.setupWebSocket(BINANCE_WEBSOCKET_API_URL);
        return this.connectionPromise();
    }

    connectWebSocketStreams() {
        const streamParams = this.streamNames.join('/');
        this.webSocketStreams = this.setupWebSocket(`${BINANCE_WEBSOCKET_STREAM_URL}?streams=${streamParams}`);
        return this.connectionPromise();
    }

    connectionPromise() {
        return new Promise((resolve, _reject) => {
            this.on('ws-connected', () => {
                resolve('connected');
            });
        });
    }

    closeWebSocketStreamConnection() {
        if (this.webSocketStreams?.readyState === this.WebSocketClass.OPEN) {
            this.webSocketStreams.close();
        }
        console.info(`The stream connection is not closed. State: ${this.webSocketStreams?.readyState}`);
    }

    closeWebSocketConnection() {
        if (this.webSocket?.readyState === this.WebSocketClass.OPEN) {
            this.webSocket.close();
        }
        console.info(`The websocket connection is not closed. State: ${this.webSocket?.readyState}`);
    }

    checkConnectivity() {
        const id = uuidv4();
        const payload = {
            'id': id,
            'method': 'ping',
        };

        this.requests.set(id, payload);
        this.webSocket.send(JSON.stringify(payload));
    }
}

export default BinanceWebSocketSupervisor;