import WebSocket from 'ws';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

import BinanceStreamSupervisor from './BinanceStreamSupervisor';
import { BINANCE_STREAMS, BINANCE_WEBSOCKET_STREAM_URL } from './constants';
import { logger } from 'src/logger';
import { env } from 'src/env';
import util from 'util';
import { BINANCE_WEBSOCKET_API_URL } from 'src/integrations/binance/websocket/constants';
import { produceMessage, producer } from 'src/connectors/kafka';
import { connectRegistry } from 'src/connectors/kafka/registry';

class BinanceStream extends BinanceStreamSupervisor {
    constructor(
        {
            auth = env.binance.auth.ed25519,
            keepAlive = true,
            streamNames = BINANCE_STREAMS,
            urls = { webSocket: BINANCE_WEBSOCKET_API_URL, stream: BINANCE_WEBSOCKET_STREAM_URL },
            WebSocketClass = WebSocket,
        },
        {
            producerInstance = producer,
            quoteReceivedTopic = env.kafka.quoteReceivedTopic,
            SchemaRegistryClass = SchemaRegistry,
            schemas = { timeKeySchemaId: 1, quoteValueSchemaId: 2 },
        },
    ) {
        super({ WebSocketClass, auth, streamNames, urls, keepAlive });

        this.schemas = schemas;
        this.producerInstance = producerInstance;
        this.registryinstance = connectRegistry(SchemaRegistryClass);
        this.quoteReceivedTopic = quoteReceivedTopic;
        this.addEventListeners();
    }

    addEventListeners() {
        [this.stream, this.userDataStream].forEach((stream) => {
            stream.on('ws-message', async (message) => {
                await this.handleMessage(message);
            });

            stream.on('ws-error', (error) => {
                logger.error('Received error from stream: ', error);
            });
        });
    }

    async handleMessage(message) {
        if (message?.stream) {
            await this.handlePayload(message.data);
        } else if (message?.e) {
            await this.handlePayload(message);
        } else {
            logger.error(`Received unknown message type ${util.inspect(message)}`);
        }
    }

    async handlePayload(payload) {
        if (payload?.e?.includes('Ticker')) {
            await this.handleTickerUpdate(payload);
        } else if (payload?.e === 'executionReport') {
            this.handleExecutionReport(payload);
        } else if (payload?.e === 'outboundAccountPosition') {
            this.handleOutboundAccountPosition(payload);
        } else {
            logger.error(`Received unknown stream payload ${util.inspect(payload)}`);
        }
    }

    async handleTickerUpdate(data) {
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        await this.persistQuote({ symbol, lastPrice });
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

    async persistQuote({ symbol, lastPrice }) {
        try {
            const { timeKeySchemaId, quoteValueSchemaId } = this.schemas;
            const time = +new Date();
            await produceMessage({
                key: { time },
                producerInstance: this.producerInstance,
                registryInstance: this.registryinstance,
                schema: { timeKeySchemaId, quoteValueSchemaId },
                topic: this.quoteReceivedTopic,
                value: {
                    time,
                    symbol,
                    price: +lastPrice,
                },
            });
            logger.info(`Successfully produced message to topic ${this.quoteReceivedTopic}`);
        } catch (e) {
            logger.error('Error persisting quote', e);
        }
    }
}

export default BinanceStream;
