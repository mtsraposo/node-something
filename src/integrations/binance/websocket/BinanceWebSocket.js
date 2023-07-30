import WebSocket from 'ws';
import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor(
        url,
        WebSocketClass = WebSocket,
        apiKey = process.env.BINANCE_API_KEY,
        privateKeyPath = process.env.PRIVATE_KEY_PATH,
        keepAlive = true,
    ) {
        super(url, WebSocketClass, apiKey, privateKeyPath, keepAlive);

        this.addEventListeners();
    }

    addEventListeners() {
        this.on('ws-message', (message) => {
            this.handleMessage(message);
        });

        this.on('ws-error', (error) => {
            console.error('Received error from websocket: ', error);
        });
    }

    handleMessage(message) {
        const outgoingRequest = this.requests.get(message.id);
        if (outgoingRequest) {
            this.handleResponse(outgoingRequest, message);
        } else {
            console.error(`Received unknown message type ${JSON.stringify(message)}`);
        }
    }

    handleResponse(request, response) {
        switch (request.method) {
            case 'ping':
                this.emit('ws-pong');
                break;
            case 'account.status':
                break;
            case 'userDataStream.start':
                this.listenKey = response?.result?.listenKey;
                this.emit('listen-key-ready', this.listenKey);
                break;
            case 'order.place':
                break;
            default:
                console.warn(`Received response for unknown request method ${request.method}`);
        }
    }
}

export default BinanceWebSocket;
