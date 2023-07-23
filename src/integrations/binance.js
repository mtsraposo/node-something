import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';
import { BINANCE_STREAMS } from './constants.js';
import WebSocket from 'ws';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor(WebSocketClass = WebSocket, streamNames = BINANCE_STREAMS) {
        super(WebSocketClass, streamNames);
        this.on('connected', url => {
            // TODO: store connection_established_at timestamp. Connections are dropped after 24 hours.
            console.log(`Connected to Binance WebSocket at url: ${url}`);
        });

        this.on('message', message => {
            this.handleMessage(message);
        });

        this.on('error', error => {
            this.emit('error', error);
        });

        this.on('close', () => {
            this.emit('close');
        });
    }

    handleMessage(message) {
        if (this.pingId && message.id === this.pingId) {
            this.emit('pong');
        } else {
            this.handleTickerUpdate(message);
        }
    }

    handleTickerUpdate(message) {
        const { s: symbol, c: lastPrice } = message;
        console.log('Received ticker update:', symbol, lastPrice);
    }
}

export default BinanceWebSocket;
