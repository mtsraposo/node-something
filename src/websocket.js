import { env } from '#root/src/env.js';
import BinanceWebSocket from '#root/src/integrations/binance/websocket/BinanceWebSocket.js';
import BinanceWebSocketTestnet from '#root/src/integrations/binance/websocket/BinanceWebSocketTestnet.js';
import BinanceStream from '#root/src/integrations/binance/streams/BinanceStream.js';

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
