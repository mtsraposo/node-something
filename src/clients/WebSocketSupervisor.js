import EventEmitter from 'events';

class WebSocketSupervisor extends EventEmitter {
    constructor(WebSocketClass) {
        super();
        this.WebSocketClass = WebSocketClass;
    }

    setupWebSocket(url) {
        const websocket = new this.WebSocketClass(url);

        websocket.on('open', () => {
            this.emit('ws-connected', url);
        });

        websocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.emit('ws-message', message);
        });

        websocket.on('error', error => {
            this.emit('ws-error', error);
        });

        websocket.on('close', (_closeEvent, _reason) => {
            this.emit('ws-close');
        });

        return websocket;
    }
}

export default WebSocketSupervisor;