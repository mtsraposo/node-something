import WebSocketSupervisor from '../../../clients/WebSocketSupervisor.js';
import { BINANCE_WEBSOCKET_API_URL } from './constants.js';
import BinanceRequest from '../../../models/requests/BinanceRequest.js';
import { serializePrivateKey } from '../../utils.js';

class BinanceStreamSupervisor extends WebSocketSupervisor {
    constructor(WebSocketClass, apiKey, privateKeyPath) {
        super(WebSocketClass);
        this.apiKey = apiKey;
        this.privateKey = serializePrivateKey(privateKeyPath);

        // TODO: move to a database?
        this.requests = new Map();
        this.webSocket = null;
    }

    // TODO: send unsolicited pong frames to avoid disconnection
    connect(onConnect = function() {}) {
        this.webSocket = this.setupWebSocket(BINANCE_WEBSOCKET_API_URL);
        return this.connectionPromise(onConnect);
    }

    send(method, params, signed) {
        console.log(`Sending ${method}`);
        const request = new BinanceRequest(this.apiKey, this.privateKey, method, params, signed);
        console.log(`Request: ${JSON.stringify(request)}`);
        if (!request.isValid) {
            this.handleErrors(request);
            return;
        }
        this.requests.set(request.id, request.body);
        this.webSocket.send(JSON.stringify(request.body));
    }

    handleErrors(request) {
        console.error(`Request failed with errors ${JSON.stringify(request.errors)}`);
    }

    close() {
        if (this.webSocket?.readyState === this.WebSocketClass.OPEN) {
            this.webSocket.close();
        }
        console.info(`The websocket connection is not closed. State: ${this.webSocket?.readyState}`);
    }
}

export default BinanceStreamSupervisor;