import EventEmitter from 'events';
import logger from 'src/logger';

class WebSocketServerSupervisor extends EventEmitter {
    constructor(WebSocketServerClass, HttpServerClass, webSocketServerPort) {
        super();
        this.WebSocketServerClass = WebSocketServerClass;
        this.HttpServerClass = HttpServerClass;
        this.webSocketServerPort = webSocketServerPort;

        this.httpServer = null;
    }

    setupWebSocketServer() {
        this.createHttpServer();

        const webSocketServer = new this.WebSocketServerClass({ server: this.httpServer });
        this.addWebSocketServerEventListeners(webSocketServer);

        this.httpServer.listen(this.webSocketServerPort, () => {
            this.emit('http-server-listening', this.httpServer.address());
        });

        return webSocketServer;
    }

    createHttpServer() {
        this.httpServer = this.HttpServerClass.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('WebSocket server running');
        });

        this.httpServer.on('error', (error) => {
            this.emit('http-server-error', error);
        });
    }

    addWebSocketServerEventListeners(webSocketServer) {
        webSocketServer.on('connection', (socket) => {
            this.emit('wss-connected');
            this.addSocketEventListeners(socket);
        });

        webSocketServer.on('error', (error) => {
            this.emit('wss-error', error);
        });

        webSocketServer.on('wsClientError', (error, socket, request) => {
            this.emit('wss-client-error', error, socket, request);
        });

        webSocketServer.on('close', () => {
            logger.info(`Received WSS close event.`);
            this.emit('wss-close');
        });
    }

    addSocketEventListeners(socket) {
        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.emit('wss-socket-message', message);
            } catch (error) {
                logger.error(`Error parsing websocket server message: ${error}`);
            }
        });

        socket.on('error', (error) => {
            this.emit('wss-socket-error', error);
        });

        socket.on('close', (_code, _reason) => {
            const remoteAddress = socket._socket.remoteAddress;
            logger.info(`Received wss-socket close event. Remote address: ${remoteAddress}.`);
            this.emit('wss-socket-close', remoteAddress);
        });
    }

    connectionPromise() {
        return new Promise((resolve, _reject) => {
            this.on('wss-connected', () => {
                resolve('connected');
            });
        });
    }

    closePromise() {
        return new Promise((resolve, _reject) => {
            this.on('wss-close', ([_uid, _url]) => {
                resolve('closed');
            });
        });
    }

    closeHttpServer() {
        if (this.httpServer) {
            this.httpServer.close();
        }
    }
}

export default WebSocketServerSupervisor;
