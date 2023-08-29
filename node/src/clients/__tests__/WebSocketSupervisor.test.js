import WebSocketSupervisor from '../WebSocketSupervisor';
import { WebSocketMock } from 'src/__mocks__';

describe('WebSocketSupervisor', () => {
    let webSocketSupervisor;
    let webSocket;

    beforeEach(() => {
        webSocketSupervisor = new WebSocketSupervisor(WebSocketMock);
    });

    afterEach(() => {
        webSocket.close();
    });

    it('sets up a new websocket connection with event handlers', async () => {
        webSocket = webSocketSupervisor.setupWebSocket('wss://');
        await expect(webSocketSupervisor.connectionPromise()).resolves.toBe('connected');
    });
});
