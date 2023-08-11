import { env } from 'src/env';

const BINANCE_WEBSOCKET_STREAM_URLS = new Map([
    ['production', 'wss://stream.binance.com:9443/stream'],
    ['development', 'wss://testnet.binance.vision/stream'],
]);

export const BINANCE_STREAMS = ['btcusdt@ticker_1h', 'btcusdt@ticker_4h'];
export const BINANCE_WEBSOCKET_STREAM_URL = BINANCE_WEBSOCKET_STREAM_URLS.get(
    env.binance.env || 'development',
);
