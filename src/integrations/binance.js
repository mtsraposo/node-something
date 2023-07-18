const axios = require('axios');
const WebSocket = require('websocket').w3cwebsocket;

const BINANCE_API_URL = 'https://testnet.binance.vision/api/v3';

class BinanceIntegration {
    constructor() {
        this.websocket = null;
    }

    async connectWebSocket() {
        const websocketUrl = 'wss://testnet.binance.vision/ws/btcusdt@ticker';
        this.websocket = new WebSocket(websocketUrl);

        this.websocket.onopen = () => {
            console.log('Connected to Binance WebSocket');
        };

        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleTickerUpdate(message);
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.websocket.onclose = () => {
            console.log('WebSocket connection closed');
        };
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

module.exports = BinanceIntegration;
