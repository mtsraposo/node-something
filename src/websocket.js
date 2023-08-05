import { env } from 'config/env';
import BinanceWebSocket from 'src/integrations/binance/websocket/BinanceWebSocket';
import BinanceWebSocketTestnet from 'src/integrations/binance/websocket/BinanceWebSocketTestnet';
import BinanceStream from 'src/integrations/binance/streams/BinanceStream';

export const connectWebSocket = async () => {
    let webSocket;
    if (env.binance.env === 'prod') {
        webSocket = new BinanceWebSocket({});
    } else {
        webSocket = new BinanceWebSocketTestnet({});
    }
    await webSocket.connect();
    return webSocket;
};

export const connectStreams = async () => {
    const streams = new BinanceStream({});
    await streams.connect();
    return streams;
};
