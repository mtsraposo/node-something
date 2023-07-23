import EventEmitter from 'events';

class WebSocketSupervisor extends EventEmitter {
    constructor(WebSocketClass) {
        super();
        this.WebSocketClass = WebSocketClass;
    }

    setupWebSocket(url) {
        const websocket = new this.WebSocketClass(url);

        websocket.on('open', () => {
            this.emit('connected', url);
        });

        websocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.handleMessage(message);
        });

        websocket.on('error', error => {
            this.emit('error', error);
        });

        websocket.on('close', (_closeEvent, _reason) => {
            this.emit('close');
        });

        return websocket;
    }
}

export default WebSocketSupervisor;