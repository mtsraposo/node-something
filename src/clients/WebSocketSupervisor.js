import EventEmitter from 'events';

class WebSocketSupervisor extends EventEmitter {
    constructor(WebSocketClass) {
        super();
        this.WebSocketClass = WebSocketClass;
    }

    setupWebSocket(url) {
        const webSocket = new this.WebSocketClass(url);

        webSocket.on('open', () => {
            this.emit('ws-connected', url);
        });

        webSocket.on('message', (data, _isBinary) => {
            const message = JSON.parse(data);
            this.emit('ws-message', message);
        });

        webSocket.on('error', error => {
            this.emit('ws-error', error);
        });

        webSocket.on('close', (_code, _reason) => {
            console.info('Received WebSocket close event');
            this.emit('ws-close');
        });

        return webSocket;
    }
}

export default WebSocketSupervisor;