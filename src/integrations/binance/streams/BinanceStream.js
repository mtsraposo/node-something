import WebSocket from 'ws';
import BinanceStreamSupervisor from './BinanceStreamSupervisor';
import { BINANCE_STREAMS, BINANCE_WEBSOCKET_STREAM_URL } from './constants';
import logger from 'src/logger';
import { env } from 'src/env';
import util from 'util';
import { BINANCE_WEBSOCKET_API_URL } from 'src/integrations/binance/websocket/constants';

class BinanceStream extends BinanceStreamSupervisor {
    constructor({
        WebSocketClass = WebSocket,
        auth = env.binance.auth.ed25519,
        streamNames = BINANCE_STREAMS,
        urls = { webSocket: BINANCE_WEBSOCKET_API_URL, stream: BINANCE_WEBSOCKET_STREAM_URL },
        keepAlive = true,
    }) {
        super({ WebSocketClass, auth, streamNames, urls, keepAlive });

        this.addEventListeners();
    }

    addEventListeners() {
        [this.stream, this.userDataStream].forEach((stream) => {
            stream.on('ws-message', (message) => {
                this.handleMessage(message);
            });

            stream.on('ws-error', (error) => {
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
            logger.error(`Received unknown message type ${util.inspect(message)}`);
        }
    }

    handlePayload(payload) {
        if (payload?.e?.includes('Ticker')) {
            this.handleTickerUpdate(payload);
        } else if (payload?.e === 'executionReport') {
            this.handleExecutionReport(payload);
        } else if (payload?.e === 'outboundAccountPosition') {
            this.handleOutboundAccountPosition(payload);
        } else {
            logger.error(`Received unknown stream payload ${util.inspect(payload)}`);
        }
    }

    handleTickerUpdate(data) {
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        logger.info('- Received ticker update');
        logger.info('--- ', eventType, symbol, lastPrice, averagePrice);
    }

    handleExecutionReport(data) {
        const {
            e: eventType,
            s: symbol,
            c: clientOrderId,
            o: orderType,
            q: orderQuantity,
            p: orderPrice,
            i: orderId,
        } = data;
        logger.info(
            `Received execution report`,
            eventType,
            symbol,
            clientOrderId,
            orderType,
            orderQuantity,
            orderPrice,
            orderId,
        );
    }

    handleOutboundAccountPosition(payload) {
        const { B: balances } = payload;
        logger.info('Received outbound account position', util.inspect(balances));
    }
}

export default BinanceStream;
