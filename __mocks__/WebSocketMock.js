class WebSocketMock {
    constructor() {
        this.eventMap = {};
        this.pongResponse = {
            status: 200,
            result: {},
            rateLimits: [
                {
                    'rateLimitType': 'REQUEST_WEIGHT',
                    'interval': 'MINUTE',
                    'intervalNum': 1,
                    'limit': 1200,
                    'count': 1,
                },
            ],
        };
    }

    on(event, callback) {
        this.eventMap[event] = callback;
    }

    mockTriggerEvent(event, args) {
        if (Object.keys(this.eventMap).includes(event)) {
            this.eventMap[event](...args);
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