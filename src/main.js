import { config } from 'dotenv';
import BinanceWebSocket from './integrations/binance/websocket/BinanceWebSocket.js';
import BinanceStream from './integrations/binance/streams/BinanceStream.js';
import { BINANCE_WEBSOCKET_API_URL } from '#root/src/integrations/binance/websocket/constants.js';
import BinanceStreamTestnet from '#root/src/integrations/binance/streams/BinanceStreamSupervisorTestnet.js';
import { env } from '#root/src/env.js';

config();

const webSocket = new BinanceWebSocket(BINANCE_WEBSOCKET_API_URL);
let streams;
if (env.binance.env === 'test') {
    streams = new BinanceStreamTestnet({});
} else {
    streams = new BinanceStream({});
}

await webSocket.connect();
await streams.connect();

webSocket.ping();
