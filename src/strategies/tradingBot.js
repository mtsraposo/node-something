const EventEmitter = require('events');

class TradingBot extends EventEmitter {
    constructor() {
        super();
    }

    start() {
        this.on('marketUpdate', this.handleMarketUpdate);
        this.on('tradeSignal', this.handleTradeSignal);
    }

    handleMarketUpdate(data) {
        console.log('Received market update:', data);
    }

    handleTradeSignal(signal) {
        console.log('Received trade signal:', signal);
    }
}

module.exports = TradingBot;
