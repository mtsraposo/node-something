import { config } from 'dotenv';
import BinanceWebSocket from './integrations/binance/websocket/BinanceWebSocket.js';
import BinanceStream from './integrations/binance/streams/BinanceStream.js';

config();

const webSocket = new BinanceWebSocket();
const streams = new BinanceStream();
await webSocket.connect();
await streams.connect();
webSocket.checkConnectivity();