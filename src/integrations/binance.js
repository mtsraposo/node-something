import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';
import { BINANCE_STREAMS } from './constants.js';
import WebSocket from 'ws';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor(
        WebSocketClass = WebSocket,
        streamNames = BINANCE_STREAMS,
        stayUp = true,
    ) {
        super(WebSocketClass, streamNames);
        this.stayUp = stayUp;
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
            console.warn('WebSocket connection closed');
            if (!this.stayUp) return;
            console.info('Reconnecting...');
            if (this.webSocket?.readyState === WebSocketClass.CLOSED) {
                this.connectWebSocket().then();
            }
            if (this.webSocketStreams?.readyState === WebSocketClass.CLOSED) {
                this.connectWebSocketStreams().then();
            }
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
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        console.log('- Received ticker update');
        console.log('--- ', eventType, symbol, lastPrice, averagePrice);
    }
}

export default BinanceWebSocket;
