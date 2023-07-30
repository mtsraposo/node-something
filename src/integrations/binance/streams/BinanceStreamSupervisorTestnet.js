import BinanceSpotApi from '#root/src/integrations/binance/spot/BinanceSpotApi.js';
import { v4 as uuidv4 } from 'uuid';
import BinanceStream from '#root/src/integrations/binance/streams/BinanceStream.js';

class BinanceStreamTestnet extends BinanceStream {
    constructor(props) {
        super(props);

        this.binanceSpotApi = new BinanceSpotApi({});
    }

    startUserDataStream() {
        const connectionPromise = this.binanceSpotApi
            .request('post', 'userDataStream', {}, false)
            .then(({ listenKey }) => {
                this.connectUserDataStream(listenKey);
            });

        return {
            requestId: uuidv4(),
            connectionPromise,
        };
    }
}

export default BinanceStreamTestnet;
