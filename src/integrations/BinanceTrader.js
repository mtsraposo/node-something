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
        console.info('Received market update:', data);
    }

    handleTradeSignal(signal) {
        console.info('Received trade signal:', signal);
    }

    getAccountStatus() {
        this.tryRequest('account.status', {});
    }

    placeOrder(params) {
        this.tryRequest('order.place', params);
    }

    tryRequest(method, params) {
        const request = new BinanceRequest(this.apiKey, this.privateKey, method, params);
        if (!request.isValid) {
            this.handleRequestErrors(request);
            return;
        }
        this.binance.requests.set(request.id, request.body);
        this.binance.webSocket.send(JSON.stringify(request.body));
    }

    handleRequestErrors(request) {
        console.error(`Request failed with errors ${JSON.stringify(request.errors)}`);
    }
}

export default BinanceTrader;
