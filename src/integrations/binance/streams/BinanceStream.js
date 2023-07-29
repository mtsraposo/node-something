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
        super(WebSocketClass, apiKey, privateKeyPath, streamNames);
        this.keepAlive = keepAlive;

        this.addEventListeners();
    }

    addEventListeners() {
        this.on('ws-connected', ([uid, url]) => {
            // TODO: store connection_established_at timestamp. Connections are dropped after 24 hours.
            console.info(
                `Connected to Binance Stream. URL: ${url}. UID: ${uid}`,
            );
        });

        this.on('ws-message', (message) => {
            // TODO: storage
            // TODO: error handling
            this.handleMessage(message);
        });

        this.on('ws-error', (error) => {
            // TODO: error handling
            console.error('Received error from stream: ', error);
        });

        this.on('ws-close', async ([uid, url]) => {
            console.warn(`Stream connection closed. URL: ${url}. UID: ${uid}`);
            if (!this.keepAlive) return;
            console.info('Reconnecting...');
            await this.connectByUid(uid);
        });
    }

    handleMessage(message) {
        if (message?.stream) {
            this.handlePayload(message.data);
        } else if (message?.e) {
            this.handlePayload(message);
        } else {
            console.error(
                `Received unknown message type ${JSON.stringify(message)}`,
            );
        }
    }

    handlePayload(payload) {
        if (payload?.e?.includes('Ticker')) {
            this.handleTickerUpdate(payload);
        } else {
            console.error(
                `Received unknown stream payload ${JSON.stringify(payload)}`,
            );
        }
    }

    handleTickerUpdate(data) {
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        console.info('- Received ticker update');
        console.info('--- ', eventType, symbol, lastPrice, averagePrice);
    }
}

export default BinanceStream;
