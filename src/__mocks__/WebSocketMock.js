import EventEmitter from 'events';

class WebSocketMock extends EventEmitter {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor() {
        super();
        this.eventMap = {};
        this.readyState = WebSocketMock.CLOSED;
        this.on = (event, callback) => {
            this.eventMap[event] = callback;
        };
    }

    mockTriggerEvent(event, args) {
        if (Object.keys(this.eventMap).includes(event)) {
            this.eventMap[event](...args);
            switch (event) {
                case ('open'):
                    this.readyState = WebSocketMock.CONNECTING;
                    break;
                case ('close'):
                    this.readyState = WebSocketMock.CLOSED;
                    break;
                default:
                    break;
            }
        }
    }

    close() {
    }

    send(message) {
        const data = JSON.parse(message);
        if (data.method === 'ping') {
            this.pongResponse.id = data?.id;
            this.mockTriggerEvent('message',
                [
                    JSON.stringify(this.pongResponse),
                ]);
        }
    }
}

export { WebSocketMock };