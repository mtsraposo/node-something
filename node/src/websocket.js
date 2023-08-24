import BinanceWebSocket from 'src/integrations/binance/websocket/BinanceWebSocket';
import BinanceWebSocketTestnet from 'src/integrations/binance/websocket/BinanceWebSocketTestnet';
import BinanceStream from 'src/integrations/binance/streams/BinanceStream';
import { producer } from 'src/connectors/kafka';
import { registry } from 'src/connectors/kafka/registry';

export const connectWebSocket = async ({ binanceEnv, spotApiProps = {}, webSocketProps = {} }) => {
    let webSocket;
    if (binanceEnv === 'production') {
        webSocket = new BinanceWebSocket(webSocketProps);
    } else {
        webSocket = new BinanceWebSocketTestnet({ spotApiProps, webSocketProps });
    }
    await webSocket.connect();
    return webSocket;
};

export const connectStreams = async (
    streamProps = {},
    connectorProps = {
        producerInstance: producer,
        quoteReceivedTopic: env.kafka.quoteReceivedTopic,
        registryInstance: registry,
        schemas: { timeKeySchemaId: 1, quoteValueSchemaId: 2 },
    },
) => {
    const streams = new BinanceStream(streamProps, connectorProps);
    await streams.connect();
    return streams;
};
