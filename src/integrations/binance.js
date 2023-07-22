import WebSocket from 'ws';
import axios from 'axios';
import EventEmitter from 'events';

export const BINANCE_API_URL = 'https://testnet.binance.vision/api/v3';
export const BINANCE_WEBSOCKET_URL = 'wss://testnet.binance.vision/ws/btcusdt@ticker';

class BinanceIntegration extends EventEmitter {
    constructor(WebSocketClass = WebSocket) {
        super();
        this.websocket = null;
        this.WebSocketClass = WebSocketClass;
    }

    async connectWebSocket() {
        this.websocket = new this.WebSocketClass(BINANCE_WEBSOCKET_URL);

        this.websocket.on('open', () => {
            this.emit('connected');
        });

        this.websocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.handleTickerUpdate(message);
        });

        this.websocket.on('error', error => {
            this.emit('error', error);
        });

        this.websocket.on('close', (_closeEvent, _reason) => {
            this.emit('close');
        });

        return new Promise((resolve, _reject) => {
            this.on('connected', () => {
                resolve('connected');
            });
        });
    }

    closeWebsocket() {
        if (this.websocket) {
            this.websocket.close();
        }
    }

    async fetchLatestPrice() {
        const response = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
            params: {
                symbol: 'BTCUSDT',
            },
        });

        const price = response.data.price;
        console.log('Latest BTC/USDT price:', price);

        return price;
    }

    handleTickerUpdate(message) {
        const { s: symbol, c: lastPrice } = message;
        console.log('Received ticker update:', symbol, lastPrice);
    }
}

export default BinanceIntegration;
