import EventEmitter from 'events';
import { serializePrivateKey } from './utils.js';
import BinanceRequest from '../models/requests/BinanceRequest.js';

class BinanceTrader extends EventEmitter {
    constructor(binance,
                apiKey = process.env.BINANCE_API_KEY,
                privateKeyPath = process.env.PRIVATE_KEY_PATH) {
        super();
        this.binance = binance;
        this.apiKey = apiKey;
        this.privateKey = serializePrivateKey(privateKeyPath);
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

    placeOrder(params) {
        const request = new BinanceRequest(this.apiKey, this.privateKey, 'order.place', params);
        if (!request.isValid) {
            this.handleErrors(request);
            return;
        }
        this.binance.webSocket.send(JSON.stringify(request.body));
    }

    handleErrors(request) {
        console.error(`Order placement failed with errors`);
        request.errors.forEach(error => {
            const [field, errorType, value] = error;
            console.error(`Field: ${field}, Error Type: ${errorType}, Value: ${value}`);
        });
    }
}

export default BinanceTrader;
