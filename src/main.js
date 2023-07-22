import TradingBot from './strategies/tradingBot.js';
import Binance from './integrations/binance.js';

const bot = new TradingBot();
bot.start();

const binance = new Binance();

await Promise.all(binance.connectWebSocketStreams());
await binance.connectWebSocket();
binance.checkConnectivity();