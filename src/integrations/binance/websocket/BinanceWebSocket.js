import WebSocket from 'ws';
import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';
import logger from '#root/src/logger.js';
import { env } from '#root/src/env.js';
import { BINANCE_WEBSOCKET_API_URL } from '#root/src/integrations/binance/websocket/constants.js';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor({
        url = BINANCE_WEBSOCKET_API_URL,
        WebSocketClass = WebSocket,
        auth = env.binance.auth.ed25519,
        keepAlive = true,
    }) {
        super({ url, WebSocketClass, auth, keepAlive });

        this.addEventListeners();
    }

    addEventListeners() {
        this.on('ws-message', (message) => {
            this.handleMessage(message);
        });

        this.on('ws-error', (error) => {
            logger.error('Received error from websocket: ', error);
        });
    }

    handleMessage(message) {
        const outgoingRequest = this.requests.get(message.id);
        if (outgoingRequest) {
            this.handleResponse(outgoingRequest, message);
        } else {
            logger.error(`Received unknown message type ${JSON.stringify(message)}`);
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
                logger.warn(`Received response for unknown request method ${request.method}`);
        }
    }
}

export default BinanceWebSocket;
