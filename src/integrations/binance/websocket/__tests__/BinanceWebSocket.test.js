describe('BinanceWebSocket', () => {
    // it('connects to websocket streams', async () => {
    //     await connectWebSocketStreams();
    // });
    //
    // it('receives messages on websocket streams', async () => {
    //     await connectWebSocketStreams();
    //     const spy = jest.spyOn(binance, 'handleTickerUpdate');
    //     const mockMessage = { stream: 'btcusdt@ticker', data: mockData };
    //     binance.webSocketStreams.mockTriggerEvent('message', [JSON.stringify(mockMessage)]);
    //     expect(spy).toHaveBeenCalledWith(mockData);
    // });
    //
    // it('checks websocket connectivity', async () => {
    //     await connectWebSocket();
    //     const spy = jest.spyOn(binance, 'handleMessage');
    //     binance.checkConnectivity();
    //     expect(spy).toHaveBeenCalledWith(binance.webSocket.pongResponse);
    // });
    //
    // it('keeps connections open when keepAlive is true', async () => {
    //     binance = new BinanceWebSocket(BinanceWebSocketMock, streamNames, true);
    //     console.warn = jest.fn();
    //     const connectWebSocketSpy = jest.spyOn(binance, 'connectWebSocket');
    //     await connectWebSocket();
    //     await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
    //     binance.webSocket.mockTriggerEvent('close', [1000, 'Normal closure']);
    //     await expect(connectWebSocketSpy).toHaveBeenCalledTimes(1);
    //     expect(console.warn.mock.calls).toHaveLength(1);
    // });
});