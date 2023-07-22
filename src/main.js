import TradingBot from './strategies/tradingBot.js';
import Binance from './integrations/binance.js';

const bot = new TradingBot();
bot.start();

const binance = new Binance();

binance.on('connected', () => {
    console.log('Connected to Binance WebSocket');
});

binance.connectWebSocket();
binance.fetchLatestPrice();