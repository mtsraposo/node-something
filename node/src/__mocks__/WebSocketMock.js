import EventEmitter from 'events';
import { ADDITIONAL_RESULTS_BY_METHOD, RATE_LIMITS_BY_METHOD } from 'src/__mocks__/constants';
import { logger } from 'src/logger';

class WebSocketMock extends EventEmitter {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
        super();
        this.url = url;
        this.eventMap = {};
        this.readyState = WebSocketMock.CLOSED;
        this.on = (event, callback) => {
            logger.info('registering event', event);
            this.eventMap[event] = callback;
        };
        this.connectionTimeout = setTimeout(() => {
            this.mockTriggerEvent('open', []);
            this.connectionTimeout = null;
        }, 500);
        this.closeTimeout = null;
    }

    mockTriggerEvent(event, args) {
        if (Object.keys(this.eventMap).includes(event)) {
            this.eventMap[event](...args);
            switch (event) {
                case 'open':
                    this.readyState = WebSocketMock.OPEN;
                    break;
                case 'close':
                    this.readyState = WebSocketMock.CLOSED;
                    break;
                default:
                    break;
            }
        }
    }

    close() {
        this.closeTimeout = setTimeout(() => {
            this.mockTriggerEvent('close', [1000, 'Normal closure']);
            this.closeTimeout = null;
        }, 500);
    }

    send(message) {
        const payload = JSON.parse(message);
        const response = this._mockResponse(payload);
        let mockEventTimeout = setTimeout(() => {
            this.mockTriggerEvent('message', [
                JSON.stringify({
                    id: payload.id,
                    status: 200,
                    ...response,
                }),
            ]);
            mockEventTimeout = null;
        }, 200);
        return payload.id;
    }

    _mockResponse(payload) {
        switch (payload.method) {
            case 'ping':
                return {
                    result: {},
                    rateLimits: RATE_LIMITS_BY_METHOD.get('ping'),
                };
            case 'order.place':
                return {
                    result: {
                        symbol: payload.params.symbol,
                        transactTime: payload.params.timestamp,
                        ...ADDITIONAL_RESULTS_BY_METHOD.get('order.place'),
                    },
                    rateLimits: RATE_LIMITS_BY_METHOD.get('order.place'),
                };
            case 'account.status':
                return {
                    result: ADDITIONAL_RESULTS_BY_METHOD.get('account.status'),
                    rateLimits: RATE_LIMITS_BY_METHOD.get('account.status'),
                };
            case 'userDataStream.start':
                return {
                    result: ADDITIONAL_RESULTS_BY_METHOD.get('userDataStream.start'),
                    rateLimits: RATE_LIMITS_BY_METHOD.get('userDataStream.start'),
                };
            default:
                return {
                    result: {},
                    rateLimits: [],
                };
        }
    }
}

export default WebSocketMock;
