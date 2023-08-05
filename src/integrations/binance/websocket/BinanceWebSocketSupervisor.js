import WebSocketSupervisor from 'src/clients/WebSocketSupervisor';
import BinanceRequest from 'src/clients/requests/BinanceRequest';
import logger from 'src/logger';

class BinanceWebSocketSupervisor extends WebSocketSupervisor {
    constructor({ url, WebSocketClass, auth, keepAlive }) {
        super(WebSocketClass);
        this.url = url;
        this.auth = auth;
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
            ...this.auth,
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
