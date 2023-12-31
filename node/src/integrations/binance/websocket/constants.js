import { env } from 'src/env';

const BINANCE_WEBSOCKET_API_URLS = new Map([
    ['production', 'wss://ws-api.binance.com:443/ws-api/v3'],
    ['development', 'wss://testnet.binance.vision/ws-api/v3'],
]);

export const BINANCE_WEBSOCKET_API_URL = BINANCE_WEBSOCKET_API_URLS.get(
    env.binance.env || 'development',
);
