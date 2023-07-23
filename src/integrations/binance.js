import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';
import { BINANCE_STREAMS } from './constants.js';
import WebSocket from 'ws';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor(WebSocketClass = WebSocket, streamNames = BINANCE_STREAMS) {
        super(WebSocketClass, streamNames);
        this.on('ws-connected', url => {
            // TODO: store connection_established_at timestamp. Connections are dropped after 24 hours.
            console.log(`Connected to Binance WebSocket at url: ${url}`);
        });

        this.on('ws-message', message => {
            // console.info('Received message ', message);
            this.handleMessage(message);
        });

        this.on('ws-error', error => {
            console.error('Received error from websocket: ', error);
        });

        this.on('ws-close', () => {
            console.info('WebSocket connection closed');
        });
    }

    handleMessage(message) {
        if (this.pingId && message.id === this.pingId) {
            this.emit('ws-pong');
        } else {
            this.handleTickerUpdate(message.data);
        }
    }

    handleTickerUpdate(data) {
        const { s: symbol, c: lastPrice } = data;
        console.log('Received ticker update:', symbol, lastPrice);
    }
}

export default BinanceWebSocket;
