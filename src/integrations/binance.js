import WebSocket from 'ws';
import axios from "axios";

const BINANCE_API_URL = 'https://testnet.binance.vision/api/v3';
const BINANCE_WEBSOCKET_URL = 'wss://testnet.binance.vision/ws/btcusdt@ticker';

class BinanceIntegration {
    constructor() {
        this.websocket = null;
    }

    async connectWebSocket() {
        this.websocket = new WebSocket(BINANCE_WEBSOCKET_URL);

        this.websocket.on('open', () => {
            console.log('Connected to Binance WebSocket');
        });

        this.websocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.handleTickerUpdate(message);
        });

        this.websocket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        this.websocket.on('close', (_code, _reason) => {
            console.log('WebSocket connection closed');
        });
    }

    async fetchLatestPrice() {
        // Fetch the latest price of BTC/USDT from Binance REST API
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
        // Handle ticker updates received from the WebSocket stream
        console.log('Received message', message);
        const {s: symbol, c: lastPrice} = message;
        console.log('Received ticker update:', symbol, lastPrice);

        // Emit a signal or trigger any necessary trading logic based on the update
    }
}

export default BinanceIntegration;
