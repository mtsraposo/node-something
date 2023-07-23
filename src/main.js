import TradingBot from './strategies/tradingBot.js';
import BinanceWebSocket from './integrations/binance.js';

const bot = new TradingBot();
bot.start();

const binance = new BinanceWebSocket();

await binance.connectWebSocketStreams();
await binance.connectWebSocket();
binance.checkConnectivity();