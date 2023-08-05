import BinanceSpotApi from 'src/integrations/binance/spot/BinanceSpotApi';
import { v4 as uuidv4 } from 'uuid';
import BinanceStream from 'src/integrations/binance/streams/BinanceStream';

class BinanceStreamTestnet extends BinanceStream {
    constructor(props) {
        super(props);

        this.binanceSpotApi = new BinanceSpotApi({});
    }

    startUserDataStream() {
        const connectionPromise = this.binanceSpotApi
            .request('post', 'userDataStream', {}, false)
            .then((response) => {
                this.connectUserDataStream(response?.data?.listenKey);
            });

        return {
            requestId: uuidv4(),
            connectionPromise,
        };
    }
}

export default BinanceStreamTestnet;
