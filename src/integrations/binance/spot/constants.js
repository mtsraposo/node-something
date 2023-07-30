const BINANCE_SPOT_API_URLS = new Map([
    ['prod', 'https://api.binance.com/api/v3'],
    ['test', 'https://testnet.binance.vision/api/v3'],
]);
export const BINANCE_SPOT_API_URL = BINANCE_SPOT_API_URLS.get(process.env.BINANCE_ENV || 'test');

export const HTTP_PATHS_TO_METHODS = new Map([
    ['post.order', 'order.place'],
    ['post.userDataStream', 'userDataStream.start'],
    ['get.ping', 'ping'],
    ['get.account/status', 'account.status'],
]);

export const HTTP_VERBS = new Set([]);
