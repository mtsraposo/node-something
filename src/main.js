import { config } from 'dotenv';
import BinanceWebSocket from './integrations/binance/websocket/BinanceWebSocket.js';
import BinanceStream from './integrations/binance/streams/BinanceStream.js';
import repl from 'node:repl';
import { env } from '#root/src/env.js';
import BinanceWebSocketTestnet from '#root/src/integrations/binance/websocket/BinanceWebSocketTestnet.js';

config();

let webSocket;
if (env.binance.env === 'prod') {
    webSocket = new BinanceWebSocket({});
} else {
    webSocket = new BinanceWebSocketTestnet({});
}

const streams = new BinanceStream({});

await webSocket.connect();
await streams.connect();

let replServer = repl.start({ prompt: '> ' });
replServer.context.webSocket = webSocket;
replServer.context.streams = streams;

webSocket.getAccountStatus();
webSocket.placeOrder({
    symbol: 'BTCUSDT',
    side: 'BUY',
    type: 'LIMIT',
    timeInForce: 'GTC',
    price: 29240.17,
    quantity: 0.01,
    timestamp: new Date().getTime(),
    newOrderRespType: 'ACK',
});
