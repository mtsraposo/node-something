const TradingBot = require('./strategies/tradingBot');
const Binance = require('./integrations/binance');

const bot = new TradingBot();
bot.start();

const binance = new Binance();
binance.connectWebSocket();
binance.fetchLatestPrice();