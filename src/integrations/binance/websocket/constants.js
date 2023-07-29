const BINANCE_WEBSOCKET_API_URLS = new Map([
    ['prod', 'wss://ws-api.binance.com:443/ws-api/v3'],
    ['test', 'wss://testnet.binance.vision/ws-api/v3'],
]);

export const BINANCE_WEBSOCKET_API_URL = BINANCE_WEBSOCKET_API_URLS.get(
    process.env.BINANCE_ENV || 'test',
);
