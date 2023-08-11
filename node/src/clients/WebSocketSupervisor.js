import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import logger from 'src/logger';

class WebSocketSupervisor extends EventEmitter {
    constructor(WebSocketClass) {
        super();
        this.WebSocketClass = WebSocketClass;
        this.webSocketUid = uuidv4();
    }

    setupWebSocket(url) {
        const webSocket = new this.WebSocketClass(url);

        webSocket.on('open', () => {
            this.emit('ws-connected', [this.webSocketUid, webSocket.url]);
        });

        webSocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.emit('ws-message', message);
        });

        webSocket.on('error', (error) => {
            this.emit('ws-error', error);
        });

        webSocket.on('close', (_code, _reason) => {
            logger.info(
                `Received WebSocket close event. URL: ${webSocket.url}. UID: ${this.webSocketUid}.`,
            );
            this.emit('ws-close', [this.webSocketUid, webSocket.url]);
        });

        return webSocket;
    }

    connectionPromise() {
        return new Promise((resolve, _reject) => {
            this.on('ws-connected', () => {
                resolve('connected');
            });
        });
    }

    closePromise() {
        return new Promise((resolve, _reject) => {
            this.on('ws-close', ([_uid, _url]) => {
                resolve('closed');
            });
        });
    }
}

export default WebSocketSupervisor;
