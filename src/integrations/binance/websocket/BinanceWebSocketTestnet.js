import BinanceSpotApi from '#root/src/integrations/binance/spot/BinanceSpotApi.js';
import BinanceWebSocket from '#root/src/integrations/binance/websocket/BinanceWebSocket.js';

class BinanceWebSocketTestnet extends BinanceWebSocket {
    constructor(props) {
        super(props);

        this.binanceSpotApi = new BinanceSpotApi({});
    }

    placeOrder(params) {
        this.binanceSpotApi
            .request('post', 'order', params, true)
            .then((response) => {
                this.requests.set(response?.requestId, { method: 'order.place' });
                this.emit('ws-message', {
                    id: response?.requestId,
                    status: 200,
                    result: response,
                });
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log('Request URL:', error.request.url);
                    console.log('Request Method:', error.request.method);
                } else {
                    console.log('Error', error.message);
                }
                console.log(error.config);
            });
    }
}

export default BinanceWebSocketTestnet;
