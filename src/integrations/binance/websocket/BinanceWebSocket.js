import WebSocket from 'ws';
import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor(
        WebSocketClass = WebSocket,
        apiKey = process.env.BINANCE_API_KEY,
        privateKeyPath = process.env.PRIVATE_KEY_PATH,
        keepAlive = true,
    ) {
        super(WebSocketClass, apiKey, privateKeyPath);
        this.keepAlive = keepAlive;

        this.addEventListeners();
    }

    addEventListeners() {
        this.on('ws-connected', ([uid, url]) => {
            // TODO: store connection_established_at timestamp. Connections are dropped after 24 hours.
            console.info(`Connected to Binance WebSocket. URL: ${url}. UID: ${uid}.`);
        });

        this.on('ws-message', message => {
            // TODO: storage
            // TODO: error handling
            this.handleMessage(message);
        });

        this.on('ws-error', error => {
            // TODO: error handling
            console.error('Received error from websocket: ', error);
        });

        this.on('ws-close', () => {
            console.warn('WebSocket connection closed');
            if (!this.keepAlive) return;
            console.info('Reconnecting...');
            if (this.webSocket?.readyState === this.WebSocketClass.CLOSED) {
                this.connect().then();
            }
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
            case ('ping'):
                this.emit('ws-pong');
                break;
            case ('account.status'):
                const { result: { balances: _balances } } = response;
                break;
            case ('userDataStream.start'):
                const { result: { listenKey: listenKey } } = response;
                this.listenKey = listenKey;
                this.emit('listen-key-ready', listenKey);
                break;
            case ('order.place'):
                break;
            default:
                console.warn(`Received response for unknown request method ${request.method}`);
                return;
        }
    }

    ping() {
        return this.send('ping', {}, false);
    }

    getAccountStatus() {
        return this.send('account.status', {
            timestamp: new Date().getTime(),
        }, true);
    }

    placeOrder(params) {
        return this.send('order.place', params, true);
    }
}

export default BinanceWebSocket;
