import WebSocket from 'ws';
import BinanceStreamSupervisor from './BinanceStreamSupervisor.js';
import { BINANCE_STREAMS } from './constants.js';
import logger from '#root/src/logger.js';
import { env } from '#root/src/env.js';

class BinanceStream extends BinanceStreamSupervisor {
    constructor({
        WebSocketClass = WebSocket,
        apiKey = env.binance.apiKey,
        privateKeyPath = env.binance.privateKeyPath,
        streamNames = BINANCE_STREAMS,
        keepAlive = true,
    }) {
        super({ WebSocketClass, apiKey, privateKeyPath, streamNames, keepAlive });

        this.addEventListeners();
    }

    addEventListeners() {
        [this.stream, this.userDataStream, this.binanceWebSocket].forEach((webSocket) => {
            webSocket.on('ws-message', (message) => {
                this.handleMessage(message);
            });

            webSocket.on('ws-error', (error) => {
                logger.error('Received error from stream: ', error);
            });
        });
    }

    handleMessage(message) {
        if (message?.stream) {
            this.handlePayload(message.data);
        } else if (message?.e) {
            this.handlePayload(message);
        } else {
            logger.error(`Received unknown message type ${JSON.stringify(message)}`);
        }
    }

    handlePayload(payload) {
        if (payload?.e?.includes('Ticker')) {
            this.handleTickerUpdate(payload);
        } else {
            logger.error(`Received unknown stream payload ${JSON.stringify(payload)}`);
        }
    }

    handleTickerUpdate(data) {
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        logger.info('- Received ticker update');
        logger.info('--- ', eventType, symbol, lastPrice, averagePrice);
    }
}

export default BinanceStream;
