import WebSocket from 'ws';
import BinanceStreamSupervisor from './BinanceStreamSupervisor.js';
import { BINANCE_STREAMS } from './constants.js';

class BinanceStream extends BinanceStreamSupervisor {
    constructor(
        WebSocketClass = WebSocket,
        apiKey = process.env.BINANCE_API_KEY,
        privateKeyPath = process.env.PRIVATE_KEY_PATH,
        streamNames = BINANCE_STREAMS,
        keepAlive = true,
    ) {
        super(WebSocketClass, apiKey, privateKeyPath, streamNames, keepAlive);

        this.addEventListeners();
    }

    addEventListeners() {
        [this.stream, this.userDataStream, this.binanceWebSocket].forEach((webSocket) => {
            webSocket.addConnectionEventListeners();

            webSocket.on('ws-message', (message) => {
                this.handleMessage(message);
            });

            webSocket.on('ws-error', (error) => {
                console.error('Received error from stream: ', error);
            });
        });
    }

    handleMessage(message) {
        if (message?.stream) {
            this.handlePayload(message.data);
        } else if (message?.e) {
            this.handlePayload(message);
        } else {
            console.error(`Received unknown message type ${JSON.stringify(message)}`);
        }
    }

    handlePayload(payload) {
        if (payload?.e?.includes('Ticker')) {
            this.handleTickerUpdate(payload);
        } else {
            console.error(`Received unknown stream payload ${JSON.stringify(payload)}`);
        }
    }

    handleTickerUpdate(data) {
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        console.info('- Received ticker update');
        console.info('--- ', eventType, symbol, lastPrice, averagePrice);
    }
}

export default BinanceStream;
