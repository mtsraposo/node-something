import { config } from 'dotenv';
import BinanceTrader from './integrations/binanceTrader.js';
import BinanceWebSocket from './integrations/binance.js';

config();

const binance = new BinanceWebSocket();
await binance.connectWebSocketStreams();
await binance.connectWebSocket();
binance.checkConnectivity();

const bot = new BinanceTrader(binance);
bot.start();