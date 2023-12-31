import { env } from 'src/env';

const BINANCE_SPOT_API_URLS = new Map([
    ['production', 'https://api.binance.com/api/v3'],
    ['development', 'https://testnet.binance.vision/api/v3'],
]);
export const BINANCE_SPOT_API_URL = BINANCE_SPOT_API_URLS.get(env.binance.env || 'development');

export const HTTP_PATHS_TO_METHODS = new Map([
    ['post.order', 'order.place'],
    ['post.userDataStream', 'userDataStream.start'],
    ['get.ping', 'ping'],
    ['get.account', 'account.status'],
]);
