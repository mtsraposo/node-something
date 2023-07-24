import WebSocket from 'ws';
import BinanceWebSocketSupervisor from './BinanceWebSocketSupervisor.js';
import { BINANCE_STREAMS } from './constants.js';

class BinanceWebSocket extends BinanceWebSocketSupervisor {
    constructor(
        WebSocketClass = WebSocket,
        streamNames = BINANCE_STREAMS,
        stayUp = true,
    ) {
        super(WebSocketClass, streamNames);
        this.stayUp = stayUp;
        this.addEventListeners();
    }

    addEventListeners() {
        this.on('ws-connected', url => {
            // TODO: store connection_established_at timestamp. Connections are dropped after 24 hours.
            console.info(`Connected to Binance WebSocket at url: ${url}`);
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
            if (!this.stayUp) return;
            console.info('Reconnecting...');
            if (this.webSocket?.readyState === this.WebSocketClass.CLOSED) {
                this.connectWebSocket().then();
            }
            if (this.webSocketStreams?.readyState === this.WebSocketClass.CLOSED) {
                this.connectWebSocketStreams().then();
            }
        });
    }

    handleMessage(message) {
        const outgoingRequest = this.requests.get(message.id);
        if (outgoingRequest) {
            this.handleResponse(outgoingRequest, message);
        } else if (message?.stream) {
            this.handleStreamPayload(message.data);
        } else if (message?.e) {
            this.handleStreamPayload(message);
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
                console.info(`Received response ${JSON.stringify(response)}\n Request: ${JSON.stringify(request)}`);
                const { result: { balances: balances } } = response;
                console.info(`Received balances ${JSON.stringify(balances)}`);
                break;
            default:
                console.warn(`Received response for unknown request method ${request.method}`);
                return;
        }
    }

    handleStreamPayload(payload) {
        if (payload?.e?.includes('Ticker')) {
            this.handleTickerUpdate(payload);
        } else {
            console.error(`Received unknown stream payload ${JSON.stringify(payload)}`);
        }
    }

    handleTickerUpdate(data) {
        const { e: eventType, s: symbol, c: lastPrice, w: averagePrice } = data;
        console.info('- Received ticker update');
        console.info('--- ', eventType, symbol, lastPrice, averagePrice);
    }
}

export default BinanceWebSocket;
