import {jest} from '@jest/globals';

const WebSocketMock = jest.fn().mockImplementation(() => {
    return {
        on: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
    }
});

jest.unstable_mockModule('ws', async () => {
    return {
        default: WebSocketMock
    };
})

const WebSocket = (await import('ws')).default;
const BinanceIntegration = (await import("src/integrations/binance.js")).default;

describe('BinanceIntegration', () => {
    const testWebsocketUrl = 'wss://localhost:1234';

    let binance;
    let mockWebSocket;

    beforeEach(async () => {
        mockWebSocket = new WebSocket(testWebsocketUrl);
        binance = new BinanceIntegration();
    });

    afterEach(() => {
        binance.closeWebsocket();
        jest.clearAllMocks();
    })

    it('connects to the websocket', async () => {
        await binance.connectWebSocket();
        expect(WebSocket).toHaveBeenCalledTimes(1);
        expect(WebSocketMock).toHaveBeenCalledWith(testWebsocketUrl);
    })
})