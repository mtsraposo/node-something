import WebSocketSupervisor from '../WebSocketSupervisor.js';
import { WebSocketMock } from '../../__mocks__/WebSocketMock.js';

describe('WebSocketSupervisor', () => {
    let webSocketSupervisor;
    let webSocket;

    beforeEach(() => {
        webSocketSupervisor = new WebSocketSupervisor(WebSocketMock);
    });

    afterEach(() => {
        webSocket.destroy();
    })

    it('sets up a new websocket connection with event handlers', async () => {
        webSocket = webSocketSupervisor.setupWebSocket('wss://');
        await expect(webSocketSupervisor.connectionPromise()).resolves.toBe('connected');
    });
});
