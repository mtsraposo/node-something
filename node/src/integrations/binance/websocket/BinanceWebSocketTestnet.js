import BinanceSpotApi from 'src/integrations/binance/spot/BinanceSpotApi';
import BinanceWebSocket from 'src/integrations/binance/websocket/BinanceWebSocket';

class BinanceWebSocketTestnet extends BinanceWebSocket {
    constructor({ spotApiProps = {}, webSocketProps = {} }) {
        super(webSocketProps);

        this.binanceSpotApi = new BinanceSpotApi(spotApiProps);
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
