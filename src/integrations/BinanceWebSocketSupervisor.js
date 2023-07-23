import WebSocketSupervisor from '../clients/WebSocketSupervisor.js';
import { BINANCE_WEBSOCKET_API_URL, BINANCE_WEBSOCKET_STREAM_URL } from './constants.js';
import { v4 as uuidv4 } from 'uuid';

class BinanceWebSocketSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, streamNames) {
        super(WebSocketClass);
        this.pingId = null;
        this.websocket = null;
        this.websocketStreams = {};
        this.streamNames = streamNames;
    }

    // TODO: send unsolicited pong frames to avoid disconnection
    connectWebSocket() {
        this.websocket = this.setupWebSocket(BINANCE_WEBSOCKET_API_URL);
        return this.connectionPromise();
    }

    connectWebSocketStreams() {
        return this.streamNames.map(stream => {
            return this.connectWebSocketStream(stream);
        });
    }

    connectWebSocketStream(stream) {
        const url = `${BINANCE_WEBSOCKET_STREAM_URL}/${stream}`;
        this.websocketStreams[url] = this.setupWebSocket(url);
        return this.connectionPromise();
    }

    connectionPromise() {
        return new Promise((resolve, _reject) => {
            this.once('connected', () => {
                resolve('connected');
            });
        });
    }

    closeWebSocketStreamConnections() {
        Object.values(this.websocketStreams).forEach(ws => {
            try {
                ws.close();
            } catch (e) {
                console.warn('Failed to close websocket connection with error ', e);
            }
        });
    }

    closeWebSocketConnection() {
        try {
            this.websocket.close();
        } catch (e) {
            console.warn('Failed to close websocket connection with error ', e);
        }
    }

    checkConnectivity() {
        this.pingId = uuidv4();
        const payload = {
            'id': this.pingId,
            'method': 'ping',
        };

        this.websocket.send(JSON.stringify(payload));
    }
}

export default BinanceWebSocketSupervisor;