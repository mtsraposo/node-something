import WebSocketSupervisor from '../clients/WebSocketSupervisor.js';
import { BINANCE_WEBSOCKET_API_URL, BINANCE_WEBSOCKET_STREAM_URL } from './constants.js';
import { v4 as uuidv4 } from 'uuid';

class BinanceWebSocketSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, streamNames) {
        super(WebSocketClass);
        this.pingId = null;
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
        try {
            this.webSocketStreams.close();
        } catch (e) {
            console.warn('Failed to close websocket streams connection with error ', e);
        }
    }

    closeWebSocketConnection() {
        try {
            this.webSocket.close();
        } catch (e) {
            console.error('Failed to close websocket connection with error ', e);
        }
    }

    checkConnectivity() {
        this.pingId = uuidv4();
        const payload = {
            'id': this.pingId,
            'method': 'ping',
        };

        this.webSocket.send(JSON.stringify(payload));
    }
}

export default BinanceWebSocketSupervisor;