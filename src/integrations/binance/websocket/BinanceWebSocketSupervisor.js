import WebSocketSupervisor from '#root/src/clients/WebSocketSupervisor.js';
import BinanceRequest from '#root/src/models/requests/BinanceRequest.js';
import { serializePrivateKey } from '#root/src/models/requests/auth.js';
import logger from '#root/src/logger.js';

class BinanceWebSocketSupervisor extends WebSocketSupervisor {
    constructor(url, WebSocketClass, apiKey, privateKeyPath, keepAlive) {
        super(WebSocketClass);
        this.url = url;
        this.apiKey = apiKey;
        this.privateKey = serializePrivateKey(privateKeyPath);
        this.keepAlive = keepAlive;

        this.requests = new Map();
        this.webSocket = null;
    }

    addConnectionEventListeners() {
        this.on('ws-connected', ([uid, url]) => {
            logger.info(`Connected to Binance WebSocket. URL: ${url}. UID: ${uid}.`);
        });

        this.on('ws-close', () => {
            logger.warn('WebSocket connection closed');
            if (!this.keepAlive) return;
            logger.info('Reconnecting...');
            if (this.webSocket?.readyState === this.WebSocketClass.CLOSED) {
                this.connect().then();
            }
        });
    }

    connect() {
        if (this.webSocket?.readyState === this.WebSocketClass.OPEN) {
            return Promise.resolve('Already connected');
        }
        this.addConnectionEventListeners();
        this.webSocket = this.setupWebSocket(this.url);
        return this.connectionPromise();
    }

    close() {
        if (!this.webSocket) {
            return Promise.resolve('not-started');
        }

        if (this.webSocket?.readyState === this.WebSocketClass.OPEN) {
            this.webSocket.close();
            return this.closePromise();
        }
        logger.info(`
            Attempted to close websocket connection with UID: ${this.webSocketUid}
            and URL: ${this.webSocket.url},
            but the connection is not open. 
            State: ${this.webSocket?.readyState}
        `);
        return Promise.resolve('skipped');
    }

    send(method, params, signed) {
        const request = new BinanceRequest(method, params, {
            apiKey: this.apiKey,
            privateKey: this.privateKey,
            signed,
        });
        if (!request.isValid) {
            this.handleErrors(request);
            return request.id;
        }
        this.requests.set(request.id, request.body);
        this.webSocket.send(JSON.stringify(request.body));
        return request.id;
    }

    handleErrors(request) {
        logger.error(`Request failed with errors ${JSON.stringify(request.errors)}`);
    }

    ping() {
        return this.send('ping', {}, false);
    }

    getAccountStatus() {
        return this.send(
            'account.status',
            {
                timestamp: new Date().getTime(),
            },
            true,
        );
    }

    placeOrder(params) {
        return this.send('order.place', params, true);
    }
}

export default BinanceWebSocketSupervisor;
