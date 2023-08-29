import BinanceWebSocket from 'src/integrations/binance/websocket/BinanceWebSocket';
import BinanceWebSocketTestnet from 'src/integrations/binance/websocket/BinanceWebSocketTestnet';
import BinanceStream from 'src/integrations/binance/streams/BinanceStream';

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

export const connectStreams = async (streamProps = {}, connectorProps = {}) => {
    const streams = new BinanceStream(streamProps, connectorProps);
    await streams.connect();
    return streams;
};
