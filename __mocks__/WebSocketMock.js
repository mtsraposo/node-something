class WebSocketMock {
    constructor() {
        this.eventMap = {};
    }

    on(event, callback) {
        this.eventMap[event] = callback;
    }

    mockTriggerEvent(event, args) {
        if (Object.keys(this.eventMap).includes(event)) {
            this.eventMap[event](...args);
        }
    }

    close() {}
}

export { WebSocketMock };