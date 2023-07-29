import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';

class WebSocketSupervisor extends EventEmitter {
    constructor(WebSocketClass) {
        super();
        this.WebSocketClass = WebSocketClass;
        this.uid = uuidv4();
        this.url = null;
    }

    setupWebSocket(url) {
        const webSocket = new this.WebSocketClass(url);
        this.url = url;
        webSocket.uid = this.uid;
        webSocket.url = this.url;

        webSocket.on('open', () => {
            this.emit('ws-connected', [this.uid, this.url]);
        });

        webSocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.emit('ws-message', message);
        });

        webSocket.on('error', error => {
            this.emit('ws-error', error);
        });

        webSocket.on('close', (_code, _reason) => {
            console.info(`Received WebSocket close event. URL: ${this.url}. UID: ${this.uid}.`);
            this.emit('ws-close', [this.uid, this.url]);
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
            this.on('ws-close', () => {
                console.log('received ws-close');
                resolve('closed');
            });
        });
    }
}

export default WebSocketSupervisor;