import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import EventEmitter from 'events';

export const BINANCE_STREAMS = ['btcusdt@ticker'];
export const BINANCE_WEBSOCKET_STREAM_URL = 'wss://testnet.binance.vision/ws';
export const BINANCE_WEBSOCKET_API_URL = 'wss://testnet.binance.vision/ws-api/v3';

class BinanceIntegration extends EventEmitter {
    constructor(WebSocketClass = WebSocket, streamNames = BINANCE_STREAMS) {
        super();

        this.WebSocketClass = WebSocketClass;

        this.pingId = null;

        this.websocket = null;
        this.websocketStreams = {};
        this.streamNames = streamNames;

        this.on('connected', () => {
            // TODO: store connection_established_at timestamp. Connections are dropped after 24 hours.
            console.log('Connected to Binance WebSocket');
        });
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

    setupWebSocket(url) {
        const websocket = new this.WebSocketClass(url);

        websocket.on('open', () => {
            this.emit('connected', url);
        });

        websocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.handleMessage(message);
        });

        websocket.on('error', error => {
            this.emit('error', error);
        });

        websocket.on('close', (_closeEvent, _reason) => {
            this.emit('close');
        });

        return websocket;
    }

    connectionPromise() {
        return new Promise((resolve, _reject) => {
            this.once('connected', () => {
                resolve('connected');
            });
        });
    }

    closeWebsocketStreamConnections() {
        Object.values(this.websocketStreams).forEach(ws => ws.close());
    }

    closeWebSocketConnection() {
        if (this.websocket) {
            this.websocket.close();
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

    handleMessage(message) {
        if (this.pingId && message.id === this.pingId) {
            console.log('Received pong: ', message);
        } else {
            this.handleTickerUpdate(message);
        }
    }

    handleTickerUpdate(message) {
        const { s: symbol, c: lastPrice } = message;
        console.log('Received ticker update:', symbol, lastPrice);
    }
}

export default BinanceIntegration;
